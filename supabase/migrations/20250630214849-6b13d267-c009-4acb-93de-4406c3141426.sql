
-- Enhanced international hubs database infrastructure
-- Create international hubs table with improved structure
CREATE TABLE public.international_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  flag_emoji TEXT,
  alert_level TEXT DEFAULT 'normal' CHECK (alert_level IN ('normal', 'warning', 'severe')),
  employee_count INTEGER DEFAULT 0 CONSTRAINT positive_employee_count CHECK (employee_count >= 0),
  travel_warnings INTEGER DEFAULT 0 CONSTRAINT non_negative_travel_warnings CHECK (travel_warnings >= 0),
  local_incidents INTEGER DEFAULT 0 CONSTRAINT non_negative_local_incidents CHECK (local_incidents >= 0),
  coordinates POINT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create hub incidents table
CREATE TABLE public.hub_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID NOT NULL REFERENCES public.international_hubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  alert_level TEXT DEFAULT 'normal' CHECK (alert_level IN ('normal', 'warning', 'severe')),
  source TEXT DEFAULT 'manual',
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified', 'pending')),
  confidence_score DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  timestamp TIMESTAMPTZ DEFAULT now(),
  recommended_action TEXT,
  geographic_scope TEXT,
  raw_payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create hub employee locations table
CREATE TABLE public.hub_employee_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id UUID NOT NULL REFERENCES public.international_hubs(id) ON DELETE CASCADE,
  home_base_count INTEGER DEFAULT 0 CONSTRAINT non_negative_home_base CHECK (home_base_count >= 0),
  current_location_count INTEGER DEFAULT 0 CONSTRAINT non_negative_current_location CHECK (current_location_count >= 0),
  travel_away_count INTEGER DEFAULT 0 CONSTRAINT non_negative_travel_away CHECK (travel_away_count >= 0),
  updated_by TEXT DEFAULT 'system',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create performance indexes
CREATE INDEX idx_hub_incidents_hub_id ON public.hub_incidents(hub_id);
CREATE INDEX idx_hub_incidents_alert_level ON public.hub_incidents(alert_level);
CREATE INDEX idx_hub_incidents_timestamp ON public.hub_incidents(timestamp DESC);
CREATE INDEX idx_hub_employee_locations_hub_id ON public.hub_employee_locations(hub_id);
CREATE INDEX idx_international_hubs_code ON public.international_hubs(code);
CREATE INDEX idx_international_hubs_alert_level ON public.international_hubs(alert_level);
CREATE INDEX idx_international_hubs_active ON public.international_hubs(is_active) WHERE is_active = true;

-- Enable RLS on all hub tables
ALTER TABLE public.international_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hub_employee_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for international_hubs (readable by all authenticated users)
CREATE POLICY "Allow authenticated users to view international hubs"
  ON public.international_hubs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admin users to manage international hubs"
  ON public.international_hubs FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Create RLS policies for hub_incidents
CREATE POLICY "Allow authenticated users to view hub incidents"
  ON public.hub_incidents FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to create hub incidents"
  ON public.hub_incidents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow admin users to manage hub incidents"
  ON public.hub_incidents FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Create RLS policies for hub_employee_locations
CREATE POLICY "Allow authenticated users to view hub employee locations"
  ON public.hub_employee_locations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admin users to manage hub employee locations"
  ON public.hub_employee_locations FOR ALL
  TO authenticated
  USING (public.is_admin());

