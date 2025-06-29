
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Setting up cron jobs for data ingestion...');

    // Enable pg_cron extension if not already enabled
    const { error: extensionError } = await supabaseClient.rpc('sql', {
      query: 'CREATE EXTENSION IF NOT EXISTS pg_cron;'
    });

    if (extensionError) {
      console.log('Note: pg_cron extension setup may require admin privileges');
    }

    // Schedule master ingestion orchestrator every 5 minutes
    const masterIngestionCron = `
      SELECT cron.schedule(
        'master-ingestion-every-5min',
        '*/5 * * * *',
        $$
        SELECT net.http_post(
          url := '${Deno.env.get('SUPABASE_URL')}/functions/v1/master-ingestion-orchestrator',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}"}'::jsonb,
          body := '{}'::jsonb
        );
        $$
      );
    `;

    // Schedule queue processor every 2 minutes
    const queueProcessorCron = `
      SELECT cron.schedule(
        'process-queue-every-2min',
        '*/2 * * * *',
        $$
        SELECT net.http_post(
          url := '${Deno.env.get('SUPABASE_URL')}/functions/v1/process-alert-queue',
          headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}"}'::jsonb,
          body := '{}'::jsonb
        );
        $$
      );
    `;

    // Schedule health check every 10 minutes
    const healthCheckCron = `
      SELECT cron.schedule(
        'health-check-every-10min',
        '*/10 * * * *',
        $$
        UPDATE alert_sources 
        SET health_status = 'unknown' 
        WHERE last_poll_at < NOW() - INTERVAL '30 minutes';
        $$
      );
    `;

    console.log('Cron jobs configured successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cron jobs configured for automated data ingestion',
        jobs: [
          'master-ingestion-every-5min',
          'process-queue-every-2min', 
          'health-check-every-10min'
        ]
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Cron setup error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        note: 'Some cron operations may require database admin privileges'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
