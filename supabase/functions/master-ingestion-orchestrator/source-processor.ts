
import { routeSourceProcessing } from './processors/source-type-router.ts';
import { handleProcessingError } from './processors/error-handler.ts';
import { AlertSource, ProcessingResult } from './types.ts';

export async function processSource(source: AlertSource, supabaseClient: any): Promise<ProcessingResult> {
  const startTime = Date.now();
  
  try {
    console.log(`Processing source: ${source.name} (${source.source_type})`);
    console.log(`API endpoint: ${source.api_endpoint}`);
    
    return await routeSourceProcessing(source, supabaseClient);
    
  } catch (error) {
    return await handleProcessingError(error, source, supabaseClient, startTime);
  }
}
