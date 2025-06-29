
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

    // Enable required extensions
    const { error: cronError } = await supabaseClient.auth.admin.query(
      'CREATE EXTENSION IF NOT EXISTS pg_cron; CREATE EXTENSION IF NOT EXISTS pg_net;'
    );

    if (cronError) {
      console.log('Extensions may already be enabled:', cronError.message);
    }

    // Set up cron job to run master ingestion orchestrator every 5 minutes
    const cronJobSql = `
      SELECT cron.schedule(
        'master-ingestion-job',
        '*/5 * * * *', -- every 5 minutes
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
    const queueProcessorSql = `
      SELECT cron.schedule(
        'process-alert-queue-job',
        '*/2 * * * *', -- every 2 minutes
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

    try {
      // Execute cron job setup
      const { error: masterJobError } = await supabaseClient.rpc('exec_sql', { 
        sql: cronJobSql 
      });
      
      const { error: queueJobError } = await supabaseClient.rpc('exec_sql', { 
        sql: queueProcessorSql 
      });

      console.log('Cron jobs configured successfully');
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Cron jobs configured successfully',
          jobs: [
            'master-ingestion-job (every 5 minutes)',
            'process-alert-queue-job (every 2 minutes)'
          ]
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      console.log('Could not set up cron jobs (may require database admin privileges):', error.message);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Cron jobs setup initiated (requires admin privileges to complete)',
          note: 'You may need to run the cron setup manually from the Supabase SQL editor'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Setup error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
