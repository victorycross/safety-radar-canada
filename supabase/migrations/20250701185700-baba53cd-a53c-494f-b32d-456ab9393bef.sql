
-- Phase 1: Clean up legacy data
-- Reset British Columbia and Ontario alert levels since their incidents are archived
UPDATE public.provinces 
SET alert_level = 'normal', updated_at = now()
WHERE code IN ('BC', 'ON') AND alert_level != 'normal';

-- Update realistic employee counts for provinces with 0 or unrealistic counts
UPDATE public.provinces 
SET employee_count = CASE 
  WHEN code = 'BC' THEN 1250  -- British Columbia
  WHEN code = 'ON' THEN 2500  -- Ontario (largest province)
  WHEN code = 'AB' THEN 800   -- Alberta
  WHEN code = 'QC' THEN 1800  -- Quebec
  WHEN code = 'SK' THEN 200   -- Saskatchewan
  WHEN code = 'MB' THEN 250   -- Manitoba
  WHEN code = 'NS' THEN 180   -- Nova Scotia
  WHEN code = 'NB' THEN 150   -- New Brunswick
  WHEN code = 'NL' THEN 120   -- Newfoundland and Labrador
  WHEN code = 'PE' THEN 50    -- Prince Edward Island
  WHEN code = 'NT' THEN 40    -- Northwest Territories
  WHEN code = 'NU' THEN 30    -- Nunavut
  WHEN code = 'YT' THEN 35    -- Yukon
  ELSE employee_count
END,
updated_at = now()
WHERE employee_count = 0 OR employee_count < 10;

-- Create database trigger to automatically sync province alert levels when incidents are archived
CREATE OR REPLACE FUNCTION public.sync_province_alert_level_on_archive()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- When an incident is archived, recalculate the province alert level
  IF NEW.archived_at IS NOT NULL AND OLD.archived_at IS NULL THEN
    UPDATE public.provinces 
    SET alert_level = (
      SELECT CASE 
        WHEN COUNT(*) FILTER (WHERE alert_level = 'severe' AND archived_at IS NULL) > 0 THEN 'severe'
        WHEN COUNT(*) FILTER (WHERE alert_level = 'warning' AND archived_at IS NULL) > 0 THEN 'warning'
        ELSE 'normal'
      END
      FROM public.incidents 
      WHERE province_id = NEW.province_id
    ),
    updated_at = now()
    WHERE id = NEW.province_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for incidents table
DROP TRIGGER IF EXISTS sync_province_alert_level_on_archive ON public.incidents;
CREATE TRIGGER sync_province_alert_level_on_archive
  AFTER UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_province_alert_level_on_archive();

-- Create similar function for hub incidents
CREATE OR REPLACE FUNCTION public.sync_hub_alert_level_on_archive()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- When a hub incident is archived, recalculate the hub alert level
  IF NEW.archived_at IS NOT NULL AND OLD.archived_at IS NULL THEN
    UPDATE public.international_hubs 
    SET 
      alert_level = (
        SELECT CASE 
          WHEN COUNT(*) FILTER (WHERE alert_level = 'severe' AND archived_at IS NULL) > 0 THEN 'severe'
          WHEN COUNT(*) FILTER (WHERE alert_level = 'warning' AND archived_at IS NULL) > 0 THEN 'warning'
          ELSE 'normal'
        END
        FROM public.hub_incidents 
        WHERE hub_id = NEW.hub_id
      ),
      local_incidents = (
        SELECT COUNT(*) FROM public.hub_incidents 
        WHERE hub_id = NEW.hub_id AND archived_at IS NULL
      ),
      updated_at = now()
    WHERE id = NEW.hub_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for hub_incidents table
DROP TRIGGER IF EXISTS sync_hub_alert_level_on_archive ON public.hub_incidents;
CREATE TRIGGER sync_hub_alert_level_on_archive
  AFTER UPDATE ON public.hub_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_hub_alert_level_on_archive();
