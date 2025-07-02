
import { UniversalAlert } from '../alert-types.ts';

// Normalize severity with enhanced Canadian government feed support
export const normalizeSeverity = (value: string, severityMapping?: Record<string, string>, content?: string): UniversalAlert['severity'] => {
  if (!value && !content) return 'Unknown';
  
  const normalizedValue = value?.toString().toLowerCase() || '';
  const contentText = content?.toLowerCase() || '';
  
  // Use custom mapping if provided
  if (severityMapping && value) {
    const mapped = severityMapping[normalizedValue] || 
                  severityMapping[value];
    if (mapped) return mapped as UniversalAlert['severity'];
  }
  
  // Enhanced severity detection with content analysis
  const combinedText = `${normalizedValue} ${contentText}`;
  
  // Extreme severity indicators
  if (combinedText.match(/\b(extreme|critical|emergency|catastrophic|tornado|hurricane|tsunami|terrorist)\b/)) {
    return 'Extreme';
  }
  
  // Severe severity indicators
  if (combinedText.match(/\b(severe|major|high|warning|alert|evacuation|shelter|lockdown)\b/)) {
    return 'Severe';
  }
  
  // Moderate severity indicators
  if (combinedText.match(/\b(moderate|medium|watch|advisory|caution|prepare)\b/)) {
    return 'Moderate';
  }
  
  // Minor severity indicators
  if (combinedText.match(/\b(minor|low|advisory|notice|update|information)\b/)) {
    return 'Minor';
  }
  
  // Info severity indicators
  if (combinedText.match(/\b(info|information|informational|announcement|bulletin)\b/)) {
    return 'Info';
  }
  
  // Default to Moderate for Canadian government sources to err on side of caution
  return 'Moderate';
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
