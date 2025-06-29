
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

    // First, try to enable the required extensions
    try {
      const extensionSql = `
        CREATE EXTENSION IF NOT EXISTS pg_cron;
        CREATE EXTENSION IF NOT EXISTS pg_net;
      `;
      
      const { error: extensionError } = await supabaseClient.rpc('exec_sql', { 
        sql: extensionSql 
      });
      
      if (extensionError) {
        console.log('Extensions setup result:', extensionError.message);
      }
    } catch (extError) {
      console.log('Extensions may already be enabled or require superuser privileges');
    }

    // Set up cron job to run master ingestion orchestrator every 5 minutes
    const masterJobSql = `
      SELECT cron.schedule(
        'master-ingestion-job',
        '*/5 * * * *',
        $$
        SELECT
          net.http_post(
            url:='${Deno.env.get('SUPABASE_URL')}/functions/v1/master-ingestion-orchestrator',
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}"}'::jsonb,
            body:='{"triggered_by": "cron"}'::jsonb
          ) as request_id;
        $$
      );
    `;

    // Set up cron job to process alert queue every 2 minutes
    const queueJobSql = `
      SELECT cron.schedule(
        'process-alert-queue-job',
        '*/2 * * * *',
        $$
        SELECT
          net.http_post(
            url:='${Deno.env.get('SUPABASE_URL')}/functions/v1/process-alert-queue',
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}"}'::jsonb,
            body:='{"triggered_by": "cron"}'::jsonb
          ) as request_id;
        $$
      );
    `;

    // Try to set up the cron jobs
    const results = [];
    
    try {
      const { data: masterJobData, error: masterJobError } = await supabaseClient.rpc('exec_sql', { 
        sql: masterJobSql 
      });
      
      if (masterJobError) {
        console.log('Master job setup error:', masterJobError.message);
        results.push({ job: 'master-ingestion-job', status: 'error', error: masterJobError.message });
      } else {
        console.log('Master ingestion job scheduled successfully');
        results.push({ job: 'master-ingestion-job', status: 'success' });
      }
    } catch (error) {
      console.log('Master job scheduling failed:', error.message);
      results.push({ job: 'master-ingestion-job', status: 'failed', error: error.message });
    }

    try {
      const { data: queueJobData, error: queueJobError } = await supabaseClient.rpc('exec_sql', { 
        sql: queueJobSql 
      });
      
      if (queueJobError) {
        console.log('Queue job setup error:', queueJobError.message);
        results.push({ job: 'process-alert-queue-job', status: 'error', error: queueJobError.message });
      } else {
        console.log('Queue processing job scheduled successfully');
        results.push({ job: 'process-alert-queue-job', status: 'success' });
      }
    } catch (error) {
      console.log('Queue job scheduling failed:', error.message);
      results.push({ job: 'process-alert-queue-job', status: 'failed', error: error.message });
    }

    // Check if any jobs were successfully set up
    const successCount = results.filter(r => r.status === 'success').length;
    const hasErrors = results.some(r => r.status === 'error' || r.status === 'failed');

    if (successCount > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully configured ${successCount} cron job(s)`,
          jobs: results,
          note: hasErrors ? 'Some jobs failed - this may be due to database permissions. Check the Supabase SQL editor for manual setup.' : undefined
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Cron jobs setup failed - likely due to database permissions',
          jobs: results,
          instructions: [
            '1. Go to the Supabase SQL Editor',
            '2. Enable extensions: CREATE EXTENSION IF NOT EXISTS pg_cron; CREATE EXTENSION IF NOT EXISTS pg_net;',
            '3. Run the cron.schedule commands manually with proper permissions'
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Setup error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        message: 'Failed to set up cron jobs - check edge function logs for details'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
