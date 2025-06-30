
import { recordHealthMetric } from '../health-metrics.ts';
import { normalizeAlerts, queueAlertsForProcessing, getAcceptHeader, parseXmlData } from '../alert-normalizer.ts';
import { normalizeWithConfiguration, normalizeAlertBatchWithConfig } from '../config-driven-normalizer.ts';
import { AlertSource, ProcessingResult } from '../types.ts';

export async function processGenericSource(source: AlertSource, supabaseClient: any): Promise<ProcessingResult> {
  const startTime = Date.now();
  let httpStatus: number | undefined;
  
  try {
    console.log(`Processing generic source: ${source.name} (${source.source_type})`);
    console.log(`API endpoint: ${source.api_endpoint}`);
    
    // Skip sources that require API keys but don't have them configured
    if (source.source_type === 'weather' && source.name.includes('OpenWeatherMap')) {
      console.log('Skipping OpenWeatherMap - requires API key configuration');
      
      await recordHealthMetric(supabaseClient, {
        source_id: source.id,
        response_time_ms: 0,
        success: false,
        error_message: 'API key required but not configured',
        records_processed: 0
      });

      return {
        source_name: source.name,
        success: false,
        error: 'API key required but not configured',
        records_processed: 0
      };
    }
    
    // Generic processing for other source types
    const requestConfig: RequestInit = {
      method: 'GET',
      headers: {
        'User-Agent': 'Security-Intelligence-Platform/1.0',
        'Accept': getAcceptHeader(source.source_type)
      }
    };

    // Add custom headers from configuration
    if (source.configuration?.headers) {
      requestConfig.headers = {
        ...requestConfig.headers,
        ...source.configuration.headers
      };
    }

    // Add API key if configured
    if (source.configuration?.api_key) {
      requestConfig.headers = {
        ...requestConfig.headers,
        'Authorization': `Bearer ${source.configuration.api_key}`
      };
    }

    console.log(`Fetching data from: ${source.api_endpoint}`);
    const response = await fetch(source.api_endpoint, requestConfig);
    httpStatus = response.status;
    
    if (!response.ok) {
      const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      console.error(`API request failed for ${source.name}: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    const contentType = response.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('xml') || contentType.includes('rss')) {
      const text = await response.text();
      console.log(`Fetched ${text.length} characters of XML/RSS content`);
      data = await parseXmlData(text, source.source_type);
    } else {
      data = await response.text();
    }

    let processedAlerts: any[];
    
    // Check if source has custom normalization configuration
    if (source.configuration?.normalization && source.configuration.normalization.titleField) {
      console.log(`Using configuration-driven normalization for ${source.name}`);
      
      // Extract alerts from data based on common patterns
      let alertsArray: any[] = [];
      if (Array.isArray(data)) {
        alertsArray = data;
      } else if (data.alerts && Array.isArray(data.alerts)) {
        alertsArray = data.alerts;
      } else if (data.features && Array.isArray(data.features)) {
        alertsArray = data.features; // GeoJSON
      } else if (data.items && Array.isArray(data.items)) {
        alertsArray = data.items;
      } else if (data.channel && data.channel.item && Array.isArray(data.channel.item)) {
        alertsArray = data.channel.item; // RSS
      } else {
        alertsArray = [data]; // Single alert
      }
      
      processedAlerts = normalizeAlertBatchWithConfig(
        alertsArray,
        source.configuration,
        source.source_type
      );
    } else {
      // Fall back to legacy normalization
      processedAlerts = await normalizeAlerts(data, source);
    }
    
    console.log(`Normalized ${processedAlerts.length} alerts from ${source.name}`);
    
    // Store alerts and queue for processing
    const storedCount = await storeAlertsByType(supabaseClient, processedAlerts, source);
    const queuedCount = await queueAlertsForProcessing(supabaseClient, processedAlerts, source.id);
    
    const responseTime = Date.now() - startTime;
    
    // Record successful health metric
    await recordHealthMetric(supabaseClient, {
      source_id: source.id,
      response_time_ms: responseTime,
      success: true,
      records_processed: Math.max(storedCount, queuedCount),
      http_status_code: httpStatus
    });

    return {
      source_name: source.name,
      success: true,
      records_processed: Math.max(storedCount, queuedCount),
      response_time_ms: responseTime
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    console.error(`Error processing source ${source.name}:`, error);
    
    await recordHealthMetric(supabaseClient, {
      source_id: source.id,
      response_time_ms: responseTime,
      success: false,
      error_message: error.message,
      records_processed: 0,
      http_status_code: httpStatus
    });

    // Re-throw to be handled by caller
    throw error;
  }
}

async function storeAlertsByType(supabaseClient: any, processedAlerts: any[], source: AlertSource): Promise<number> {
  let storedCount = 0;
  
  if (source.source_type === 'security-rss' || source.source_type === 'rss') {
    // Store in security_alerts_ingest table
    if (processedAlerts.length > 0) {
      const securityAlerts = processedAlerts.map(alert => ({
        id: alert.id || `${source.source_type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: alert.title || 'Untitled Alert',
        summary: alert.description || alert.summary,
        link: alert.url || alert.link,
        pub_date: alert.published || new Date().toISOString(),
        source: source.name,
        category: alert.category || 'Security',
        location: alert.area || 'Global',
        raw_data: alert
      }));

      const { data: insertedAlerts, error: insertError } = await supabaseClient
        .from('security_alerts_ingest')
        .upsert(securityAlerts, { onConflict: 'id' })
        .select();

      if (insertError) {
        console.error(`Error storing security alerts for ${source.name}:`, insertError);
      } else {
        storedCount = insertedAlerts?.length || 0;
        console.log(`Stored ${storedCount} security alerts for ${source.name}`);
      }
    }
  } else if (source.source_type === 'weather' || source.source_type === 'weather-geocmet') {
    // Store in weather_alerts_ingest table
    if (processedAlerts.length > 0) {
      const weatherAlerts = processedAlerts.map(alert => ({
        id: alert.id || `${source.source_type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        description: alert.description || 'No description available',
        severity: alert.severity,
        event_type: alert.category || 'Weather',
        onset: alert.effective || alert.published,
        expires: alert.expires,
        geometry_coordinates: alert.coordinates ? JSON.stringify(alert.coordinates) : null,
        raw_data: alert
      }));

      const { data: insertedAlerts, error: insertError } = await supabaseClient
        .from('weather_alerts_ingest')
        .upsert(weatherAlerts, { onConflict: 'id' })
        .select();

      if (insertError) {
        console.error(`Error storing weather alerts for ${source.name}:`, insertError);
      } else {
        storedCount = insertedAlerts?.length || 0;
        console.log(`Stored ${storedCount} weather alerts for ${source.name}`);
      }
    }
  }
  
  return storedCount;
}
