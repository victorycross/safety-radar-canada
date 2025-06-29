
import { AlertSource } from './types.ts';

export async function normalizeAlerts(data: any, source: AlertSource): Promise<any[]> {
  const alerts: any[] = [];
  
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
    const normalizedAlert = {
      title: item.title || item.properties?.headline || item.summary || 'Untitled Alert',
      description: item.description || item.properties?.description || item.content || '',
      severity: normalizeSeverity(item.severity || item.properties?.severity || 'Minor'),
      timestamp: parseTimestamp(item.pubDate || item.updated || item.properties?.onset || new Date().toISOString()),
      source_type: source.source_type,
      source_name: source.name,
      raw_data: item,
      confidence_score: calculateConfidenceScore(item, source),
      geographic_data: extractGeographicData(item)
    };
    
    alerts.push(normalizedAlert);
  }
  
  return alerts;
}

function normalizeSeverity(severity: string): string {
  const severityLower = severity.toLowerCase();
  
  if (['extreme', 'severe', 'critical', 'high'].includes(severityLower)) {
    return 'severe';
  } else if (['moderate', 'warning', 'medium'].includes(severityLower)) {
    return 'warning';
  } else {
    return 'normal';
  }
}

function parseTimestamp(timestamp: string): string {
  try {
    return new Date(timestamp).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function calculateConfidenceScore(item: any, source: AlertSource): number {
  let score = 0.5; // Base score
  
  // Increase confidence for official sources
  if (['weather', 'weather-geocmet', 'emergency', 'security-rss'].includes(source.source_type)) {
    score += 0.3;
  }
  
  // Increase confidence if location data is present
  if (item.geometry || item.area || item.location) {
    score += 0.1;
  }
  
  // Increase confidence if timestamp is recent
  const timestamp = new Date(item.pubDate || item.updated || Date.now());
  const hoursOld = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
  if (hoursOld < 24) {
    score += 0.1;
  }
  
  return Math.min(1.0, score);
}

function extractGeographicData(item: any): any {
  const geoData: any = {};
  
  // Extract coordinates from various formats
  if (item.geometry?.coordinates) {
    geoData.longitude = item.geometry.coordinates[0];
    geoData.latitude = item.geometry.coordinates[1];
  }
  
  // Extract area information
  if (item.area || item.properties?.areaDesc) {
    geoData.area = item.area || item.properties.areaDesc;
  }
  
  return geoData;
}

export async function queueAlertsForProcessing(supabaseClient: any, alerts: any[], sourceId: string): Promise<number> {
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
