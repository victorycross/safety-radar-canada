-- Step 1: Clean up duplicate hub employee location records

-- First, let's identify and remove empty duplicate records, keeping the ones with actual data
WITH ranked_locations AS (
  SELECT 
    id,
    hub_id,
    home_base_count,
    current_location_count,
    travel_away_count,
    updated_at,
    ROW_NUMBER() OVER (
      PARTITION BY hub_id 
      ORDER BY 
        (home_base_count + current_location_count + travel_away_count) DESC,
        updated_at DESC
    ) as rn
  FROM public.hub_employee_locations
)
DELETE FROM public.hub_employee_locations 
WHERE id IN (
  SELECT id FROM ranked_locations WHERE rn > 1
);

-- Step 2: Add unique constraint to prevent future duplications
ALTER TABLE public.hub_employee_locations 
ADD CONSTRAINT hub_employee_locations_hub_id_unique UNIQUE (hub_id);

-- Step 3: Create function to get consolidated hub employee data
CREATE OR REPLACE FUNCTION public.get_hub_employee_summary(hub_uuid uuid)
RETURNS TABLE(
  hub_id uuid,
  total_home_base integer,
  total_current_location integer,
  total_travel_away integer,
  hub_total integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    hel.hub_id,
    COALESCE(hel.home_base_count, 0) as total_home_base,
    COALESCE(hel.current_location_count, 0) as total_current_location,
    COALESCE(hel.travel_away_count, 0) as total_travel_away,
    COALESCE(hel.home_base_count, 0) as hub_total
  FROM public.hub_employee_locations hel
  WHERE hel.hub_id = hub_uuid;
END;
$function$;

-- Step 4: Create data consistency validation function
CREATE OR REPLACE FUNCTION public.validate_all_hub_data_consistency()
RETURNS TABLE(
  hub_name text,
  hub_total integer,
  location_total integer,
  has_location_record boolean,
  consistency_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    h.name,
    h.employee_count,
    COALESCE(hel.home_base_count, 0) as location_total,
    (hel.id IS NOT NULL) as has_location_record,
    CASE 
      WHEN hel.id IS NULL THEN 'missing_location_record'
      WHEN h.employee_count = hel.home_base_count THEN 'consistent'
      ELSE 'inconsistent'
    END as consistency_status
  FROM public.international_hubs h
  LEFT JOIN public.hub_employee_locations hel ON h.id = hel.hub_id
  WHERE h.is_active = true
  ORDER BY h.name;
END;
$function$;

-- Step 5: Ensure all active hubs have location records
INSERT INTO public.hub_employee_locations (hub_id, home_base_count, current_location_count, travel_away_count, updated_by)
SELECT 
  h.id,
  h.employee_count,
  0,
  0,
  'migration_cleanup'
FROM public.international_hubs h
LEFT JOIN public.hub_employee_locations hel ON h.id = hel.hub_id
WHERE h.is_active = true AND hel.id IS NULL
ON CONFLICT (hub_id) DO NOTHING;

-- Step 6: Sync hub totals to ensure consistency
UPDATE public.international_hubs 
SET 
  employee_count = COALESCE(hel.home_base_count, 0),
  updated_at = now()
FROM public.hub_employee_locations hel
WHERE international_hubs.id = hel.hub_id;