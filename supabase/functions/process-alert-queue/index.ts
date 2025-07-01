
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

    console.log('🔄 Processing alert queue started...');

    // First, clean up stale processing items (older than 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { error: cleanupError } = await supabaseClient
      .from('alert_ingestion_queue')
      .update({ 
        processing_status: 'pending',
        error_message: 'Reset from stale processing state'
      })
      .eq('processing_status', 'processing')
      .lt('created_at', tenMinutesAgo);

    if (cleanupError) {
      console.log('⚠️ Cleanup warning:', cleanupError.message);
    }

    // Get pending alerts from queue
    const { data: queueItems, error: queueError } = await supabaseClient
      .from('alert_ingestion_queue')
      .select('*')
      .eq('processing_status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50);

    if (queueError) {
      throw new Error(`Failed to fetch queue items: ${queueError.message}`);
    }

    if (!queueItems?.length) {
      console.log('✅ No pending alerts to process');
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No pending alerts to process',
          processed_count: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Processing ${queueItems.length} queued alerts`);

    const results = [];
    let processedCount = 0;

    for (const queueItem of queueItems) {
      try {
        console.log(`🔄 Processing queue item ${queueItem.id}`);
        
        // Mark as processing
        await supabaseClient
          .from('alert_ingestion_queue')
          .update({ 
            processing_status: 'processing',
            processing_attempts: (queueItem.processing_attempts || 0) + 1 
          })
          .eq('id', queueItem.id);

        // Process the alert
        const result = await processQueuedAlert(supabaseClient, queueItem);
        results.push(result);

        if (result.success) {
          processedCount++;
          // Mark as completed
          await supabaseClient
            .from('alert_ingestion_queue')
            .update({ 
              processing_status: 'completed',
              processed_at: new Date().toISOString()
            })
            .eq('id', queueItem.id);
          
          console.log(`✅ Successfully processed queue item ${queueItem.id}`);
        } else {
          throw new Error(result.error || 'Processing failed');
        }

      } catch (error) {
        console.error(`❌ Failed to process queue item ${queueItem.id}:`, error);
        
        // Mark as failed if too many attempts
        const maxAttempts = 3;
        const attempts = (queueItem.processing_attempts || 0) + 1;
        const status = attempts >= maxAttempts ? 'failed' : 'pending';
        
        await supabaseClient
          .from('alert_ingestion_queue')
          .update({ 
            processing_status: status,
            error_message: error.message,
            processing_attempts: attempts
          })
          .eq('id', queueItem.id);

        results.push({
          success: false,
          error: error.message,
          queue_item_id: queueItem.id
        });
      }
    }

    console.log(`🏁 Queue processing complete. Processed: ${processedCount}/${queueItems.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed_count: processedCount,
        total_items: queueItems.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Queue processing error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
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

async function processQueuedAlert(supabaseClient: any, queueItem: any) {
  const alertData = queueItem.raw_payload;
  
  try {
    console.log(`🔍 Processing alert: ${alertData.title || 'Unknown Title'}`);
    
    // Check for duplicates based on title and recent timestamp
    const { data: existingIncidents } = await supabaseClient
      .from('incidents')
      .select('id, title')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .ilike('title', `%${(alertData.title || '').substring(0, 30)}%`)
      .limit(5);

    if (existingIncidents && existingIncidents.length > 0) {
      console.log(`⏭️ Skipping duplicate alert: ${alertData.title}`);
      return { success: true, action: 'skipped_duplicate' };
    }

    // Get default province (Ontario) for now
    const { data: province } = await supabaseClient
      .from('provinces')
      .select('id')
      .eq('code', 'ON')
      .single();

    const provinceId = province?.id || null;

    if (!provinceId) {
      console.log('⚠️ No province found, using null');
    }

    // Create incident record
    const incident = {
      title: alertData.title || 'Untitled Alert',
      description: alertData.description || alertData.summary || 'No description available',
      province_id: provinceId,
      timestamp: alertData.timestamp || new Date().toISOString(),
      alert_level: mapSeverity(alertData.severity || 'normal'),
      source: alertData.source_name || 'Unknown Source',
      verification_status: 'unverified',
      confidence_score: alertData.confidence_score || 0.5,
      raw_payload: alertData,
      data_source_id: queueItem.source_id,
      geographic_scope: alertData.geographic_data?.area || null,
      severity_numeric: getSeverityNumeric(alertData.severity || 'normal')
    };

    const { data: newIncident, error: incidentError } = await supabaseClient
      .from('incidents')
      .insert(incident)
      .select()
      .single();

    if (incidentError) {
      throw new Error(`Failed to create incident: ${incidentError.message}`);
    }

    console.log(`📝 Created incident: ${newIncident.id} - ${incident.title}`);

    // Add geospatial data if available
    if (alertData.geographic_data && (alertData.geographic_data.latitude || alertData.geographic_data.longitude)) {
      const geoData = {
        incident_id: newIncident.id,
        latitude: alertData.geographic_data.latitude,
        longitude: alertData.geographic_data.longitude,
        administrative_area: alertData.geographic_data.area || 'Unknown',
        geohash: generateGeohash(alertData.geographic_data.latitude, alertData.geographic_data.longitude),
        affected_radius_km: estimateAffectedRadius(alertData.severity || 'normal'),
        population_impact: estimatePopulationImpact(alertData.geographic_data.area || '')
      };

      await supabaseClient
        .from('geospatial_data')
        .insert(geoData);
        
      console.log(`📍 Added geospatial data for incident ${newIncident.id}`);
    }

    return { 
      success: true, 
      action: 'created_incident', 
      incident_id: newIncident.id 
    };

  } catch (error) {
    console.error('❌ Alert processing error:', error);
    return { success: false, error: error.message };
  }
}

function mapSeverity(severity: string): string {
  const normalizedSeverity = severity.toLowerCase();
  if (normalizedSeverity.includes('severe') || normalizedSeverity.includes('critical')) return 'severe';
  if (normalizedSeverity.includes('warning') || normalizedSeverity.includes('moderate')) return 'warning';
  return 'normal';
}

function getSeverityNumeric(severity: string): number {
  const mappedSeverity = mapSeverity(severity);
  switch (mappedSeverity) {
    case 'severe': return 3;
    case 'warning': return 2;
    case 'normal': return 1;
    default: return 1;
  }
}

function generateGeohash(lat: number, lng: number): string {
  return `${Math.round(lat * 1000)}_${Math.round(lng * 1000)}`;
}

function estimateAffectedRadius(severity: string): number {
  const mappedSeverity = mapSeverity(severity);
  switch (mappedSeverity) {
    case 'severe': return 50;
    case 'warning': return 25;
    case 'normal': return 10;
    default: return 10;
  }
}

function estimatePopulationImpact(area: string): number {
  if (!area) return 1000;
  
  const areaLower = area.toLowerCase();
  if (areaLower.includes('toronto')) return 100000;
  if (areaLower.includes('ottawa')) return 50000;
  if (areaLower.includes('city')) return 25000;
  
  return 5000;
}
