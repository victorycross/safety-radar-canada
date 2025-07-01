
import { AlertSource } from '../../types.ts';

export function mapSecurityAlerts(processedAlerts: any[], source: AlertSource): any[] {
  console.log(`🗺️ [Alert Mapper] Starting security alert mapping for ${source.name}`);
  console.log(`🗺️ [Alert Mapper] Input alerts count: ${processedAlerts.length}`);
  
  const mappedAlerts = processedAlerts.map((alert, index) => {
    console.log(`🗺️ [Alert Mapper] Mapping alert ${index + 1}/${processedAlerts.length}`);
    
    // Handle both RSS and Atom feed IDs
    const alertId = alert.id || alert.guid || alert.link || `${source.source_type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Clean up HTML content from Atom feeds
    let cleanDescription = alert.description || alert.summary || '';
    if (cleanDescription) {
      // Remove HTML tags and decode CDATA
      cleanDescription = cleanDescription
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') // Remove CDATA wrapper
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Remove HTML entities
        .trim();
      
      // Truncate if too long
      if (cleanDescription.length > 1000) {
        cleanDescription = cleanDescription.substring(0, 997) + '...';
      }
    }
    
    const mappedAlert = {
      id: alertId,
      title: alert.title || 'Untitled Alert',
      summary: cleanDescription || 'No description available',
      link: alert.url || alert.link,
      pub_date: alert.published || alert.pubDate || alert.updated || new Date().toISOString(),
      source: source.name,
      category: alert.category || 'Security',
      location: alert.area || 'Global',
      raw_data: alert
    };
    
    // Validate required fields
    if (!mappedAlert.title || mappedAlert.title.trim() === '') {
      console.warn(`🗺️ [Alert Mapper] Warning: Alert ${index + 1} has empty title, using fallback`);
      mappedAlert.title = 'Security Alert';
    }
    
    // Clean up title from CDATA
    if (mappedAlert.title.includes('CDATA')) {
      mappedAlert.title = mappedAlert.title.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
    }
    
    if (index === 0) {
      console.log(`🗺️ [Alert Mapper] Sample mapped security alert:`, JSON.stringify(mappedAlert, null, 2));
    }
    
    return mappedAlert;
  });
  
  console.log(`🗺️ [Alert Mapper] Successfully mapped ${mappedAlerts.length} security alerts`);
  return mappedAlerts;
}

export function mapWeatherAlerts(processedAlerts: any[], source: AlertSource): any[] {
  return processedAlerts.map(alert => ({
    id: alert.id || `${source.source_type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    description: alert.description || 'No description available',
    severity: alert.severity,
    event_type: alert.category || 'Weather',
    onset: alert.effective || alert.published,
    expires: alert.expires,
    geometry_coordinates: alert.coordinates ? JSON.stringify(alert.coordinates) : null,
    raw_data: alert
  }));
}
