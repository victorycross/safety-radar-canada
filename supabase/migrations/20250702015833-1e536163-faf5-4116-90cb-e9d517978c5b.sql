
-- Fix provincial incidents synchronization and data consistency

-- Update the province alert level synchronization trigger to properly handle archived incidents
CREATE OR REPLACE FUNCTION public.sync_province_alert_level_on_archive()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- When an incident is archived or unarchived, recalculate the province alert level
  IF (NEW.archived_at IS NOT NULL AND OLD.archived_at IS NULL) OR 
     (NEW.archived_at IS NULL AND OLD.archived_at IS NOT NULL) THEN
    
    UPDATE public.provinces 
    SET 
      alert_level = (
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

-- Update the province alert level trigger for new incidents to only consider active incidents
CREATE OR REPLACE FUNCTION public.update_province_alert_level_on_incident()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Update province alert level based on active incidents only
  UPDATE public.provinces 
  SET 
    alert_level = (
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
  
  RETURN NEW;
END;
$$;

-- Create a function to fix all province alert levels based on active incidents only
CREATE OR REPLACE FUNCTION public.sync_all_province_alert_levels()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update all province alert levels based on non-archived incidents only
  UPDATE public.provinces 
  SET 
    alert_level = COALESCE(incident_levels.calculated_level, 'normal'),
    updated_at = now()
  FROM (
    SELECT 
      i.province_id,
      CASE 
        WHEN COUNT(*) FILTER (WHERE i.alert_level = 'severe') > 0 THEN 'severe'
        WHEN COUNT(*) FILTER (WHERE i.alert_level = 'warning') > 0 THEN 'warning'
        ELSE 'normal'
      END as calculated_level
    FROM public.incidents i
    WHERE i.archived_at IS NULL
    GROUP BY i.province_id
  ) incident_levels
  WHERE provinces.id = incident_levels.province_id;
  
  -- Set provinces with no active incidents to normal alert level
  UPDATE public.provinces 
  SET 
    alert_level = 'normal',
    updated_at = now()
  WHERE id NOT IN (
    SELECT DISTINCT province_id 
    FROM public.incidents 
    WHERE archived_at IS NULL
  );
END;
$$;

-- Run the synchronization function to fix existing data
SELECT public.sync_all_province_alert_levels();
