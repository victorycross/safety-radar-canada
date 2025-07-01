import { AlertSource } from '../../types.ts';

export function mapSecurityAlerts(processedAlerts: any[], source: AlertSource): any[] {
  console.log(`🗺️ [Alert Mapper] Starting security alert mapping for ${source.name}`);
  console.log(`🗺️ [Alert Mapper] Input alerts count: ${processedAlerts.length}`);
  
  const mappedAlerts = processedAlerts.map((alert, index) => {
    console.log(`🗺️ [Alert Mapper] Mapping alert ${index + 1}/${processedAlerts.length}`);
    
    const alertId = alert.id || alert.guid || `${source.source_type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const mappedAlert = {
      id: alertId,
      title: alert.title || 'Untitled Alert',
      summary: alert.description || alert.summary,
      link: alert.url || alert.link || alert.link,
      pub_date: alert.published || alert.pubDate || new Date().toISOString(),
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
