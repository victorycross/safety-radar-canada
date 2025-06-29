
-- Create cities master table
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  province_id UUID NOT NULL REFERENCES public.provinces(id) ON DELETE CASCADE,
  code TEXT NOT NULL, -- e.g., 'TOR', 'OTT', 'VAN'
  is_major_city BOOLEAN NOT NULL DEFAULT false,
  population INTEGER,
  coordinates POINT, -- For future geospatial features
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(code, province_id),
  UNIQUE(name, province_id)
);

-- Create indexes for efficient querying
CREATE INDEX idx_cities_province_id ON public.cities(province_id);
CREATE INDEX idx_cities_code ON public.cities(code);
CREATE INDEX idx_cities_major ON public.cities(is_major_city) WHERE is_major_city = true;

-- Create employee_locations table for city-level distributions
CREATE TABLE public.employee_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  province_id UUID NOT NULL REFERENCES public.provinces(id) ON DELETE CASCADE,
  home_base_count INTEGER NOT NULL DEFAULT 0,
  current_location_count INTEGER NOT NULL DEFAULT 0,
  travel_away_count INTEGER NOT NULL DEFAULT 0,
  last_updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by TEXT DEFAULT 'system',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(city_id, province_id)
);

-- Create indexes for employee_locations
CREATE INDEX idx_employee_locations_city_id ON public.employee_locations(city_id);
CREATE INDEX idx_employee_locations_province_id ON public.employee_locations(province_id);
CREATE INDEX idx_employee_locations_updated ON public.employee_locations(last_updated_at DESC);

-- Create travel_records table for active travel tracking
CREATE TABLE public.travel_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL, -- External employee ID from HR/travel system
  home_city_id UUID NOT NULL REFERENCES public.cities(id),
  current_city_id UUID REFERENCES public.cities(id),
  travel_status TEXT NOT NULL DEFAULT 'home' CHECK (travel_status IN ('home', 'traveling', 'at_destination', 'returning')),
  departure_date TIMESTAMP WITH TIME ZONE,
  return_date TIMESTAMP WITH TIME ZONE,
  travel_platform TEXT, -- 'concur', 'sap_travel', 'manual', etc.
  external_booking_id TEXT,
  emergency_contact_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for travel_records
CREATE INDEX idx_travel_records_employee_id ON public.travel_records(employee_id);
CREATE INDEX idx_travel_records_home_city ON public.travel_records(home_city_id);
CREATE INDEX idx_travel_records_current_city ON public.travel_records(current_city_id);
CREATE INDEX idx_travel_records_status ON public.travel_records(travel_status);
CREATE INDEX idx_travel_records_dates ON public.travel_records(departure_date, return_date);
CREATE INDEX idx_travel_records_platform ON public.travel_records(travel_platform);

-- Create location_history table for city-level change tracking
CREATE TABLE public.location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  home_base_count INTEGER NOT NULL,
  current_location_count INTEGER NOT NULL,
  travel_away_count INTEGER NOT NULL,
  previous_home_base_count INTEGER,
  previous_current_location_count INTEGER,
  previous_travel_away_count INTEGER,
  change_reason TEXT,
  change_type TEXT NOT NULL CHECK (change_type IN ('manual_update', 'travel_sync', 'bulk_import', 'system_reconciliation')),
  changed_by TEXT,
  data_source TEXT DEFAULT 'admin_interface',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for location_history
CREATE INDEX idx_location_history_city_id ON public.location_history(city_id);
CREATE INDEX idx_location_history_created_at ON public.location_history(created_at DESC);
CREATE INDEX idx_location_history_change_type ON public.location_history(change_type);

-- Create travel_integration_config table for platform settings
CREATE TABLE public.travel_integration_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name TEXT NOT NULL UNIQUE, -- 'concur', 'sap_travel', etc.
  is_active BOOLEAN NOT NULL DEFAULT false,
  api_endpoint TEXT,
  authentication_config JSONB,
  sync_frequency_minutes INTEGER DEFAULT 60,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'success', 'error', 'disabled')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Populate cities table with major Canadian cities (fixed syntax)
