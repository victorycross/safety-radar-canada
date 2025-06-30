
import { processSecurityRSSSource } from '../security-processor.ts';
import { processGeoMetSource } from '../weather-processor.ts';
import { processGenericSource } from './generic-processor.ts';
import { AlertSource, ProcessingResult } from '../types.ts';

export async function routeSourceProcessing(source: AlertSource, supabaseClient: any): Promise<ProcessingResult> {
  // Use specialized processing for certain source types
  if (source.source_type === 'weather-geocmet') {
    return await processGeoMetSource(source, supabaseClient);
  } else if (source.source_type === 'security-rss' || source.source_type === 'rss') {
    return await processSecurityRSSSource(source, supabaseClient);
  }
  
  // Fall back to generic processing
  return await processGenericSource(source, supabaseClient);
}
