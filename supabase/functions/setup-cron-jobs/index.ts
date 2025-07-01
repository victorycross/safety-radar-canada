
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

    console.log('⚙️ Setting up cron jobs for data ingestion...');

    const baseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!baseUrl || !anonKey) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
    }

    // Try to clear existing cron jobs first
    try {
      await supabaseClient.rpc('exec_sql', { 
        sql: "SELECT cron.unschedule('master-ingestion-job');" 
      });
      await supabaseClient.rpc('exec_sql', { 
        sql: "SELECT cron.unschedule('process-alert-queue-job');" 
      });
      console.log('🧹 Cleared existing cron jobs');
    } catch (error) {
      console.log('ℹ️ No existing cron jobs to clear or unschedule failed');
    }

    // Set up cron job to run master ingestion orchestrator every 10 minutes
    const masterJobSql = `
      SELECT cron.schedule(
        'master-ingestion-job',
        '*/10 * * * *',
        $$
        SELECT
          net.http_post(
            url:='${baseUrl}/functions/v1/master-ingestion-orchestrator',
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${anonKey}"}'::jsonb,
            body:='{"triggered_by": "cron", "timestamp": "' || now() || '"}'::jsonb
          ) as request_id;
        $$
      );
    `;

    // Set up cron job to process alert queue every 5 minutes
    const queueJobSql = `
      SELECT cron.schedule(
        'process-alert-queue-job',
        '*/5 * * * *',
        $$
        SELECT
          net.http_post(
            url:='${baseUrl}/functions/v1/process-alert-queue',
            headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${anonKey}"}'::jsonb,
            body:='{"triggered_by": "cron", "timestamp": "' || now() || '"}'::jsonb
          ) as request_id;
        $$
      );
    `;

    const results = [];
    
    // Set up master ingestion job
    try {
      const { error: masterJobError } = await supabaseClient.rpc('exec_sql', { 
        sql: masterJobSql 
      });
      
      if (masterJobError) {
        console.log('⚠️ Master job setup error:', masterJobError.message);
        results.push({ job: 'master-ingestion-job', status: 'error', error: masterJobError.message });
      } else {
        console.log('✅ Master ingestion job scheduled successfully (every 10 minutes)');
        results.push({ job: 'master-ingestion-job', status: 'success', schedule: 'every 10 minutes' });
      }
    } catch (error) {
      console.log('❌ Master job scheduling failed:', error.message);
      results.push({ job: 'master-ingestion-job', status: 'failed', error: error.message });
    }

    // Set up queue processing job
    try {
      const { error: queueJobError } = await supabaseClient.rpc('exec_sql', { 
        sql: queueJobSql 
      });
      
      if (queueJobError) {
        console.log('⚠️ Queue job setup error:', queueJobError.message);
        results.push({ job: 'process-alert-queue-job', status: 'error', error: queueJobError.message });
      } else {
        console.log('✅ Queue processing job scheduled successfully (every 5 minutes)');
        results.push({ job: 'process-alert-queue-job', status: 'success', schedule: 'every 5 minutes' });
      }
    } catch (error) {
      console.log('❌ Queue job scheduling failed:', error.message);
      results.push({ job: 'process-alert-queue-job', status: 'failed', error: error.message });
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const hasErrors = results.some(r => r.status === 'error' || r.status === 'failed');

    console.log(`🏁 Cron job setup complete. Success: ${successCount}, Errors: ${hasErrors ? 'Yes' : 'No'}`);

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        message: successCount > 0 
          ? `Successfully configured ${successCount} cron job(s)` 
          : 'Failed to configure cron jobs',
        jobs: results,
        instructions: hasErrors ? [
          '1. Go to the Supabase SQL Editor',
          '2. Enable extensions: CREATE EXTENSION IF NOT EXISTS pg_cron; CREATE EXTENSION IF NOT EXISTS pg_net;',
          '3. Run the cron.schedule commands manually with proper permissions',
          '4. Check database logs for detailed error information'
        ] : undefined,
        next_steps: [
          'Monitor the edge function logs for both master-ingestion-orchestrator and process-alert-queue',
          'Check the alert_ingestion_queue table to see if items are being processed',
          'Verify that health metrics are being recorded in source_health_metrics table'
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Setup error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        message: 'Failed to set up cron jobs - check edge function logs for details',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
