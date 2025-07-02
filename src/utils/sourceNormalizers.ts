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
    
    // Try explicit severity fields first
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
    
    // Enhanced content-based severity detection for Canadian feeds
    const title = (alert.title || '').toLowerCase();
    const description = (alert.description || '').toLowerCase();
    const combinedText = `${title} ${description}`;
    
    // Extreme severity indicators
    if (combinedText.match(/\b(extreme|critical|emergency|catastrophic|tornado|hurricane|tsunami|terrorist|evacuation)\b/)) {
      return 'Extreme';
    }
    
    // Severe severity indicators
    if (combinedText.match(/\b(severe|major|high|warning|alert|lockdown|shelter|dangerous)\b/)) {
      return 'Severe';
    }
    
    // Moderate severity indicators
    if (combinedText.match(/\b(moderate|medium|watch|advisory|caution|prepare|monitor)\b/)) {
      return 'Moderate';
    }
    
    // Minor severity indicators
    if (combinedText.match(/\b(minor|low|notice|update|information|routine)\b/)) {
      return 'Minor';
    }
    
    // Info severity indicators
    if (combinedText.match(/\b(info|information|informational|announcement|bulletin|statement)\b/)) {
      return 'Info';
    }
    
    // Default based on source type with Canadian government context
    if (sourceType.includes('security') || sourceType.includes('cyber')) {
      return 'Moderate'; // Security alerts are generally important
    }
    
    if (sourceType.includes('weather')) {
      // Weather-specific severity detection
      if (combinedText.includes('tornado') || combinedText.includes('hurricane') || combinedText.includes('severe thunderstorm')) {
        return 'Severe';
      }
      return 'Minor';
    }
    
    if (sourceType.includes('emergency') || sourceType.includes('government')) {
      return 'Moderate'; // Err on side of caution for government sources
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

  // Map source type to normalized source name for consistency with database sources
  const getSourceName = (rawSource: string, sourceType: string): UniversalAlert['source'] => {
    // Prioritize raw source if it exists and is meaningful
    if (rawSource && rawSource.trim() && rawSource !== 'undefined') {
      const source = rawSource.trim();
      
      // Map known sources to consistent names that match database entries
      const sourceMap: Record<string, UniversalAlert['source']> = {
        'CSE': 'Canadian Centre for Cyber Security',
        'CISA': 'US CISA Cybersecurity Advisories',
        'Immigration, Refugees and Citizenship Canada': 'Immigration Canada RSS',
        'Environment and Climate Change Canada': 'Environment Canada Weather',
        'Public Safety Canada': 'Public Safety Canada RSS'
      };
      
      return sourceMap[source] || 'Other';
    }
    
    // Fallback to source type mapping that matches database source names
    switch (sourceType?.toLowerCase()) {
      case 'rss':
      case 'security-rss':
        return 'Canadian Centre for Cyber Security';
      case 'weather':
      case 'weather-geocmet':
        return 'Environment Canada Weather';
      case 'immigration-travel-atom':
      case 'government-announcements':
        return 'Immigration Canada RSS';
      default:
        return 'Other';
    }
  };

  const extractSource = (sourceType: string, rawSource?: string): UniversalAlert['source'] => {
    return getSourceName(rawSource || '', sourceType);
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
    source: extractSource(sourceType, alert.source),
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
