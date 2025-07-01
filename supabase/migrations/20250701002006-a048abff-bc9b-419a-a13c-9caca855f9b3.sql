
-- Add archiving columns to security_alerts_ingest table
ALTER TABLE public.security_alerts_ingest 
ADD COLUMN archived_at timestamp with time zone,
ADD COLUMN archived_by uuid REFERENCES auth.users(id),
ADD COLUMN archive_reason text;

-- Add archiving columns to weather_alerts_ingest table  
ALTER TABLE public.weather_alerts_ingest
ADD COLUMN archived_at timestamp with time zone,
ADD COLUMN archived_by uuid REFERENCES auth.users(id),
ADD COLUMN archive_reason text;

-- Add archiving columns to hub_incidents table
ALTER TABLE public.hub_incidents
ADD COLUMN archived_at timestamp with time zone,
ADD COLUMN archived_by uuid REFERENCES auth.users(id),
ADD COLUMN archive_reason text;

-- Add archiving columns to incidents table
ALTER TABLE public.incidents
ADD COLUMN archived_at timestamp with time zone,
ADD COLUMN archived_by uuid REFERENCES auth.users(id),
ADD COLUMN archive_reason text;

-- Create alert archive audit trail table
CREATE TABLE public.alert_archive_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_table text NOT NULL,
  alert_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('archive', 'unarchive', 'delete')),
  performed_by uuid REFERENCES auth.users(id) NOT NULL,
  reason text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on alert_archive_log
ALTER TABLE public.alert_archive_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for alert_archive_log (admin/power_user access)
CREATE POLICY "Admin and power users can view archive log"
  ON public.alert_archive_log
  FOR SELECT
  TO authenticated
  USING (public.is_power_user_or_admin(auth.uid()));

CREATE POLICY "Admin and power users can insert archive log"
  ON public.alert_archive_log
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_power_user_or_admin(auth.uid()));

-- Create indexes for archive queries
CREATE INDEX idx_security_alerts_archived ON public.security_alerts_ingest(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX idx_weather_alerts_archived ON public.weather_alerts_ingest(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX idx_hub_incidents_archived ON public.hub_incidents(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX idx_incidents_archived ON public.incidents(archived_at) WHERE archived_at IS NOT NULL;
CREATE INDEX idx_alert_archive_log_table_id ON public.alert_archive_log(alert_table, alert_id);
