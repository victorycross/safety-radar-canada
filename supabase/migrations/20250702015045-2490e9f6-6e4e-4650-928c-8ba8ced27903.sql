
-- Fix hub incidents synchronization and data consistency

-- Update the hub alert level synchronization trigger to properly handle archived incidents
CREATE OR REPLACE FUNCTION public.sync_hub_alert_level_on_archive()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- When a hub incident is archived or unarchived, recalculate the hub alert level and local incidents count
  IF (NEW.archived_at IS NOT NULL AND OLD.archived_at IS NULL) OR 
     (NEW.archived_at IS NULL AND OLD.archived_at IS NOT NULL) THEN
    
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

-- Update the hub alert level trigger for new incidents to also update local_incidents count
CREATE OR REPLACE FUNCTION public.update_hub_alert_level_on_incident()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Update hub alert level and local incidents count based on active incidents only
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
  
  RETURN NEW;
END;
$$;

-- Create a function to fix all hub local_incidents counts to match active incidents
CREATE OR REPLACE FUNCTION public.sync_all_hub_incident_counts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update all hub local_incidents counts based on non-archived incidents
  UPDATE public.international_hubs 
  SET 
    local_incidents = COALESCE(incident_counts.active_count, 0),
    alert_level = COALESCE(incident_counts.alert_level, 'normal'),
    updated_at = now()
  FROM (
    SELECT 
      hi.hub_id,
      COUNT(*) as active_count,
      CASE 
        WHEN COUNT(*) FILTER (WHERE alert_level = 'severe') > 0 THEN 'severe'
        WHEN COUNT(*) FILTER (WHERE alert_level = 'warning') > 0 THEN 'warning'
        ELSE 'normal'
      END as alert_level
    FROM public.hub_incidents hi
    WHERE hi.archived_at IS NULL
    GROUP BY hi.hub_id
  ) incident_counts
  WHERE international_hubs.id = incident_counts.hub_id;
  
  -- Set hubs with no active incidents to 0 count and normal alert level
  UPDATE public.international_hubs 
  SET 
    local_incidents = 0,
    alert_level = 'normal',
    updated_at = now()
  WHERE id NOT IN (
    SELECT DISTINCT hub_id 
    FROM public.hub_incidents 
    WHERE archived_at IS NULL
  );
END;
$$;

-- Run the synchronization function to fix existing data
SELECT public.sync_all_hub_incident_counts();
