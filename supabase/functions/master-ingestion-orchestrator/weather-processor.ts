
import { recordHealthMetric } from './health-metrics.ts';
import { AlertSource, ProcessingResult } from './types.ts';

export async function processGeoMetSource(source: AlertSource, supabaseClient: any): Promise<ProcessingResult> {
  const startTime = Date.now();
  let retryCount = 0;
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  while (retryCount <= maxRetries) {
    try {
      console.log(`Attempting GeoMet API call (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      const response = await fetch(source.api_endpoint, {
        method: 'GET',
        headers: {
          'User-Agent': 'Security-Intelligence-Platform/1.0',
          'Accept': 'application/json, application/geo+json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const geoJsonData = await response.json();
      console.log(`Received GeoJSON data with ${geoJsonData.features?.length || 0} features`);
      
      // Process and save weather alerts
      const processedCount = await processWeatherAlerts(geoJsonData, supabaseClient);
      
      const responseTime = Date.now() - startTime;
      
      // Record successful health metric
      await recordHealthMetric(supabaseClient, {
        source_id: source.id,
        response_time_ms: responseTime,
        success: true,
        records_processed: processedCount,
        http_status_code: response.status
      });
      
      return {
        source_name: source.name,
        success: true,
        records_processed: processedCount,
        response_time_ms: responseTime
      };
      
    } catch (error) {
      console.error(`GeoMet API attempt ${retryCount + 1} failed:`, error);
      
      if (retryCount === maxRetries) {
        // Final attempt failed, record failure
        const responseTime = Date.now() - startTime;
        await recordHealthMetric(supabaseClient, {
          source_id: source.id,
          response_time_ms: responseTime,
          success: false,
          error_message: `Failed after ${maxRetries + 1} attempts: ${error.message}`,
          records_processed: 0
        });
        throw error;
      }
      
      // Wait before retry with exponential backoff
      const delay = baseDelay * Math.pow(2, retryCount);
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      retryCount++;
    }
  }
}

async function processWeatherAlerts(geoJsonData: any, supabaseClient: any): Promise<number> {
  if (!geoJsonData.features || !Array.isArray(geoJsonData.features)) {
    console.log('No features found in GeoJSON response');
    return 0;
  }
  
  const alerts = [];
  
  for (const feature of geoJsonData.features) {
    try {
      const alert = {
        id: feature.id || feature.properties?.id || `alert_${Date.now()}_${Math.random()}`,
        geometry_coordinates: feature.geometry?.coordinates || null,
        event_type: feature.properties?.eventType || feature.properties?.event_type || null,
        severity: feature.properties?.severity || null,
        onset: feature.properties?.onset ? new Date(feature.properties.onset).toISOString() : null,
        expires: feature.properties?.expires ? new Date(feature.properties.expires).toISOString() : null,
        description: feature.properties?.description || feature.properties?.headline || null,
        raw_data: feature,
        updated_at: new Date().toISOString()
      };
      
      alerts.push(alert);
    } catch (error) {
      console.error('Error processing weather alert feature:', error, feature);
    }
  }
  
  if (alerts.length === 0) {
    console.log('No valid alerts to process');
    return 0;
  }
  
  // Use upsert to handle duplicates
  const { error: insertError } = await supabaseClient
    .from('weather_alerts_ingest')
    .upsert(alerts, { onConflict: 'id' });
  
  if (insertError) {
    console.error('Failed to insert weather alerts:', insertError);
    throw new Error(`Failed to save weather alerts: ${insertError.message}`);
  }
  
  console.log(`Successfully processed ${alerts.length} weather alerts`);
  return alerts.length;
}
