
-- Create security_alerts_ingest table for CSE cybersecurity alerts
CREATE TABLE public.security_alerts_ingest (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  pub_date TIMESTAMP WITH TIME ZONE,
  summary TEXT,
  link TEXT,
  source TEXT NOT NULL DEFAULT 'CSE',
  category TEXT NOT NULL DEFAULT 'cybersecurity',
  location TEXT DEFAULT 'Global',
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for common queries
CREATE INDEX idx_security_alerts_pub_date ON public.security_alerts_ingest(pub_date);
CREATE INDEX idx_security_alerts_category ON public.security_alerts_ingest(category);
CREATE INDEX idx_security_alerts_location ON public.security_alerts_ingest(location);
CREATE INDEX idx_security_alerts_source ON public.security_alerts_ingest(source);

-- Update the existing Canadian Cyber Security Centre source
UPDATE public.alert_sources 
SET 
  api_endpoint = 'https://cyber.gc.ca/webservice/en/rss/alerts',
  source_type = 'security-rss',
  polling_interval = 600,
  updated_at = now(),
  description = 'Canadian Cyber Security Centre (CSE) RSS alerts feed'
WHERE name = 'Canadian Cyber Security Centre';

-- If the source doesn't exist, create it
INSERT INTO public.alert_sources (name, description, source_type, api_endpoint, polling_interval, is_active)
SELECT 
  'Canadian Cyber Security Centre',
  'Canadian Cyber Security Centre (CSE) RSS alerts feed',
  'security-rss',
  'https://cyber.gc.ca/webservice/en/rss/alerts',
  600,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.alert_sources WHERE name = 'Canadian Cyber Security Centre'
);
