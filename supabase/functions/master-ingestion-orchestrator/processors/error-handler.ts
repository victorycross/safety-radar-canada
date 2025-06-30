
import { recordHealthMetric } from '../health-metrics.ts';
import { ProcessingResult } from '../types.ts';

export async function handleProcessingError(
  error: any,
  source: any,
  supabaseClient: any,
  startTime: number,
  httpStatus?: number
): Promise<ProcessingResult> {
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

  return {
    source_name: source.name,
    success: false,
    error: error.message,
    records_processed: 0,
    response_time_ms: responseTime
  };
}
