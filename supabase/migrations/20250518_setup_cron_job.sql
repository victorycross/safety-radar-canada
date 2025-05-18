
-- Set up a cron job to run data sync every day at midnight
SELECT cron.schedule(
  'sync-toronto-police-data-daily',
  '0 0 * * *',  -- At midnight every day
  $$
  SELECT
    net.http_post(
        url:='https://hablzabjqwdusajkoevb.supabase.co/functions/v1/scheduled-sync',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhYmx6YWJqcXdkdXNhamtvZXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjkxOTYsImV4cCI6MjA2MzEwNTE5Nn0.Vt8DYuqfEu_7FHj8-xi_0CbNFfWqAUbyTTVzoY_yz0Q"}'::jsonb,
        body:='{"timestamp": "' || now() || '"}'::jsonb
    ) as request_id;
  $$
);
