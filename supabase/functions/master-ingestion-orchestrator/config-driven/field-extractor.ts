
// Field extraction utilities for config-driven normalization

// Helper function to extract nested field values
export const extractField = (data: any, fieldPath: string): any => {
  if (!fieldPath) return undefined;
  
  return fieldPath.split('.').reduce((obj, key) => {
    return obj && obj[key] !== undefined ? obj[key] : undefined;
  }, data);
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