-- Insert seed data for existing international hubs with realistic employee counts
INSERT INTO public.international_hubs (name, country, code, flag_emoji, alert_level, travel_warnings, local_incidents, employee_count) VALUES
  ('New York', 'United States', 'nyc', '🇺🇸', 'normal', 0, 2, 450),
  ('London', 'United Kingdom', 'london', '🇬🇧', 'warning', 1, 3, 320),
  ('Hong Kong', 'China', 'hk', '🇭🇰', 'warning', 2, 1, 280),
  ('Singapore', 'Singapore', 'singapore', '🇸🇬', 'normal', 0, 0, 190),
  ('Tokyo', 'Japan', 'tokyo', '🇯🇵', 'normal', 0, 1, 150),
  ('Frankfurt', 'Germany', 'frankfurt', '🇩🇪', 'normal', 0, 0, 85),
  ('Zurich', 'Switzerland', 'zurich', '🇨🇭', 'normal', 0, 0, 95),
  ('Dubai', 'UAE', 'dubai', '🇦🇪', 'warning', 1, 2, 120),
  ('Sydney', 'Australia', 'sydney', '🇦🇺', 'normal', 0, 1, 110),
  ('Toronto Financial District', 'Canada', 'toronto-intl', '🇨🇦', 'normal', 0, 0, 200);

-- Insert corresponding employee location data for each hub
INSERT INTO public.hub_employee_locations (hub_id, home_base_count, current_location_count, travel_away_count)
SELECT 
  h.id,
  h.employee_count,
  FLOOR(h.employee_count * 0.85)::INTEGER, -- ~85% currently at location
  FLOOR(h.employee_count * 0.15)::INTEGER  -- ~15% traveling away
FROM public.international_hubs h;

-- Create function to sync hub employee totals
CREATE OR REPLACE FUNCTION public.sync_hub_totals()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
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
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Create trigger for hub employee count updates
CREATE TRIGGER sync_hub_employee_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.hub_employee_locations
  FOR EACH ROW EXECUTE FUNCTION public.sync_hub_totals();

-- Function to update hub alert level based on incidents
CREATE OR REPLACE FUNCTION public.update_hub_alert_level_on_incident()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  -- Update hub alert level based on highest severity incident
  UPDATE public.international_hubs 
  SET 
    alert_level = (
      SELECT CASE 
        WHEN COUNT(*) FILTER (WHERE alert_level = 'severe') > 0 THEN 'severe'
        WHEN COUNT(*) FILTER (WHERE alert_level = 'warning') > 0 THEN 'warning'
        ELSE 'normal'
      END
      FROM public.hub_incidents 
      WHERE hub_id = NEW.hub_id
    ),
    local_incidents = (
      SELECT COUNT(*) FROM public.hub_incidents WHERE hub_id = NEW.hub_id
    ),
    updated_at = now()
  WHERE id = NEW.hub_id;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for hub alert level updates
CREATE TRIGGER update_hub_alert_level
  AFTER INSERT OR UPDATE OR DELETE ON public.hub_incidents
  FOR EACH ROW EXECUTE FUNCTION public.update_hub_alert_level_on_incident();

-- Create function to validate hub data consistency
CREATE OR REPLACE FUNCTION public.validate_hub_data_consistency()
RETURNS TABLE(hub_name TEXT, issue_description TEXT, severity TEXT)
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  -- Check for hubs without employee location records
  SELECT 
    h.name,
    'Missing employee location record'::TEXT,
    'warning'::TEXT
  FROM public.international_hubs h
  LEFT JOIN public.hub_employee_locations hel ON h.id = hel.hub_id
  WHERE hel.id IS NULL AND h.is_active = true
  
  UNION ALL
  
  -- Check for mismatched employee counts
  SELECT 
    h.name,
    'Employee count mismatch between hub and location records'::TEXT,
    'error'::TEXT
  FROM public.international_hubs h
  JOIN public.hub_employee_locations hel ON h.id = hel.hub_id
  WHERE h.employee_count != hel.home_base_count
  
  UNION ALL
  
  -- Check for hubs with severe alert level but no recent incidents
  SELECT 
    h.name,
    'Severe alert level without recent incidents'::TEXT,
    'warning'::TEXT
  FROM public.international_hubs h
  WHERE h.alert_level = 'severe' 
    AND NOT EXISTS (
      SELECT 1 FROM public.hub_incidents hi 
      WHERE hi.hub_id = h.id 
        AND hi.created_at > now() - interval '7 days'
        AND hi.alert_level = 'severe'
    );
END;
$function$;
