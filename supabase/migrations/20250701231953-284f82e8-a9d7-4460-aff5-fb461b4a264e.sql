
-- Phase 1: Database Reset & Architecture Fix

-- Reset all international hub employee counts to 0 (remove mock data)
UPDATE public.international_hubs 
SET employee_count = 0, updated_at = now()
WHERE employee_count > 0;

-- Create function to sync hub totals from hub employee locations
CREATE OR REPLACE FUNCTION public.sync_hub_employee_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Set context to allow the update
  PERFORM set_config('app.updating_from_trigger', 'true', true);
  
  -- Update hub employee_count based on hub employee location totals (home_base_count only)
  UPDATE public.international_hubs 
  SET 
    employee_count = (
      SELECT COALESCE(SUM(home_base_count), 0)
      FROM public.hub_employee_locations hel
      WHERE hel.hub_id = COALESCE(NEW.hub_id, OLD.hub_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.hub_id, OLD.hub_id);
  
  -- Reset context
  PERFORM set_config('app.updating_from_trigger', 'false', true);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger for hub employee locations
DROP TRIGGER IF EXISTS sync_hub_employee_totals ON public.hub_employee_locations;
CREATE TRIGGER sync_hub_employee_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.hub_employee_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_hub_employee_totals();

-- Prevent manual updates to hub employee counts (similar to provinces)
CREATE OR REPLACE FUNCTION public.prevent_manual_hub_employee_count_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Allow updates from triggers (when the trigger sets a special context)
  IF current_setting('app.updating_from_trigger', true) = 'true' THEN
    RETURN NEW;
  END IF;
  
  -- Block manual updates of employee_count
  IF OLD.employee_count IS DISTINCT FROM NEW.employee_count THEN
    RAISE EXCEPTION 'Direct updates to hub employee_count are not allowed. Use hub-level employee location management instead.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to prevent manual hub employee count updates
DROP TRIGGER IF EXISTS prevent_manual_hub_employee_count_update ON public.international_hubs;
CREATE TRIGGER prevent_manual_hub_employee_count_update
  BEFORE UPDATE ON public.international_hubs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_manual_hub_employee_count_update();

-- Create function to recalculate all hub totals
CREATE OR REPLACE FUNCTION public.recalculate_all_hub_totals()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Set context to allow the update
  PERFORM set_config('app.updating_from_trigger', 'true', true);
  
  -- Update all hub totals based on hub employee location data
  UPDATE public.international_hubs 
  SET 
    employee_count = COALESCE(hub_totals.total_employees, 0),
    updated_at = now()
  FROM (
    SELECT 
      hel.hub_id,
      SUM(hel.home_base_count) as total_employees
    FROM public.hub_employee_locations hel
    GROUP BY hel.hub_id
  ) hub_totals
  WHERE international_hubs.id = hub_totals.hub_id;
  
  -- Set hubs with no location data to 0
  UPDATE public.international_hubs 
  SET 
    employee_count = 0,
    updated_at = now()
  WHERE id NOT IN (
    SELECT DISTINCT hub_id 
    FROM public.hub_employee_locations 
    WHERE home_base_count > 0
  );
  
  -- Reset context
  PERFORM set_config('app.updating_from_trigger', 'false', true);
END;
$$;

-- Log changes to hub employee locations (similar to city locations)
CREATE OR REPLACE FUNCTION public.log_hub_location_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Only log if counts actually changed
  IF OLD.home_base_count IS DISTINCT FROM NEW.home_base_count OR
     OLD.current_location_count IS DISTINCT FROM NEW.current_location_count OR
     OLD.travel_away_count IS DISTINCT FROM NEW.travel_away_count THEN
    
    -- For now, we'll use a simple approach since we don't have a hub_location_history table
    -- This could be extended later with a proper history table
    RAISE NOTICE 'Hub location changed for hub_id %: Home Base: % -> %, Current: % -> %, Travel: % -> %',
      NEW.hub_id,
      OLD.home_base_count, NEW.home_base_count,
      OLD.current_location_count, NEW.current_location_count,
      OLD.travel_away_count, NEW.travel_away_count;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for hub location change logging
DROP TRIGGER IF EXISTS log_hub_location_change ON public.hub_employee_locations;
CREATE TRIGGER log_hub_location_change
  AFTER UPDATE ON public.hub_employee_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.log_hub_location_change();
