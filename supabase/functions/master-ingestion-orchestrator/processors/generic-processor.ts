
import { recordHealthMetric } from '../health-metrics.ts';
import { queueAlertsForProcessing } from '../alert-normalizer.ts';
import { AlertSource, ProcessingResult } from '../types.ts';
import { shouldSkipSource } from './source-validator.ts';
import { fetchSourceData } from './data-fetcher.ts';
import { processAlerts } from './alert-processor.ts';
import { storeAlertsByType } from './storage-handler.ts';

export async function processGenericSource(source: AlertSource, supabaseClient: any): Promise<ProcessingResult> {
  const startTime = Date.now();
  let httpStatus: number | undefined;
  
  try {
    console.log(`Processing generic source: ${source.name} (${source.source_type})`);
    console.log(`API endpoint: ${source.api_endpoint}`);
    
    // Check if we should skip this source
    const skipCheck = shouldSkipSource(source);
    if (skipCheck.skip) {
      await recordHealthMetric(supabaseClient, {
        source_id: source.id,
        response_time_ms: 0,
        success: false,
        error_message: skipCheck.reason || 'Source skipped',
        records_processed: 0
      });

      return {
        source_name: source.name,
        success: false,
        error: skipCheck.reason || 'Source skipped',
        records_processed: 0
      };
    }
    
    // Fetch data from source
    const { data, httpStatus: fetchedHttpStatus } = await fetchSourceData(source);
    httpStatus = fetchedHttpStatus;
    
    // Process the alerts
    const processedAlerts = await processAlerts(data, source);
    
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
