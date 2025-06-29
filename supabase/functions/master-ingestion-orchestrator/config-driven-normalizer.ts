
import { UniversalAlert } from './alert-types.ts';

export interface SourceConfiguration {
  normalization: {
    titleField: string;
    descriptionField: string;
    severityField: string;
    categoryField?: string;
    publishedField: string;
    areaField?: string;
    urgencyField?: string;
    statusField?: string;
    urlField?: string;
    instructionsField?: string;
  };
  fieldMapping?: Record<string, string>;
  transformations?: {
    severityMapping?: Record<string, string>;
    categoryMapping?: Record<string, string>;
  };
}

export function normalizeWithConfiguration(
  rawData: any,
  config: SourceConfiguration,
  sourceType: string
): UniversalAlert {
  const { normalization, fieldMapping, transformations } = config;
  
  // Helper function to extract nested field values
  const extractField = (data: any, fieldPath: string): any => {
    if (!fieldPath) return undefined;
    
    return fieldPath.split('.').reduce((obj, key) => {
      return obj && obj[key] !== undefined ? obj[key] : undefined;
    }, data);
  };

  // Extract core fields using configuration
  const title = extractField(rawData, normalization.titleField) || 'Untitled Alert';
  const description = extractField(rawData, normalization.descriptionField) || 'No description available';
  const rawSeverity = extractField(rawData, normalization.severityField);
  const category = extractField(rawData, normalization.categoryField) || 'General';
  const published = extractField(rawData, normalization.publishedField) || new Date().toISOString();
  const area = extractField(rawData, normalization.areaField) || 'Area not specified';
  
  // Optional fields
  const urgency = extractField(rawData, normalization.urgencyField);
  const status = extractField(rawData, normalization.statusField);
  const url = extractField(rawData, normalization.urlField);
  const instructions = extractField(rawData, normalization.instructionsField);

  // Normalize severity with mapping support
  const normalizeSeverity = (value: string): UniversalAlert['severity'] => {
    if (!value) return 'Unknown';
    
    const normalizedValue = value.toString().toLowerCase();
    
    // Use custom mapping if provided
    if (transformations?.severityMapping) {
      const mapped = transformations.severityMapping[normalizedValue] || 
                    transformations.severityMapping[value];
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
  const normalizeUrgency = (value?: string): UniversalAlert['urgency'] => {
    if (!value) return 'Unknown';
    
    const normalizedValue = value.toString().toLowerCase();
    if (normalizedValue.includes('immediate')) return 'Immediate';
    if (normalizedValue.includes('expected')) return 'Expected';
    if (normalizedValue.includes('future')) return 'Future';
    if (normalizedValue.includes('past')) return 'Past';
    
    return 'Unknown';
  };

  // Normalize status
  const normalizeStatus = (value?: string): UniversalAlert['status'] => {
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
  const normalizeDate = (value: string): string => {
    if (!value) return new Date().toISOString();
    
    try {
      return new Date(value).toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  // Map source type to normalized source
  const getSourceName = (type: string): UniversalAlert['source'] => {
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

  // Extract coordinates if available
  const extractCoordinates = (data: any) => {
    // Try common coordinate field patterns
    const coordPaths = [
      'geometry.coordinates',
      'coordinates',
      'location.coordinates',
      'lat,lng',
      'latitude,longitude'
    ];
    
    for (const path of coordPaths) {
      const coords = extractField(data, path);
      if (coords && Array.isArray(coords) && coords.length >= 2) {
        return {
          longitude: parseFloat(coords[0]),
          latitude: parseFloat(coords[1])
        };
      }
    }
    
    // Try separate lat/lng fields
    const lat = extractField(data, 'latitude') || extractField(data, 'lat');
    const lng = extractField(data, 'longitude') || extractField(data, 'lng');
    
    if (lat && lng) {
      return {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
      };
    }
    
    return undefined;
  };

  // Build the normalized alert
  const normalizedAlert: UniversalAlert = {
    id: rawData.id || `config-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: title.toString(),
    description: description.toString(),
    severity: normalizeSeverity(rawSeverity),
    urgency: normalizeUrgency(urgency),
    category: category.toString(),
    status: normalizeStatus(status),
    area: area.toString(),
    published: normalizeDate(published),
    source: getSourceName(sourceType),
    url: url?.toString(),
    instructions: instructions?.toString(),
    coordinates: extractCoordinates(rawData)
  };

  console.log(`Config-driven normalization completed for ${sourceType}:`, {
    originalTitle: extractField(rawData, normalization.titleField),
    normalizedTitle: normalizedAlert.title,
    originalSeverity: rawSeverity,
    normalizedSeverity: normalizedAlert.severity
  });

  return normalizedAlert;
}

// Enhanced batch processing with configuration support
export function normalizeAlertBatchWithConfig(
  alerts: any[],
  config: SourceConfiguration,
  sourceType: string
): UniversalAlert[] {
  return alerts.map(alert => {
    try {
      return normalizeWithConfiguration(alert, config, sourceType);
    } catch (error) {
      console.error(`Error normalizing alert with config:`, error);
      
      // Return minimal valid alert on error
      return {
        id: `error-${Date.now()}`,
        title: 'Alert Processing Error',
        description: 'Failed to process alert data',
        severity: 'Unknown' as const,
        urgency: 'Unknown' as const,
        category: 'Error',
        status: 'Unknown' as const,
        area: 'Unknown',
        published: new Date().toISOString(),
        source: 'Other' as const
      };
    }
  });
}
