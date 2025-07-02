
// Field extraction utilities for config-driven normalization

// Helper function to extract nested field values
export const extractField = (data: any, fieldPath: string): any => {
  if (!fieldPath) return undefined;
  
  return fieldPath.split('.').reduce((obj, key) => {
    return obj && obj[key] !== undefined ? obj[key] : undefined;
  }, data);
};

// Enhanced area extraction with Canadian province/territory normalization
export const extractCanadianArea = (data: any, areaField?: string): string => {
  let area = areaField ? extractField(data, areaField) : 
    extractField(data, 'area') || 
    extractField(data, 'location') || 
    extractField(data, 'region') ||
    extractField(data, 'province') ||
    extractField(data, 'territory');
  
  if (!area || typeof area !== 'string') {
    return 'Canada';
  }
  
  area = area.trim();
  
  // Normalize Canadian provinces and territories
  const provinceMap: Record<string, string> = {
    'ab': 'Alberta', 'alberta': 'Alberta',
    'bc': 'British Columbia', 'british columbia': 'British Columbia',
    'mb': 'Manitoba', 'manitoba': 'Manitoba',
    'nb': 'New Brunswick', 'new brunswick': 'New Brunswick',
    'nl': 'Newfoundland and Labrador', 'newfoundland and labrador': 'Newfoundland and Labrador',
    'nt': 'Northwest Territories', 'northwest territories': 'Northwest Territories',
    'ns': 'Nova Scotia', 'nova scotia': 'Nova Scotia',
    'nu': 'Nunavut', 'nunavut': 'Nunavut',
    'on': 'Ontario', 'ontario': 'Ontario',
    'pe': 'Prince Edward Island', 'prince edward island': 'Prince Edward Island',
    'qc': 'Quebec', 'quebec': 'Quebec', 'québec': 'Quebec',
    'sk': 'Saskatchewan', 'saskatchewan': 'Saskatchewan',
    'yt': 'Yukon', 'yukon': 'Yukon',
    'canada': 'Canada'
  };
  
  const normalized = provinceMap[area.toLowerCase()];
  return normalized || area;
};

// Extract coordinates if available
export const extractCoordinates = (data: any) => {
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
