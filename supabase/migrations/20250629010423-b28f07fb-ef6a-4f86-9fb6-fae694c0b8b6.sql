
-- Phase 1: Enhanced database schema for comprehensive data ingestion

-- Create alert_sources table to track all data source configurations
CREATE TABLE IF NOT EXISTS public.alert_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL, -- 'weather', 'security', 'policy', 'emergency', 'iot'
  api_endpoint TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  polling_interval INTEGER NOT NULL DEFAULT 300, -- seconds
  last_poll_at TIMESTAMP WITH TIME ZONE,
  health_status TEXT NOT NULL DEFAULT 'unknown', -- 'healthy', 'degraded', 'error', 'unknown'
  configuration JSONB, -- store API-specific config
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create source_health_metrics table for monitoring
CREATE TABLE IF NOT EXISTS public.source_health_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES public.alert_sources(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_time_ms INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  records_processed INTEGER DEFAULT 0,
  http_status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alert_ingestion_queue for processing pipeline
CREATE TABLE IF NOT EXISTS public.alert_ingestion_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES public.alert_sources(id) ON DELETE CASCADE,
  raw_payload JSONB NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  processing_attempts INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create alert_correlations for linking related incidents
CREATE TABLE IF NOT EXISTS public.alert_correlations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  primary_incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  related_incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  correlation_type TEXT NOT NULL, -- 'geographic', 'temporal', 'semantic', 'source'
  confidence_score FLOAT NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(primary_incident_id, related_incident_id)
);

-- Create geospatial_data table for enhanced location data
CREATE TABLE IF NOT EXISTS public.geospatial_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  latitude FLOAT,
  longitude FLOAT,
  geohash TEXT,
  affected_radius_km FLOAT,
  population_impact INTEGER,
  administrative_area TEXT,
  country_code TEXT DEFAULT 'CA',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhance incidents table with new fields
ALTER TABLE public.incidents 
ADD COLUMN IF NOT EXISTS confidence_score FLOAT DEFAULT 0.5,
ADD COLUMN IF NOT EXISTS correlation_id UUID,
ADD COLUMN IF NOT EXISTS raw_payload JSONB,
ADD COLUMN IF NOT EXISTS data_source_id UUID REFERENCES public.alert_sources(id),
ADD COLUMN IF NOT EXISTS geographic_scope TEXT,
ADD COLUMN IF NOT EXISTS severity_numeric INTEGER DEFAULT 1; -- 1=normal, 2=warning, 3=severe

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_alert_sources_active ON public.alert_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_alert_sources_type ON public.alert_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_source_health_timestamp ON public.source_health_metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_source_health_source ON public.source_health_metrics(source_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_queue_status ON public.alert_ingestion_queue(processing_status);
CREATE INDEX IF NOT EXISTS idx_correlations_primary ON public.alert_correlations(primary_incident_id);
CREATE INDEX IF NOT EXISTS idx_geospatial_location ON public.geospatial_data(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_incidents_source ON public.incidents(data_source_id);
CREATE INDEX IF NOT EXISTS idx_incidents_confidence ON public.incidents(confidence_score);

-- Insert initial data sources
INSERT INTO public.alert_sources (name, description, source_type, api_endpoint, polling_interval) VALUES
('Environment Canada Weather', 'Environment Canada severe weather alerts', 'weather', 'https://weather.gc.ca/rss/warning/on_e.xml', 300),
('NOAA NWS Alerts', 'US National Weather Service CAP alerts', 'weather', 'https://api.weather.gov/alerts', 600),
('OpenWeatherMap Alerts', 'OpenWeatherMap severe weather API', 'weather', 'https://api.openweathermap.org/data/2.5/onecall', 900),
('Canadian Cyber Security Centre', 'CCCS security advisories', 'security', 'https://cyber.gc.ca/en/alerts-advisories/rss.xml', 1800),
('Ontario Emergency Management', 'Provincial emergency alerts', 'emergency', 'https://www.ontario.ca/alerts/rss', 300),
('Toronto Fire Services', 'Toronto Fire Department incidents', 'emergency', 'https://open.toronto.ca/dataset/fire-services/', 600)
ON CONFLICT DO NOTHING;

-- Create function to update source health
CREATE OR REPLACE FUNCTION public.update_source_health()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the alert_sources table with latest health status
  UPDATE public.alert_sources 
  SET 
    health_status = CASE 
      WHEN NEW.success = true THEN 'healthy'
      WHEN NEW.success = false AND NEW.http_status_code >= 500 THEN 'error'
      ELSE 'degraded'
    END,
    last_poll_at = NEW.timestamp,
    updated_at = now()
  WHERE id = NEW.source_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic health status updates
DROP TRIGGER IF EXISTS trigger_update_source_health ON public.source_health_metrics;
CREATE TRIGGER trigger_update_source_health
  AFTER INSERT ON public.source_health_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_source_health();

-- Enable RLS on new tables
ALTER TABLE public.alert_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_ingestion_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geospatial_data ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a monitoring system)
CREATE POLICY "Allow public read access to alert_sources" ON public.alert_sources FOR SELECT USING (true);
CREATE POLICY "Allow public read access to source_health_metrics" ON public.source_health_metrics FOR SELECT USING (true);
CREATE POLICY "Allow public read access to alert_ingestion_queue" ON public.alert_ingestion_queue FOR SELECT USING (true);
CREATE POLICY "Allow public read access to alert_correlations" ON public.alert_correlations FOR SELECT USING (true);
CREATE POLICY "Allow public read access to geospatial_data" ON public.geospatial_data FOR SELECT USING (true);

-- Grant necessary permissions for edge functions
GRANT ALL ON public.alert_sources TO service_role;
GRANT ALL ON public.source_health_metrics TO service_role;
GRANT ALL ON public.alert_ingestion_queue TO service_role;
GRANT ALL ON public.alert_correlations TO service_role;
GRANT ALL ON public.geospatial_data TO service_role;
