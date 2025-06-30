import { UniversalAlert } from '@/types/alerts';

// Enhanced normalization that handles various RSS and alert formats
export const normalizeAlert = (alert: any, sourceType: string): UniversalAlert => {
  console.log('Normalizing alert from source:', sourceType, {
    alertId: { _type: typeof alert.id, value: alert.id },
    alertTitle: { _type: typeof alert.title, value: alert.title },
    alertSummary: { _type: typeof alert.summary, value: alert.summary },
    alertDescription: { _type: typeof alert.description, value: alert.description }
  });

  // Enhanced field extraction for RSS feeds
  const extractTitle = (alert: any): string => {
    // Try multiple fields for title extraction
    const titleSources = [
      alert.title,
      alert.headline,
      alert.name,
      alert.subject,
      alert.summary,
      alert.description
    ];
    
    for (const source of titleSources) {
      if (source && typeof source === 'string' && source.trim().length > 0) {
        let cleanTitle = source.trim();
        
        // Clean common prefixes
        cleanTitle = cleanTitle.replace(/^(Alert|Warning|Advisory|Notice):\s*/i, '');
        cleanTitle = cleanTitle.replace(/^\[.*?\]\s*/, '');
        
        // If it's too long, truncate it
        if (cleanTitle.length > 100) {
          cleanTitle = cleanTitle.substring(0, 97) + '...';
        }
        
        return cleanTitle;
      }
    }
    
    // Fallback based on source type
    if (sourceType.includes('security')) return 'Security Alert';
    if (sourceType.includes('weather')) return 'Weather Alert';
    if (sourceType.includes('emergency')) return 'Emergency Alert';
    
    return 'Alert Notification';
  };

  const extractDescription = (alert: any): string => {
    // Try multiple fields for description
    const descSources = [
      alert.description,
      alert.summary,
      alert.content,
      alert.details,
      alert.text,
      alert.title
    ];
    
    for (const source of descSources) {
      if (source && typeof source === 'string' && source.trim().length > 0) {
        let cleanDesc = source.trim();
        
        // Remove HTML tags
        cleanDesc = cleanDesc.replace(/<[^>]*>/g, '');
        
        // Clean common phrases
        cleanDesc = cleanDesc.replace(/emergency\s+alert\s+issued\s+by/i, 'Issued by');
        cleanDesc = cleanDesc.replace(/this\s+is\s+an?\s+/i, '');
        cleanDesc = cleanDesc.replace(/^\s*alert:\s*/i, '');
        
        // Ensure it ends with proper punctuation
        if (cleanDesc && !cleanDesc.match(/[.!?]$/)) {
          cleanDesc += '.';
        }
        
        return cleanDesc;
      }
    }
    
    return 'Alert details are available. Please check the original source for more information.';
  };

  const extractId = (alert: any): string => {
    return alert.id || 
           alert.guid || 
           alert.link ||
           `${sourceType}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const extractPublished = (alert: any): string => {
    const dateFields = [
      alert.published,
      alert.pubDate,
      alert.pub_date,
      alert.date,
      alert.created,
      alert.timestamp,
      alert.onset
    ];
    
    for (const dateField of dateFields) {
      if (dateField) {
        try {
          const date = new Date(dateField);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    return new Date().toISOString();
  };

  const extractSeverity = (alert: any): UniversalAlert['severity'] => {
    const severityFields = [
      alert.severity,
      alert.priority,
      alert.urgency,
      alert.level
    ];
    
    for (const field of severityFields) {
      if (field && typeof field === 'string') {
        const severity = field.toLowerCase().trim();
        
        if (['extreme', 'critical', 'catastrophic', 'emergency'].includes(severity)) return 'Extreme';
        if (['severe', 'high', 'major', 'serious'].includes(severity)) return 'Severe';
        if (['moderate', 'medium', 'warning', 'watch'].includes(severity)) return 'Moderate';
        if (['minor', 'low', 'advisory', 'information'].includes(severity)) return 'Minor';
        if (['info', 'informational', 'notice'].includes(severity)) return 'Info';
      }
    }
    
    // Determine severity from source type and content
    if (sourceType.includes('security') || sourceType.includes('cyber')) {
      return 'Moderate'; // Security alerts are generally important
    }
    
    if (sourceType.includes('weather')) {
      // Check description for weather severity indicators
      const desc = (alert.description || '').toLowerCase();
      if (desc.includes('tornado') || desc.includes('hurricane') || desc.includes('severe thunderstorm')) {
        return 'Severe';
      }
      return 'Minor';
    }
    
    return 'Unknown';
  };

  const extractUrgency = (alert: any): UniversalAlert['urgency'] => {
    const urgencyFields = [
      alert.urgency,
      alert.immediacy,
      alert.response
    ];
    
    for (const field of urgencyFields) {
      if (field && typeof field === 'string') {
        const urgency = field.toLowerCase().trim();
        
        if (['immediate', 'urgent', 'now', 'asap'].includes(urgency)) return 'Immediate';
        if (['expected', 'soon', 'likely', 'anticipated'].includes(urgency)) return 'Expected';
        if (['future', 'later', 'eventual', 'scheduled'].includes(urgency)) return 'Future';
        if (['past', 'expired', 'historical', 'completed'].includes(urgency)) return 'Past';
      }
    }
    
    return 'Unknown';
  };

  const extractCategory = (alert: any): string => {
    const categoryFields = [
      alert.category,
      alert.type,
      alert.event,
      alert.event_type,
      alert.kind
    ];
    
    for (const field of categoryFields) {
      if (field && typeof field === 'string' && field.trim().length > 0) {
        return field.trim();
      }
    }
    
    // Determine category from source type
    if (sourceType.includes('security') || sourceType.includes('cyber')) return 'Security';
    if (sourceType.includes('weather') || sourceType.includes('geocmet')) return 'Weather';
    if (sourceType.includes('emergency')) return 'Emergency';
    if (sourceType.includes('health')) return 'Health';
    
    return 'General';
  };

  const extractArea = (alert: any): string => {
    const areaFields = [
      alert.area,
      alert.location,
      alert.region,
      alert.province,
      alert.city,
      alert.zone,
      alert.administrative_area
    ];
    
    for (const field of areaFields) {
      if (field && typeof field === 'string' && field.trim().length > 0) {
        return field.trim();
      }
    }
    
    return 'Location not specified';
  };

  const extractSource = (sourceType: string): UniversalAlert['source'] => {
    if (sourceType.includes('alert-ready') || sourceType.includes('national')) return 'Alert Ready';
    if (sourceType.includes('bc') || sourceType.includes('british')) return 'BC Emergency';
    if (sourceType.includes('everbridge')) return 'Everbridge';
    if (sourceType.includes('security') || sourceType.includes('cyber')) return 'Other';
    if (sourceType.includes('weather') || sourceType.includes('geocmet')) return 'Other';
    
    return 'Other';
  };

  const extractCoordinates = (alert: any) => {
    // Try various coordinate formats
    if (alert.coordinates && typeof alert.coordinates === 'object') {
      if (alert.coordinates.latitude && alert.coordinates.longitude) {
        return {
          latitude: parseFloat(alert.coordinates.latitude),
          longitude: parseFloat(alert.coordinates.longitude)
        };
      }
    }
    
    if (alert.geometry_coordinates) {
      try {
        const coords = typeof alert.geometry_coordinates === 'string' 
          ? JSON.parse(alert.geometry_coordinates) 
          : alert.geometry_coordinates;
        
        if (Array.isArray(coords) && coords.length >= 2) {
          return {
            latitude: parseFloat(coords[1]),
            longitude: parseFloat(coords[0])
          };
        }
      } catch (e) {
        console.warn('Failed to parse geometry coordinates:', e);
      }
    }
    
    if (alert.latitude && alert.longitude) {
      return {
        latitude: parseFloat(alert.latitude),
        longitude: parseFloat(alert.longitude)
      };
    }
    
    return undefined;
  };

  const normalized: UniversalAlert = {
    id: extractId(alert),
    title: extractTitle(alert),
    description: extractDescription(alert),
    severity: extractSeverity(alert),
    urgency: extractUrgency(alert),
    category: extractCategory(alert),
    status: 'Actual',
    area: extractArea(alert),
    published: extractPublished(alert),
    updated: alert.updated ? extractPublished({ published: alert.updated }) : undefined,
    expires: alert.expires ? extractPublished({ published: alert.expires }) : undefined,
    effective: alert.effective ? extractPublished({ published: alert.effective }) : undefined,
    url: alert.url || alert.link || alert.guid,
    instructions: alert.instructions || alert.action,
    author: alert.author || alert.source || sourceType,
    source: extractSource(sourceType),
    coordinates: extractCoordinates(alert)
  };

  console.log('Normalized alert result:', {
    id: normalized.id,
    title: normalized.title,
    source: normalized.source,
    severity: normalized.severity
  });

  return normalized;
};

// Batch normalization function
export const normalizeAlertBatch = (alerts: any[], sourceType: string): {
  normalizedAlerts: UniversalAlert[];
  errors: string[];
  stats: {
    total: number;
    successful: number;
    failed: number;
  };
} => {
  const normalizedAlerts: UniversalAlert[] = [];
  const errors: string[] = [];
  
  alerts.forEach((alert, index) => {
    try {
      const normalized = normalizeAlert(alert, sourceType);
      normalizedAlerts.push(normalized);
    } catch (error) {
      const errorMsg = `Failed to normalize alert ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
      errors.push(errorMsg);
      console.error(errorMsg, alert);
    }
  });
  
  return {
    normalizedAlerts,
    errors,
    stats: {
      total: alerts.length,
      successful: normalizedAlerts.length,
      failed: errors.length
    }
  };
};

// Test data filter - remove obvious test/dummy data
export const filterTestData = (alerts: UniversalAlert[]): UniversalAlert[] => {
  return alerts.filter(alert => {
    // Filter out obvious test data
    const isTestData = alert.title.toLowerCase().includes('test') ||
                      alert.title.toLowerCase().includes('dummy') ||
                      alert.description.toLowerCase().includes('test') ||
                      alert.title === 'Untitled Alert' ||
                      alert.description === 'No description available';
    
    return !isTestData;
  });
};
