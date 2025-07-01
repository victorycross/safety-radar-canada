
import { processSecurityRSSSource } from '../security-processor.ts';
import { processGeoMetSource } from '../weather-processor.ts';
import { processImmigrationTravelSource } from '../immigration-travel-processor.ts';
import { processGenericSource } from './generic-processor.ts';
import { AlertSource, ProcessingResult } from '../types.ts';

export async function routeSourceProcessing(source: AlertSource, supabaseClient: any): Promise<ProcessingResult> {
  console.log(`🚦 [Source Router] Routing processing for source type: ${source.source_type}`);
  
  // Use specialized processing for certain source types
  if (source.source_type === 'weather-geocmet') {
    return await processGeoMetSource(source, supabaseClient);
  } else if (source.source_type === 'security-rss' || source.source_type === 'rss') {
    return await processSecurityRSSSource(source, supabaseClient);
  } else if (source.source_type === 'immigration-travel-atom' || source.source_type === 'government-announcements') {
    return await processImmigrationTravelSource(source, supabaseClient);
  }
  
  // Fall back to generic processing
  return await processGenericSource(source, supabaseClient);
}
