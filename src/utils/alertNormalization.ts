
import { UniversalAlert, AlertNormalizationResult } from '@/types/alerts';

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

// Clean and format alert titles
export const normalizeTitle = (title: string | undefined): string => {
  if (!title) return 'Untitled Alert';
  
  let cleaned = title
    .replace(/^(Alert|Warning|Advisory|Notice):\s*/i, '')
    .replace(/\s*-\s*(Alert Ready|Emergency Alert|BC Emergency)$/i, '')
    .replace(/^\[.*?\]\s*/, '')
    .trim();
  
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

// Clean and format descriptions
export const normalizeDescription = (description: string | undefined): string => {
  if (!description) return 'No description available';
  
  let cleaned = description
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/emergency\s+alert\s+issued\s+by/i, 'Issued by')
    .replace(/this\s+is\s+an?\s+/i, '')
    .replace(/^\s*alert:\s*/i, '')
    .trim();
  
  if (cleaned && !cleaned.match(/[.!?]$/)) {
    cleaned += '.';
  }
  
  return cleaned;
};

// Normalize geographic area information
export const normalizeArea = (area: string | undefined): string => {
  if (!area || area === 'Unknown' || area === 'N/A') {
    return 'Area not specified';
  }
  
  return area.trim().replace(/\s+/g, ' ');
};

// Parse and normalize dates
export const normalizeDate = (dateString: string | undefined): string => {
  if (!dateString) return new Date().toISOString();
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return new Date().toISOString();
    }
    return date.toISOString();
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return new Date().toISOString();
  }
};

// Extract coordinates from various formats
export const extractCoordinates = (data: any): { latitude: number; longitude: number } | undefined => {
  // Try various coordinate formats
  if (data.geometry?.coordinates) {
    const coords = data.geometry.coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      return { longitude: coords[0], latitude: coords[1] };
    }
  }
  
  if (data.latitude && data.longitude) {
    return { latitude: parseFloat(data.latitude), longitude: parseFloat(data.longitude) };
  }
  
  if (data.lat && data.lng) {
    return { latitude: parseFloat(data.lat), longitude: parseFloat(data.lng) };
  }
  
  return undefined;
};
