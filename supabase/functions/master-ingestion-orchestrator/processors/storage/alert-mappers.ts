
import { AlertSource } from '../../types.ts';

export function mapSecurityAlerts(processedAlerts: any[], source: AlertSource): any[] {
  return processedAlerts.map(alert => ({
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
