
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

    console.log('🚀 Master ingestion orchestrator started');

    // Get all active alert sources
    const { data: sources, error: sourcesError } = await supabaseClient
      .from('alert_sources')
      .select('*')
      .eq('is_active', true);

    if (sourcesError) {
      console.error('❌ Failed to fetch alert sources:', sourcesError);
      throw new Error(`Failed to fetch alert sources: ${sourcesError.message}`);
    }

    console.log(`📊 Found ${sources?.length || 0} active sources to process`);

    const results = [];
    let totalProcessed = 0;

    // Process each source with enhanced logging
    for (const source of sources || []) {
      try {
        console.log(`🔄 Processing source: ${source.name} (${source.source_type})`);
        console.log(`🔄 Source details:`, JSON.stringify({
          id: source.id,
          name: source.name,
          type: source.source_type,
          endpoint: source.api_endpoint,
          last_poll: source.last_poll_at
        }, null, 2));
        
        const shouldPoll = shouldPollSource(source);
        if (!shouldPoll) {
          console.log(`⏭️ Skipping ${source.name} - not due for polling`);
          continue;
        }

        console.log(`▶️ Starting processing for ${source.name}...`);
        const result = await processSource(source, supabaseClient);
        
        console.log(`✅ Processing result for ${source.name}:`, JSON.stringify(result, null, 2));
        
        results.push(result);
        totalProcessed += result.records_processed || 0;

        console.log(`✅ Successfully processed ${source.name}: ${result.records_processed} records`);

        // Record successful health metric with detailed info
        await recordHealthMetric(supabaseClient, {
          source_id: source.id,
          response_time_ms: result.response_time_ms || 0,
          success: result.success,
          error_message: result.error || null,
          records_processed: result.records_processed || 0
        });

        // Update the source's last_poll_at timestamp
        await supabaseClient
          .from('alert_sources')
          .update({ 
            last_poll_at: new Date().toISOString(),
            health_status: result.success ? 'healthy' : 'error'
          })
          .eq('id', source.id);

      } catch (error) {
        console.error(`❌ Error processing source ${source.name}:`, error);
        console.error(`❌ Error details:`, JSON.stringify({
          message: error.message,
          stack: error.stack,
          source: source.name,
          source_type: source.source_type
        }, null, 2));
        
        // Record failed health metric with enhanced details
        await recordHealthMetric(supabaseClient, {
          source_id: source.id,
          response_time_ms: 0,
          success: false,
          error_message: `${error.message} - Stack: ${error.stack?.substring(0, 500)}`,
          records_processed: 0
        });

        // Update source health status
        await supabaseClient
          .from('alert_sources')
          .update({ 
            health_status: 'error',
            last_poll_at: new Date().toISOString()
          })
          .eq('id', source.id);

        results.push({
          source_name: source.name,
          success: false,
          error: error.message,
          records_processed: 0
        });
      }
    }

    // Run correlation analysis on new incidents
    try {
      await runCorrelationAnalysis(supabaseClient);
      console.log('🔗 Correlation analysis completed');
    } catch (error) {
      console.error('⚠️ Correlation analysis failed:', error);
    }

    console.log(`🏁 Processing complete. Total records processed: ${totalProcessed}`);
    console.log(`🏁 Final results summary:`, JSON.stringify({
      total_sources: results.length,
      successful_sources: results.filter(r => r.success).length,
      failed_sources: results.filter(r => !r.success).length,
      total_records: totalProcessed
    }, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        processed_sources: results.length,
        successful_sources: results.filter(r => r.success).length,
        failed_sources: results.filter(r => !r.success).length,
        total_records_processed: totalProcessed,
        results: results,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('💥 Master orchestrator error:', error);
    console.error('💥 Error details:', JSON.stringify({
      message: error.message,
      stack: error.stack
    }, null, 2));
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        error_details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
