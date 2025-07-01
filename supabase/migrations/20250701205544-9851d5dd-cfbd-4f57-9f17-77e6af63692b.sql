
-- Fix RLS policies for security_alerts_ingest table
CREATE POLICY "Admin and power users can update security alerts"
  ON public.security_alerts_ingest
  FOR UPDATE
  TO authenticated
  USING (public.is_power_user_or_admin(auth.uid()))
  WITH CHECK (public.is_power_user_or_admin(auth.uid()));

CREATE POLICY "Admin and power users can view security alerts"
  ON public.security_alerts_ingest
  FOR SELECT
  TO authenticated
  USING (public.is_power_user_or_admin(auth.uid()));

-- Enable RLS on security_alerts_ingest if not already enabled
ALTER TABLE public.security_alerts_ingest ENABLE ROW LEVEL SECURITY;

-- Create bulk archive function with proper permissions
CREATE OR REPLACE FUNCTION public.bulk_archive_alerts(
  alert_table_name text,
  alert_ids text[],
  archive_reason text,
  user_id uuid DEFAULT auth.uid()
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  updated_count integer := 0;
  error_message text := '';
BEGIN
  -- Check if user has permission
  IF NOT public.is_power_user_or_admin(user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient permissions',
      'updated_count', 0
    );
  END IF;

  -- Validate table name to prevent SQL injection
  IF alert_table_name NOT IN ('security_alerts_ingest', 'weather_alerts_ingest', 'incidents', 'hub_incidents') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid table name',
      'updated_count', 0
    );
  END IF;

  BEGIN
    -- Perform bulk update based on table
    IF alert_table_name = 'security_alerts_ingest' THEN
      UPDATE public.security_alerts_ingest 
      SET 
        archived_at = now(),
        archived_by = user_id,
        archive_reason = bulk_archive_alerts.archive_reason,
        updated_at = now()
      WHERE id = ANY(alert_ids)
        AND archived_at IS NULL;
      GET DIAGNOSTICS updated_count = ROW_COUNT;
      
    ELSIF alert_table_name = 'weather_alerts_ingest' THEN
      UPDATE public.weather_alerts_ingest 
      SET 
        archived_at = now(),
        archived_by = user_id,
        archive_reason = bulk_archive_alerts.archive_reason,
        updated_at = now()
      WHERE id = ANY(alert_ids)
        AND archived_at IS NULL;
      GET DIAGNOSTICS updated_count = ROW_COUNT;
      
    ELSIF alert_table_name = 'incidents' THEN
      UPDATE public.incidents 
      SET 
        archived_at = now(),
        archived_by = user_id,
        archive_reason = bulk_archive_alerts.archive_reason,
        updated_at = now()
      WHERE id::text = ANY(alert_ids)
        AND archived_at IS NULL;
      GET DIAGNOSTICS updated_count = ROW_COUNT;
      
    ELSIF alert_table_name = 'hub_incidents' THEN
      UPDATE public.hub_incidents 
      SET 
        archived_at = now(),
        archived_by = user_id,
        archive_reason = bulk_archive_alerts.archive_reason,
        updated_at = now()
      WHERE id::text = ANY(alert_ids)
        AND archived_at IS NULL;
      GET DIAGNOSTICS updated_count = ROW_COUNT;
    END IF;

    -- Log the archive action
    INSERT INTO public.alert_archive_log (
      alert_table,
      alert_id,
      action,
      performed_by,
      reason,
      metadata
    )
    SELECT 
      alert_table_name,
      unnest(alert_ids),
      'archive',
      user_id,
      archive_reason,
      json_build_object('bulk_operation', true, 'timestamp', now())
    WHERE updated_count > 0;

    RETURN json_build_object(
      'success', true,
      'updated_count', updated_count,
      'error', null
    );

  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'updated_count', 0
    );
  END;
END;
$$;

-- Create bulk unarchive function
CREATE OR REPLACE FUNCTION public.bulk_unarchive_alerts(
  alert_table_name text,
  alert_ids text[],
  unarchive_reason text,
  user_id uuid DEFAULT auth.uid()
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result json;
  updated_count integer := 0;
BEGIN
  -- Check if user has permission
  IF NOT public.is_power_user_or_admin(user_id) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient permissions',
      'updated_count', 0
    );
  END IF;

  -- Validate table name
  IF alert_table_name NOT IN ('security_alerts_ingest', 'weather_alerts_ingest', 'incidents', 'hub_incidents') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid table name',
      'updated_count', 0
    );
  END IF;

  BEGIN
    -- Perform bulk unarchive based on table
    IF alert_table_name = 'security_alerts_ingest' THEN
      UPDATE public.security_alerts_ingest 
      SET 
        archived_at = NULL,
        archived_by = NULL,
        archive_reason = NULL,
        updated_at = now()
      WHERE id = ANY(alert_ids)
        AND archived_at IS NOT NULL;
      GET DIAGNOSTICS updated_count = ROW_COUNT;
      
    ELSIF alert_table_name = 'weather_alerts_ingest' THEN
      UPDATE public.weather_alerts_ingest 
      SET 
        archived_at = NULL,
        archived_by = NULL,
        archive_reason = NULL,
        updated_at = now()
      WHERE id = ANY(alert_ids)
        AND archived_at IS NOT NULL;
      GET DIAGNOSTICS updated_count = ROW_COUNT;
      
    ELSIF alert_table_name = 'incidents' THEN
      UPDATE public.incidents 
      SET 
        archived_at = NULL,
        archived_by = NULL,
        archive_reason = NULL,
        updated_at = now()
      WHERE id::text = ANY(alert_ids)
        AND archived_at IS NOT NULL;
      GET DIAGNOSTICS updated_count = ROW_COUNT;
      
    ELSIF alert_table_name = 'hub_incidents' THEN
      UPDATE public.hub_incidents 
      SET 
        archived_at = NULL,
        archived_by = NULL,
        archive_reason = NULL,
        updated_at = now()
      WHERE id::text = ANY(alert_ids)
        AND archived_at IS NOT NULL;
      GET DIAGNOSTICS updated_count = ROW_COUNT;
    END IF;

    -- Log the unarchive action
    INSERT INTO public.alert_archive_log (
      alert_table,
      alert_id,
      action,
      performed_by,
      reason,
      metadata
    )
    SELECT 
      alert_table_name,
      unnest(alert_ids),
      'unarchive',
      user_id,
      unarchive_reason,
      json_build_object('bulk_operation', true, 'timestamp', now())
    WHERE updated_count > 0;

    RETURN json_build_object(
      'success', true,
      'updated_count', updated_count,
      'error', null
    );

  EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'updated_count', 0
    );
  END;
END;
$$;
