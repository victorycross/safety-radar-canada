
-- Drop the existing trigger and function that are causing conflicts
DROP TRIGGER IF EXISTS update_province_alert_after_incident_change ON public.incidents;
DROP FUNCTION IF EXISTS public.update_province_alert_level() CASCADE;

-- Phase 1: Fix Data Foundation (Final Fix)
-- Populate the provinces table with all Canadian provinces and territories

INSERT INTO public.provinces (name, code, alert_level, employee_count) VALUES
('Alberta', 'AB', 'normal', 15420),
('British Columbia', 'BC', 'normal', 23150),
('Manitoba', 'MB', 'normal', 5890),
('New Brunswick', 'NB', 'normal', 3420),
('Newfoundland and Labrador', 'NL', 'normal', 2180),
('Northwest Territories', 'NT', 'normal', 220),
('Nova Scotia', 'NS', 'normal', 4350),
('Nunavut', 'NU', 'normal', 180),
('Ontario', 'ON', 'normal', 45200),
('Prince Edward Island', 'PE', 'normal', 890),
('Quebec', 'QC', 'normal', 32100),
('Saskatchewan', 'SK', 'normal', 4750),
('Yukon', 'YT', 'normal', 150)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  employee_count = EXCLUDED.employee_count,
  updated_at = now();

-- Create the corrected function for updating province alert levels
CREATE OR REPLACE FUNCTION update_province_alert_level_on_incident()
RETURNS TRIGGER AS $$
BEGIN
  -- Update province alert level based on highest severity incident
  UPDATE public.provinces 
  SET alert_level = (
    SELECT CASE 
      WHEN COUNT(*) FILTER (WHERE alert_level = 'severe') > 0 THEN 'severe'
      WHEN COUNT(*) FILTER (WHERE alert_level = 'warning') > 0 THEN 'warning'
      ELSE 'normal'
    END
    FROM public.incidents 
    WHERE province_id = NEW.province_id
  ),
  updated_at = now()
  WHERE id = NEW.province_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_update_province_alert_level
  AFTER INSERT OR UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION update_province_alert_level_on_incident();

-- Add some sample incidents to test the system
INSERT INTO public.incidents (
  title, 
  description, 
  province_id, 
  alert_level, 
  source, 
  verification_status,
  confidence_score,
  severity_numeric
) VALUES
(
  'Network Security Alert - Toronto Financial District',
  'Suspicious network activity detected in major financial institutions. Monitoring ongoing.',
  (SELECT id FROM public.provinces WHERE code = 'ON'),
  'warning',
  'Canadian Cyber Security Centre',
  'verified',
  0.85,
  2
),
(
  'Severe Weather Warning - Vancouver',
  'Heavy rainfall and flooding expected. Emergency services on standby.',
  (SELECT id FROM public.provinces WHERE code = 'BC'),
  'severe',
  'Environment Canada Weather',
  'verified',
  0.95,
  3
),
(
  'Infrastructure Monitoring Alert - Calgary',
  'Routine security scan detected minor vulnerabilities in public infrastructure.',
  (SELECT id FROM public.provinces WHERE code = 'AB'),
  'normal',
  'Alberta Emergency Management',
  'unverified',
  0.6,
  1
);
