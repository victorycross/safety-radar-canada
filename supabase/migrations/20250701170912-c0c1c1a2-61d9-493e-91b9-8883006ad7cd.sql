
-- Phase 1: Database Cleanup and Standardization

-- 1. Remove orphaned toronto_police_incidents table (no foreign key relationships)
DROP TABLE IF EXISTS public.toronto_police_incidents;

-- 2. Clean up dummy/test data from incidents table
DELETE FROM public.incidents 
WHERE source = 'test' 
   OR source = 'manual_test' 
   OR title LIKE '%test%' 
   OR title LIKE '%Test%'
   OR description LIKE '%test%'
   OR description LIKE '%dummy%';

-- 3. Clean up inconsistent "Unknown Source" incidents
DELETE FROM public.incidents 
WHERE source = 'Unknown Source' 
   OR source = 'unknown' 
   OR source = '';

-- 4. Remove test/dummy security alerts
DELETE FROM public.security_alerts_ingest 
WHERE title LIKE '%test%' 
   OR title LIKE '%Test%' 
   OR title LIKE '%dummy%'
   OR source = 'test';

-- 5. Clean up test immigration/travel announcements
DELETE FROM public.immigration_travel_announcements 
WHERE title LIKE '%test%' 
   OR title LIKE '%Test%' 
   OR title LIKE '%dummy%'
   OR source = 'test';

-- 6. Clean up test weather alerts
DELETE FROM public.weather_alerts_ingest 
WHERE id LIKE '%test%' 
   OR id LIKE '%Test%' 
   OR description LIKE '%test%'
   OR description LIKE '%dummy%';

-- 7. Reset employee counts to realistic baseline (remove extreme test values)
UPDATE public.provinces 
SET employee_count = CASE 
    -- Reset unrealistic high test values to reasonable estimates
    WHEN employee_count > 10000 THEN 
        CASE code 
            WHEN 'ON' THEN 2500  -- Ontario (largest)
            WHEN 'QC' THEN 1800  -- Quebec
            WHEN 'BC' THEN 1200  -- British Columbia
            WHEN 'AB' THEN 800   -- Alberta
            WHEN 'MB' THEN 300   -- Manitoba
            WHEN 'SK' THEN 250   -- Saskatchewan
            WHEN 'NS' THEN 200   -- Nova Scotia
            WHEN 'NB' THEN 150   -- New Brunswick
            WHEN 'NL' THEN 100   -- Newfoundland
            WHEN 'PE' THEN 50    -- Prince Edward Island
            WHEN 'YT' THEN 25    -- Yukon
            WHEN 'NT' THEN 25    -- Northwest Territories
            WHEN 'NU' THEN 15    -- Nunavut
            ELSE 100
        END
    -- Reset zero or negative values to minimum baseline
    WHEN employee_count <= 0 THEN 
        CASE code 
            WHEN 'ON' THEN 2500
            WHEN 'QC' THEN 1800
            WHEN 'BC' THEN 1200
            WHEN 'AB' THEN 800
            ELSE 100
        END
    ELSE employee_count  -- Keep reasonable existing values
END,
updated_at = now();

-- 8. Clean up test employee location records
DELETE FROM public.employee_locations 
WHERE updated_by = 'test-admin' 
   OR updated_by = 'test' 
   OR updated_by LIKE '%test%';

-- 9. Clean up test travel records
DELETE FROM public.travel_records 
WHERE travel_platform = 'test' 
   OR employee_id LIKE 'TEST%' 
   OR employee_id LIKE 'EMP00%'  -- Remove sample test employee IDs
   OR travel_platform = 'manual';

-- 10. Reset international hubs to clean baseline
UPDATE public.international_hubs 
SET 
    employee_count = CASE 
        WHEN employee_count > 1000 OR employee_count <= 0 THEN 
            CASE country 
                WHEN 'United States' THEN 150
                WHEN 'United Kingdom' THEN 100  
                WHEN 'France' THEN 75
                WHEN 'Germany' THEN 75
                WHEN 'Japan' THEN 50
                WHEN 'Australia' THEN 50
                ELSE 25
            END
        ELSE employee_count
    END,
    local_incidents = 0,  -- Reset incident counts
    travel_warnings = 0,
    updated_at = now()
WHERE employee_count > 1000 OR employee_count <= 0;

-- 11. Clean up test source configurations and health metrics
DELETE FROM public.source_health_metrics 
WHERE error_message LIKE '%test%' 
   OR error_message LIKE '%dummy%';

DELETE FROM public.alert_sources 
WHERE name LIKE '%test%' 
   OR name LIKE '%Test%' 
   OR description LIKE '%test%';

-- 12. Clean up test alert correlations and ingestion queue
DELETE FROM public.alert_correlations 
WHERE correlation_type = 'test' 
   OR correlation_type LIKE '%test%';

DELETE FROM public.alert_ingestion_queue 
WHERE processing_status = 'test' 
   OR error_message LIKE '%test%';

-- 13. Reset data sync status to clean state
DELETE FROM public.data_sync_status 
WHERE source LIKE '%test%' 
   OR message LIKE '%test%';

-- 14. Update timestamps to ensure data freshness
UPDATE public.provinces SET updated_at = now();
UPDATE public.international_hubs SET updated_at = now();
UPDATE public.cities SET updated_at = now();

-- 15. Add some basic validation constraints for data quality
-- Ensure employee counts are reasonable
ALTER TABLE public.provinces 
ADD CONSTRAINT reasonable_employee_count 
CHECK (employee_count >= 0 AND employee_count <= 50000);

ALTER TABLE public.international_hubs 
ADD CONSTRAINT reasonable_hub_employee_count 
CHECK (employee_count >= 0 AND employee_count <= 1000);

-- Ensure alert levels are valid
ALTER TABLE public.provinces 
ADD CONSTRAINT valid_alert_level 
CHECK (alert_level IN ('normal', 'warning', 'severe'));

ALTER TABLE public.international_hubs 
ADD CONSTRAINT valid_hub_alert_level 
CHECK (alert_level IN ('normal', 'warning', 'severe'));
