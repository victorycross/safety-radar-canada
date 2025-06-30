
import { UniversalAlert } from '../alert-types.ts';

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

export function parseTimestamp(timestamp: string): string {
  try {
    return new Date(timestamp).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export function getSourceName(sourceType: string): UniversalAlert['source'] {
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

export function extractCoordinates(item: any): { latitude: number; longitude: number } | undefined {
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
