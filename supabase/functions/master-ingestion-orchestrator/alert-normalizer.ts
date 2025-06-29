
import { AlertSource } from './types.ts';
import { UniversalAlert } from '../../../src/types/alerts.ts';

// Normalize severity levels from various sources
export const normalizeSeverity = (severity: string | undefined): UniversalAlert['severity'] => {
  if (!severity) return 'Unknown';
  
  const normalizedSeverity = severity.toLowerCase().trim();
  
  if (['extreme', 'critical', 'catastrophic'].includes(normalizedSeverity)) return 'Extreme';
  if (['severe', 'major', 'high'].includes(normalizedSeverity)) return 'Severe';
  if (['moderate', 'medium', 'warning'].includes(normalizedSeverity)) return 'Moderate';
  if (['minor', 'low', 'advisory'].includes(normalizedSeverity)) return 'Minor';
  if (['info', 'information', 'informational'].includes(normalizedSeverity)) return 'Info';
  
  return 'Unknown';
};

// Normalize urgency levels from various sources
export const normalizeUrgency = (urgency: string | undefined): UniversalAlert['urgency'] => {
  if (!urgency) return 'Unknown';
  
  const normalizedUrgency = urgency.toLowerCase().trim();
  
  if (['immediate', 'now', 'urgent'].includes(normalizedUrgency)) return 'Immediate';
  if (['expected', 'soon', 'likely'].includes(normalizedUrgency)) return 'Expected';
  if (['future', 'later', 'eventual'].includes(normalizedUrgency)) return 'Future';
  if (['past', 'expired', 'historical'].includes(normalizedUrgency)) return 'Past';
  
  return 'Unknown';
};

// Normalize status levels from various sources
export const normalizeStatus = (status: string | undefined): UniversalAlert['status'] => {
  if (!status) return 'Unknown';
  
  const normalizedStatus = status.toLowerCase().trim();
  
  if (['actual', 'real', 'live'].includes(normalizedStatus)) return 'Actual';
  if (['exercise', 'drill', 'training'].includes(normalizedStatus)) return 'Exercise';
  if (['system', 'technical', 'maintenance'].includes(normalizedStatus)) return 'System';
  if (['test', 'testing'].includes(normalizedStatus)) return 'Test';
  if (['draft', 'preliminary'].includes(normalizedStatus)) return 'Draft';
  
  return 'Unknown';
};

export async function normalizeAlerts(data: any, source: AlertSource): Promise<UniversalAlert[]> {
  const alerts: UniversalAlert[] = [];
  
  // Handle different data formats
  let items: any[] = [];
  
  if (data.items) {
    items = data.items;
  } else if (data.features) {
    items = data.features; // GeoJSON format
  } else if (Array.isArray(data)) {
    items = data;
  } else if (data.alerts) {
    items = data.alerts;
  }

  for (const item of items) {
    // Extract data from properties if it's a GeoJSON feature
    const props = item.properties || item;
    
    const normalizedAlert: UniversalAlert = {
      id: item.id || props.id || `${source.source_type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: props.title || props.headline || props.name || 'Untitled Alert',
      description: props.description || props.summary || props.details || 'No description available',
      severity: normalizeSeverity(props.severity || props.priority),
      urgency: normalizeUrgency(props.urgency || props.immediacy),
      category: props.category || props.type || 'General',
      status: normalizeStatus(props.status),
      area: props.area || props.location || props.region || 'Area not specified',
      published: parseTimestamp(props.published || props.created || props.date || new Date().toISOString()),
      updated: props.updated ? parseTimestamp(props.updated) : undefined,
      expires: props.expires || props.expiry ? parseTimestamp(props.expires || props.expiry) : undefined,
      effective: props.effective || props.onset ? parseTimestamp(props.effective || props.onset) : undefined,
      url: props.url || props.link,
      instructions: props.instructions || props.action,
      author: props.author || props.source || source.name,
      source: getSourceName(source.source_type),
      coordinates: extractCoordinates(item)
    };
    
    alerts.push(normalizedAlert);
  }
  
  return alerts;
}

function parseTimestamp(timestamp: string): string {
  try {
    return new Date(timestamp).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function getSourceName(sourceType: string): UniversalAlert['source'] {
  switch (sourceType.toLowerCase()) {
    case 'alert-ready':
    case 'national':
      return 'Alert Ready';
    case 'bc':
    case 'bc-emergency':
      return 'BC Emergency';
    case 'everbridge':
      return 'Everbridge';
    default:
      return 'Other';
  }
}

function extractCoordinates(item: any): { latitude: number; longitude: number } | undefined {
  // Try various coordinate formats
  if (item.geometry?.coordinates) {
    const coords = item.geometry.coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      return { longitude: coords[0], latitude: coords[1] };
    }
  }
  
  if (item.latitude && item.longitude) {
    return { latitude: parseFloat(item.latitude), longitude: parseFloat(item.longitude) };
  }
  
  if (item.lat && item.lng) {
    return { latitude: parseFloat(item.lat), longitude: parseFloat(item.lng) };
  }
  
  return undefined;
}

export async function queueAlertsForProcessing(supabaseClient: any, alerts: UniversalAlert[], sourceId: string): Promise<number> {
  if (!alerts.length) return 0;
  
  const queueItems = alerts.map(alert => ({
    source_id: sourceId,
    raw_payload: alert,
    processing_status: 'pending'
  }));
  
  const { error } = await supabaseClient
    .from('alert_ingestion_queue')
    .insert(queueItems);
  
  if (error) {
    console.error('Failed to queue alerts:', error);
    return 0;
  }
  
  return alerts.length;
}

export function getAcceptHeader(sourceType: string): string {
  switch (sourceType) {
    case 'weather':
    case 'weather-geocmet':
      return 'application/json, application/geo+json, application/xml, text/xml';
    case 'security':
    case 'security-rss':
    case 'policy':
      return 'application/rss+xml, application/xml, text/xml';
    default:
      return 'application/json, application/xml';
  }
}

export async function parseXmlData(xmlText: string, sourceType: string): Promise<any> {
  // Simple XML parsing - in production, you'd use a proper XML parser
  const items: any[] = [];
  
  // Extract RSS items or CAP alerts
  const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || 
                     xmlText.match(/<alert[^>]*>[\s\S]*?<\/alert>/gi) ||
                     xmlText.match(/<entry[^>]*>[\s\S]*?<\/entry>/gi);

  for (const itemMatch of itemMatches || []) {
    const item: any = {};
    
    // Extract common fields
    const titleMatch = itemMatch.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descMatch = itemMatch.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
    const linkMatch = itemMatch.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    const pubDateMatch = itemMatch.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
                        itemMatch.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i);
    
    if (titleMatch) item.title = titleMatch[1].trim();
    if (descMatch) item.description = descMatch[1].trim();
    if (linkMatch) item.link = linkMatch[1].trim();
    if (pubDateMatch) item.pubDate = pubDateMatch[1].trim();
    
    // Extract severity for CAP alerts
    const severityMatch = itemMatch.match(/<severity[^>]*>([\s\S]*?)<\/severity>/i);
    if (severityMatch) item.severity = severityMatch[1].trim();
    
    // Extract location data
    const areaMatch = itemMatch.match(/<area[^>]*>([\s\S]*?)<\/area>/i);
    if (areaMatch) item.area = areaMatch[1].trim();
    
    items.push(item);
  }
  
  return { items };
}
