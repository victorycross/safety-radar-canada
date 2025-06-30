
import { AlertSource } from './types.ts';
import { UniversalAlert } from './alert-types.ts';
import { 
  normalizeSeverity, 
  normalizeUrgency, 
  normalizeStatus, 
  parseTimestamp, 
  getSourceName, 
  extractCoordinates 
} from './normalization/core-normalizers.ts';
import { getAcceptHeader, parseXmlData } from './normalization/data-parsers.ts';
import { queueAlertsForProcessing } from './normalization/alert-queue.ts';

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

// Re-export utilities for backward compatibility
export { normalizeSeverity, normalizeUrgency, normalizeStatus } from './normalization/core-normalizers.ts';
export { queueAlertsForProcessing } from './normalization/alert-queue.ts';
export { getAcceptHeader, parseXmlData } from './normalization/data-parsers.ts';
