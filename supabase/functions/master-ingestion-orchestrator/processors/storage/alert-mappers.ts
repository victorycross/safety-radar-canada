
import { AlertSource } from '../../types.ts';

export function mapSecurityAlerts(processedAlerts: any[], source: AlertSource): any[] {
  return processedAlerts.map(alert => ({
    id: alert.id || generateAlertId(alert),
    title: alert.title || 'Security Alert',
    summary: alert.description || alert.summary || 'No summary available',
    link: alert.link || source.api_endpoint,
    pub_date: alert.timestamp || new Date().toISOString(),
    category: alert.category || 'cybersecurity',
    source: source.name,
    location: alert.location || 'Global',
    raw_data: alert.raw_data || alert,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
}

export function mapWeatherAlerts(processedAlerts: any[], source: AlertSource): any[] {
  return processedAlerts.map(alert => ({
    id: alert.id || generateAlertId(alert),
    description: alert.description || alert.title || 'Weather Alert',
    severity: alert.severity || 'normal',
    event_type: alert.event_type || 'weather',
    onset: alert.onset || alert.timestamp || new Date().toISOString(),
    expires: alert.expires || null,
    geometry_coordinates: alert.geometry_coordinates || alert.coordinates || null,
    raw_data: alert.raw_data || alert,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
}

export function mapImmigrationTravelAlerts(processedAlerts: any[], source: AlertSource): any[] {
  return processedAlerts.map(alert => ({
    id: alert.id || generateAlertId(alert),
    title: alert.title || 'Immigration/Travel Announcement',
    summary: alert.summary || alert.description || 'No summary available',
    content: alert.content || alert.description || 'No content available',
    link: alert.link || source.api_endpoint,
    pub_date: alert.timestamp || new Date().toISOString(),
    category: alert.category || 'immigration',
    announcement_type: alert.announcement_type || 'general',
    source: source.name,
    location: alert.location || 'Canada',
    raw_data: alert.raw_data || alert,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
}

function generateAlertId(alert: any): string {
  // Generate a consistent ID based on content
  const content = `${alert.title || ''}-${alert.timestamp || Date.now()}`;
  return btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
}
