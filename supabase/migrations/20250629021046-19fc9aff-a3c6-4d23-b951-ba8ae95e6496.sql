
-- Create weather_alerts_ingest table for Environment Canada GeoMet-OGC API data
CREATE TABLE public.weather_alerts_ingest (
  id TEXT NOT NULL PRIMARY KEY,
  geometry_coordinates JSONB,
  event_type TEXT,
  severity TEXT,
  onset TIMESTAMP WITH TIME ZONE,
  expires TIMESTAMP WITH TIME ZONE,
  description TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX idx_weather_alerts_event_type ON public.weather_alerts_ingest(event_type);
CREATE INDEX idx_weather_alerts_severity ON public.weather_alerts_ingest(severity);
CREATE INDEX idx_weather_alerts_onset ON public.weather_alerts_ingest(onset);
CREATE INDEX idx_weather_alerts_expires ON public.weather_alerts_ingest(expires);

-- Update the existing Environment Canada Weather source to use GeoMet-OGC API
UPDATE public.alert_sources 
SET 
  api_endpoint = 'https://api.weather.gc.ca/collections/alerts-fc/items',
  source_type = 'weather-geocmet',
  polling_interval = 300,
  updated_at = now(),
  description = 'Environment Canada GeoMet-OGC API for weather alerts'
WHERE name = 'Environment Canada Weather';

-- If the source doesn't exist, create it
INSERT INTO public.alert_sources (name, description, source_type, api_endpoint, polling_interval, is_active)
SELECT 
  'Environment Canada Weather',
  'Environment Canada GeoMet-OGC API for weather alerts',
  'weather-geocmet',
  'https://api.weather.gc.ca/collections/alerts-fc/items',
  300,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.alert_sources WHERE name = 'Environment Canada Weather'
);
