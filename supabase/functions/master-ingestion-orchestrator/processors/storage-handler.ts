
import { AlertSource } from '../types.ts';
import { storeSecurityAlerts } from './storage/security-storage.ts';
import { storeWeatherAlerts } from './storage/weather-storage.ts';

export async function storeAlertsByType(supabaseClient: any, processedAlerts: any[], source: AlertSource): Promise<number> {
  let storedCount = 0;
  
  if (source.source_type === 'security-rss' || source.source_type === 'rss') {
    storedCount = await storeSecurityAlerts(supabaseClient, processedAlerts, source);
  } else if (source.source_type === 'weather' || source.source_type === 'weather-geocmet') {
    storedCount = await storeWeatherAlerts(supabaseClient, processedAlerts, source);
  }
  
  return storedCount;
}
