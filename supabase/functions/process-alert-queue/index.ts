
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

    console.log('Processing alert queue...');

    // Get pending alerts from queue
    const { data: queueItems, error: queueError } = await supabaseClient
      .from('alert_ingestion_queue')
      .select('*')
      .eq('processing_status', 'pending')
      .order('created_at', { ascending: true })
      .limit(50); // Process in batches

    if (queueError) {
      throw new Error(`Failed to fetch queue items: ${queueError.message}`);
    }

    if (!queueItems?.length) {
      return new Response(
        JSON.stringify({ message: 'No pending alerts to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${queueItems.length} queued alerts`);

    const results = [];
    for (const queueItem of queueItems) {
      try {
        // Mark as processing
        await supabaseClient
          .from('alert_ingestion_queue')
          .update({ 
            processing_status: 'processing',
            processing_attempts: queueItem.processing_attempts + 1 
          })
          .eq('id', queueItem.id);

        // Process the alert
        const result = await processQueuedAlert(supabaseClient, queueItem);
        results.push(result);

        // Mark as completed
        await supabaseClient
          .from('alert_ingestion_queue')
          .update({ 
            processing_status: 'completed',
            processed_at: new Date().toISOString()
          })
          .eq('id', queueItem.id);

      } catch (error) {
        console.error(`Failed to process queue item ${queueItem.id}:`, error);
        
        // Mark as failed if too many attempts
        const status = queueItem.processing_attempts >= 3 ? 'failed' : 'pending';
        
        await supabaseClient
          .from('alert_ingestion_queue')
          .update({ 
            processing_status: status,
            error_message: error.message
          })
          .eq('id', queueItem.id);
      }
    }

    return new Response(
      JSON.stringify({
        processed_count: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Queue processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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
    // Check for duplicates
    const isDuplicate = await checkForDuplicate(supabaseClient, alertData);
    if (isDuplicate) {
      console.log(`Skipping duplicate alert: ${alertData.title}`);
      return { success: true, action: 'skipped_duplicate' };
    }

    // Get province mapping
    const provinceId = await getProvinceId(supabaseClient, alertData);
    
    // Create incident record
    const incident = {
      title: alertData.title,
      description: alertData.description,
      province_id: provinceId,
      timestamp: alertData.timestamp,
      alert_level: alertData.severity,
      source: alertData.source_name,
      verification_status: 'unverified',
      confidence_score: alertData.confidence_score,
      raw_payload: alertData.raw_data,
      data_source_id: queueItem.source_id,
      geographic_scope: alertData.geographic_data?.area || null,
      severity_numeric: getSeverityNumeric(alertData.severity)
    };

    const { data: newIncident, error: incidentError } = await supabaseClient
      .from('incidents')
      .insert(incident)
      .select()
      .single();

    if (incidentError) {
      throw new Error(`Failed to create incident: ${incidentError.message}`);
    }

    // Add geospatial data if available
    if (alertData.geographic_data && (alertData.geographic_data.latitude || alertData.geographic_data.longitude)) {
      const geoData = {
        incident_id: newIncident.id,
        latitude: alertData.geographic_data.latitude,
        longitude: alertData.geographic_data.longitude,
        administrative_area: alertData.geographic_data.area,
        geohash: generateGeohash(alertData.geographic_data.latitude, alertData.geographic_data.longitude),
        affected_radius_km: estimateAffectedRadius(alertData.severity),
        population_impact: estimatePopulationImpact(alertData.geographic_data.area)
      };

      await supabaseClient
        .from('geospatial_data')
        .insert(geoData);
    }

    console.log(`Successfully processed alert: ${alertData.title}`);
    return { 
      success: true, 
      action: 'created_incident', 
      incident_id: newIncident.id 
    };

  } catch (error) {
    console.error('Alert processing error:', error);
    return { success: false, error: error.message };
  }
}

async function checkForDuplicate(supabaseClient: any, alertData: any): Promise<boolean> {
  // Check for similar incidents in the last 24 hours
  const { data: existingIncidents } = await supabaseClient
    .from('incidents')
    .select('title, description')
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .ilike('title', `%${alertData.title.substring(0, 50)}%`);

  if (!existingIncidents?.length) return false;

  // Simple duplicate detection based on title similarity
  for (const existing of existingIncidents) {
    const similarity = calculateTitleSimilarity(alertData.title, existing.title);
    if (similarity > 0.8) {
      return true;
    }
  }

  return false;
}

function calculateTitleSimilarity(title1: string, title2: string): number {
  const words1 = new Set(title1.toLowerCase().split(' '));
  const words2 = new Set(title2.toLowerCase().split(' '));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

async function getProvinceId(supabaseClient: any, alertData: any): Promise<string> {
  // Default to Ontario for now - in production, implement location-based mapping
  const { data: province } = await supabaseClient
    .from('provinces')
    .select('id')
    .eq('code', 'ON')
    .single();

  return province?.id || 'default-province-id';
}

function getSeverityNumeric(severity: string): number {
  switch (severity.toLowerCase()) {
    case 'severe': return 3;
    case 'warning': return 2;
    case 'normal': return 1;
    default: return 1;
  }
}

function generateGeohash(lat: number, lng: number): string {
  // Simple geohash implementation - in production use a proper library
  return `${Math.round(lat * 1000)}_${Math.round(lng * 1000)}`;
}

function estimateAffectedRadius(severity: string): number {
  switch (severity.toLowerCase()) {
    case 'severe': return 50; // 50km radius
    case 'warning': return 25; // 25km radius
    case 'normal': return 10; // 10km radius
    default: return 10;
  }
}

function estimatePopulationImpact(area: string): number {
  // Simple population estimation - in production use actual demographic data
  if (!area) return 1000;
  
  if (area.toLowerCase().includes('toronto')) return 100000;
  if (area.toLowerCase().includes('ottawa')) return 50000;
  if (area.toLowerCase().includes('city')) return 25000;
  
  return 5000; // Default for smaller areas
}