INSERT INTO public.cities (name, province_id, code, is_major_city, population) 
SELECT name, province_id, code, is_major_city, population
FROM (VALUES
  ('Toronto', (SELECT id FROM public.provinces WHERE code = 'ON'), 'TOR', true, 2794356),
  ('Ottawa', (SELECT id FROM public.provinces WHERE code = 'ON'), 'OTT', true, 1017449),
  ('Hamilton', (SELECT id FROM public.provinces WHERE code = 'ON'), 'HAM', true, 569353),
  ('London', (SELECT id FROM public.provinces WHERE code = 'ON'), 'LON', true, 432515),
  ('Kitchener', (SELECT id FROM public.provinces WHERE code = 'ON'), 'KIT', true, 256885),
  ('Montreal', (SELECT id FROM public.provinces WHERE code = 'QC'), 'MTL', true, 1762949),
  ('Quebec City', (SELECT id FROM public.provinces WHERE code = 'QC'), 'QUE', true, 549459),
  ('Laval', (SELECT id FROM public.provinces WHERE code = 'QC'), 'LAV', true, 438366),
  ('Gatineau', (SELECT id FROM public.provinces WHERE code = 'QC'), 'GAT', true, 291041),
  ('Vancouver', (SELECT id FROM public.provinces WHERE code = 'BC'), 'VAN', true, 695263),
  ('Surrey', (SELECT id FROM public.provinces WHERE code = 'BC'), 'SUR', true, 568322),
  ('Burnaby', (SELECT id FROM public.provinces WHERE code = 'BC'), 'BUR', true, 249125),
  ('Richmond', (SELECT id FROM public.provinces WHERE code = 'BC'), 'RIC', true, 209937),
  ('Calgary', (SELECT id FROM public.provinces WHERE code = 'AB'), 'CAL', true, 1336000),
  ('Edmonton', (SELECT id FROM public.provinces WHERE code = 'AB'), 'EDM', true, 1010899),
  ('Red Deer', (SELECT id FROM public.provinces WHERE code = 'AB'), 'RDE', false, 103690),
  ('Winnipeg', (SELECT id FROM public.provinces WHERE code = 'MB'), 'WIN', true, 749607),
  ('Saskatoon', (SELECT id FROM public.provinces WHERE code = 'SK'), 'SAS', true, 317480),
  ('Regina', (SELECT id FROM public.provinces WHERE code = 'SK'), 'REG', true, 230139),
  ('Halifax', (SELECT id FROM public.provinces WHERE code = 'NS'), 'HAL', true, 439819),
  ('St. Johns', (SELECT id FROM public.provinces WHERE code = 'NL'), 'STJ', true, 110525),
  ('Charlottetown', (SELECT id FROM public.provinces WHERE code = 'PE'), 'CHA', true, 36094),
  ('Fredericton', (SELECT id FROM public.provinces WHERE code = 'NB'), 'FRE', true, 63116),
  ('Moncton', (SELECT id FROM public.provinces WHERE code = 'NB'), 'MON', true, 79470),
  ('Whitehorse', (SELECT id FROM public.provinces WHERE code = 'YT'), 'WHI', true, 28201),
  ('Yellowknife', (SELECT id FROM public.provinces WHERE code = 'NT'), 'YEL', true, 20340),
  ('Iqaluit', (SELECT id FROM public.provinces WHERE code = 'NU'), 'IQA', true, 7740)
) AS cities_data(name, province_id, code, is_major_city, population)
WHERE province_id IS NOT NULL;

-- Create function to maintain province/city consistency
CREATE OR REPLACE FUNCTION sync_province_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update province employee_count based on city totals
  UPDATE public.provinces 
  SET 
    employee_count = (
      SELECT COALESCE(SUM(home_base_count), 0)
      FROM public.employee_locations el
      WHERE el.province_id = COALESCE(NEW.province_id, OLD.province_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.province_id, OLD.province_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to maintain province totals
CREATE TRIGGER sync_province_totals_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.employee_locations
  FOR EACH ROW
  EXECUTE FUNCTION sync_province_totals();

-- Create function to log location changes
CREATE OR REPLACE FUNCTION log_location_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if counts actually changed
  IF OLD.home_base_count IS DISTINCT FROM NEW.home_base_count OR
     OLD.current_location_count IS DISTINCT FROM NEW.current_location_count OR
     OLD.travel_away_count IS DISTINCT FROM NEW.travel_away_count THEN
    
    INSERT INTO public.location_history (
      city_id,
      home_base_count,
      current_location_count,
      travel_away_count,
      previous_home_base_count,
      previous_current_location_count,
      previous_travel_away_count,
      change_reason,
      change_type,
      changed_by,
      data_source
    ) VALUES (
      NEW.city_id,
      NEW.home_base_count,
      NEW.current_location_count,
      NEW.travel_away_count,
      OLD.home_base_count,
      OLD.current_location_count,
      OLD.travel_away_count,
      'Location count updated',
      'manual_update',
      NEW.updated_by,
      'admin_interface'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for logging location changes
CREATE TRIGGER log_location_change_trigger
  AFTER UPDATE ON public.employee_locations
  FOR EACH ROW
  EXECUTE FUNCTION log_location_change();

-- Enable RLS on new tables
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_integration_config ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow read access to authenticated users)
CREATE POLICY "Allow read access to cities" 
  ON public.cities 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow read access to employee locations" 
  ON public.employee_locations 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow read access to travel records" 
  ON public.travel_records 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow read access to location history" 
  ON public.location_history 
  FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow read access to travel integration config" 
  ON public.travel_integration_config 
  FOR SELECT 
  TO authenticated 
  USING (true);
