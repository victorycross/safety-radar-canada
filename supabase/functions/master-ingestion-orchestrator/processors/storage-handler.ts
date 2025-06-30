
import { AlertSource } from '../types.ts';

export async function storeAlertsByType(supabaseClient: any, processedAlerts: any[], source: AlertSource): Promise<number> {
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
