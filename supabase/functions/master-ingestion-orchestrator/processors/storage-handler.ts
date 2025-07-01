
import { storeSecurityAlerts } from './storage/security-storage.ts';
import { storeWeatherAlerts } from './storage/weather-storage.ts';
import { storeImmigrationTravelAnnouncements } from './storage/immigration-travel-storage.ts';
import { AlertSource } from '../types.ts';

export async function storeAlertsByType(supabaseClient: any, processedAlerts: any[], source: AlertSource): Promise<number> {
  console.log(`📦 [Storage Handler] Routing storage for source type: ${source.source_type}`);
  
  // Route to appropriate storage handler based on source type
  switch (source.source_type) {
    case 'security-rss':
    case 'rss':
      return await storeSecurityAlerts(supabaseClient, processedAlerts, source);
    
    case 'weather-geocmet':
    case 'weather':
      return await storeWeatherAlerts(supabaseClient, processedAlerts, source);
    
    case 'immigration-travel-atom':
    case 'government-announcements':
      return await storeImmigrationTravelAnnouncements(supabaseClient, processedAlerts, source);
    
    default:
      console.warn(`📦 [Storage Handler] Unknown source type: ${source.source_type}, defaulting to security storage`);
      return await storeSecurityAlerts(supabaseClient, processedAlerts, source);
  }
}
