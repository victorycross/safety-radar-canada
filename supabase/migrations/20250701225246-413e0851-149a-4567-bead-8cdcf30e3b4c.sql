
-- Phase 1: Database Architecture Fix
-- Add constraints to prevent direct province employee_count updates (except by system)
-- Create a function to block manual province employee_count updates

CREATE OR REPLACE FUNCTION prevent_manual_province_employee_count_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Allow updates from triggers (when the trigger sets a special context)
  IF current_setting('app.updating_from_trigger', true) = 'true' THEN
    RETURN NEW;
  END IF;
  
  -- Block manual updates of employee_count
  IF OLD.employee_count IS DISTINCT FROM NEW.employee_count THEN
    RAISE EXCEPTION 'Direct updates to province employee_count are not allowed. Use city-level employee location management instead.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to prevent manual province employee_count updates
DROP TRIGGER IF EXISTS prevent_manual_employee_count_update ON public.provinces;
CREATE TRIGGER prevent_manual_employee_count_update
  BEFORE UPDATE ON public.provinces
  FOR EACH ROW
  EXECUTE FUNCTION prevent_manual_province_employee_count_update();

-- Update the sync_province_totals function to set the trigger context
CREATE OR REPLACE FUNCTION public.sync_province_totals()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  -- Set context to allow the update
  PERFORM set_config('app.updating_from_trigger', 'true', true);
  
  -- Update province employee_count based on city totals (home_base_count only)
  UPDATE public.provinces 
  SET 
    employee_count = (
      SELECT COALESCE(SUM(home_base_count), 0)
      FROM public.employee_locations el
      WHERE el.province_id = COALESCE(NEW.province_id, OLD.province_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.province_id, OLD.province_id);
  
  -- Reset context
  PERFORM set_config('app.updating_from_trigger', 'false', true);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add a function to manually recalculate all province totals from city data
CREATE OR REPLACE FUNCTION public.recalculate_all_province_totals()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Set context to allow the update
  PERFORM set_config('app.updating_from_trigger', 'true', true);
  
  -- Update all province totals based on city data
  UPDATE public.provinces 
  SET 
    employee_count = COALESCE(city_totals.total_employees, 0),
    updated_at = now()
  FROM (
    SELECT 
      el.province_id,
      SUM(el.home_base_count) as total_employees
    FROM public.employee_locations el
    GROUP BY el.province_id
  ) city_totals
  WHERE provinces.id = city_totals.province_id;
  
  -- Set provinces with no city data to 0
  UPDATE public.provinces 
  SET 
    employee_count = 0,
    updated_at = now()
  WHERE id NOT IN (
    SELECT DISTINCT province_id 
    FROM public.employee_locations 
    WHERE home_base_count > 0
  );
  
  -- Reset context
  PERFORM set_config('app.updating_from_trigger', 'false', true);
END;
$$;

-- Create RLS policy for the recalculate function
CREATE POLICY "Admins can recalculate province totals" 
  ON public.provinces 
  FOR UPDATE 
  USING (is_admin())
  WITH CHECK (is_admin());
