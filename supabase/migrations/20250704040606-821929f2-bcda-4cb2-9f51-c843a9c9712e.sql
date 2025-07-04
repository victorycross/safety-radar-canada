-- Fix the sync_hub_totals function to set proper context flag
-- This prevents the prevent_manual_hub_employee_count_update trigger from blocking automatic updates

CREATE OR REPLACE FUNCTION public.sync_hub_totals()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Set context to allow the update
  PERFORM set_config('app.updating_from_trigger', 'true', true);
  
  -- Update hub employee_count based on employee location totals
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
$function$;