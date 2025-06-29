
import { processSecurityRSSSource } from './security-processor.ts';
import { processGeoMetSource } from './weather-processor.ts';
import { normalizeAlerts, queueAlertsForProcessing, getAcceptHeader, parseXmlData } from './alert-normalizer.ts';
import { recordHealthMetric } from './health-metrics.ts';
import { AlertSource, ProcessingResult } from './types.ts';

export async function processSource(source: AlertSource, supabaseClient: any): Promise<ProcessingResult> {
  const startTime = Date.now();
  let httpStatus: number | undefined;
  
  try {
    console.log(`Fetching data from: ${source.api_endpoint}`);
    
    // Use specialized processing for different source types
    if (source.source_type === 'weather-geocmet') {
      return await processGeoMetSource(source, supabaseClient);
    } else if (source.source_type === 'security-rss') {
      return await processSecurityRSSSource(source, supabaseClient);
    }
    
    // Generic processing for other source types
    const requestConfig: RequestInit = {
      method: 'GET',
      headers: {
        'User-Agent': 'Security-Intelligence-Platform/1.0',
        'Accept': getAcceptHeader(source.source_type)
      }
    };

    // Add API key if configured
    if (source.configuration?.api_key) {
      requestConfig.headers = {
        ...requestConfig.headers,
        'Authorization': `Bearer ${source.configuration.api_key}`
      };
    }

    const response = await fetch(source.api_endpoint, requestConfig);
    httpStatus = response.status;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('xml') || contentType.includes('rss')) {
      const text = await response.text();
      data = await parseXmlData(text, source.source_type);
    } else {
      data = await response.text();
    }

    // Process and normalize the data
    const processedAlerts = await normalizeAlerts(data, source);
    
    // Queue alerts for processing
    const queuedCount = await queueAlertsForProcessing(supabaseClient, processedAlerts, source.id);
    
    const responseTime = Date.now() - startTime;
    
    // Record successful health metric
    await recordHealthMetric(supabaseClient, {
      source_id: source.id,
      response_time_ms: responseTime,
      success: true,
      records_processed: queuedCount,
      http_status_code: httpStatus
    });

    return {
      source_name: source.name,
      success: true,
      records_processed: queuedCount,
      response_time_ms: responseTime
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    await recordHealthMetric(supabaseClient, {
      source_id: source.id,
      response_time_ms: responseTime,
      success: false,
      error_message: error.message,
      records_processed: 0,
      http_status_code: httpStatus
    });

    throw error;
  }
}
