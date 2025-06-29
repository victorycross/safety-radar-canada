
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { processSource } from './source-processor.ts';
import { shouldPollSource, recordHealthMetric } from './health-metrics.ts';
import { runCorrelationAnalysis } from './correlation-analysis.ts';
import { AlertSource } from './types.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Master ingestion orchestrator started');

    // Get all active alert sources
    const { data: sources, error: sourcesError } = await supabaseClient
      .from('alert_sources')
      .select('*')
      .eq('is_active', true);

    if (sourcesError) {
      throw new Error(`Failed to fetch alert sources: ${sourcesError.message}`);
    }

    console.log(`Found ${sources?.length || 0} active sources to process`);

    const results = [];

    // Process each source
    for (const source of sources || []) {
      try {
        console.log(`Processing source: ${source.name} (${source.source_type})`);
        
        const shouldPoll = shouldPollSource(source);
        if (!shouldPoll) {
          console.log(`Skipping ${source.name} - not due for polling`);
          continue;
        }

        const result = await processSource(source, supabaseClient);
        results.push(result);

      } catch (error) {
        console.error(`Error processing source ${source.name}:`, error);
        
        // Record failed health metric
        await recordHealthMetric(supabaseClient, {
          source_id: source.id,
          response_time_ms: 0,
          success: false,
          error_message: error.message,
          records_processed: 0
        });
      }
    }

    // Run correlation analysis on new incidents
    await runCorrelationAnalysis(supabaseClient);

    return new Response(
      JSON.stringify({
        success: true,
        processed_sources: results.length,
        results: results,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Master orchestrator error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
