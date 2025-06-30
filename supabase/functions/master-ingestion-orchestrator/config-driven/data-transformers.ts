
import { UniversalAlert } from '../alert-types.ts';

// Normalize severity with mapping support
export const normalizeSeverity = (value: string, severityMapping?: Record<string, string>): UniversalAlert['severity'] => {
  if (!value) return 'Unknown';
  
  const normalizedValue = value.toString().toLowerCase();
  
  // Use custom mapping if provided
  if (severityMapping) {
    const mapped = severityMapping[normalizedValue] || 
                  severityMapping[value];
    if (mapped) return mapped as UniversalAlert['severity'];
  }
  
  // Default severity normalization
  if (normalizedValue.includes('extreme') || normalizedValue.includes('critical')) return 'Extreme';
  if (normalizedValue.includes('severe') || normalizedValue.includes('high')) return 'Severe';
  if (normalizedValue.includes('moderate') || normalizedValue.includes('medium')) return 'Moderate';
  if (normalizedValue.includes('minor') || normalizedValue.includes('low')) return 'Minor';
  if (normalizedValue.includes('info') || normalizedValue.includes('information')) return 'Info';
  
  return 'Unknown';
};

// Normalize urgency
export const normalizeUrgency = (value?: string): UniversalAlert['urgency'] => {
  if (!value) return 'Unknown';
  
  const normalizedValue = value.toString().toLowerCase();
  if (normalizedValue.includes('immediate')) return 'Immediate';
  if (normalizedValue.includes('expected')) return 'Expected';
  if (normalizedValue.includes('future')) return 'Future';
  if (normalizedValue.includes('past')) return 'Past';
  
  return 'Unknown';
};

// Normalize status
export const normalizeStatus = (value?: string): UniversalAlert['status'] => {
  if (!value) return 'Unknown';
  
  const normalizedValue = value.toString().toLowerCase();
  if (normalizedValue.includes('actual')) return 'Actual';
  if (normalizedValue.includes('exercise')) return 'Exercise';
  if (normalizedValue.includes('system')) return 'System';
  if (normalizedValue.includes('test')) return 'Test';
  if (normalizedValue.includes('draft')) return 'Draft';
  
  return 'Unknown';
};

// Normalize date
export const normalizeDate = (value: string): string => {
  if (!value) return new Date().toISOString();
  
  try {
    return new Date(value).toISOString();
  } catch {
    return new Date().toISOString();
  }
};

// Map source type to normalized source
export const getSourceName = (type: string): UniversalAlert['source'] => {
  switch (type.toLowerCase()) {
    case 'emergency':
    case 'alert-ready':
      return 'Alert Ready';
    case 'weather':
    case 'weather-geocmet':
      return 'Alert Ready'; // Weather alerts through Alert Ready system
    case 'bc':
    case 'bc-emergency':
      return 'BC Emergency';
    case 'everbridge':
      return 'Everbridge';
    default:
      return 'Other';
  }
};
