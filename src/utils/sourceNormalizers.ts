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
    return alert.title || 
           alert.headline || 
           alert.name || 
           alert.subject ||
           alert.summary?.substring(0, 100) + '...' ||
           alert.description?.substring(0, 100) + '...' ||
           'Alert from ' + sourceType;
  };

  const extractDescription = (alert: any): string => {
    return alert.description || 
           alert.summary || 
           alert.content || 
           alert.details ||
           alert.text ||
           alert.title || 
           'Alert details not available';
  };

  const extractId = (alert: any): string => {
    return alert.id || 
           alert.guid || 
           alert.link ||
           `${sourceType}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  };

  const extractPublished = (alert: any): string => {
    const dateStr = alert.published || 
                   alert.pubDate || 
                   alert.pub_date ||
                   alert.date || 
                   alert.created || 
                   alert.timestamp ||
                   new Date().toISOString();
    
    try {
      return new Date(dateStr).toISOString();
    } catch {
      return new Date().toISOString();
    }
  };

  const extractSeverity = (alert: any): UniversalAlert['severity'] => {
    const severity = (alert.severity || alert.priority || alert.urgency || '').toLowerCase();
    
    if (['extreme', 'critical', 'emergency'].includes(severity)) return 'Extreme';
    if (['severe', 'high', 'major'].includes(severity)) return 'Severe';
    if (['moderate', 'medium', 'warning'].includes(severity)) return 'Moderate';
    if (['minor', 'low', 'advisory'].includes(severity)) return 'Minor';
    if (['info', 'information'].includes(severity)) return 'Info';
    
    // Determine severity from source type
    if (sourceType.includes('security') || sourceType.includes('cyber')) return 'Moderate';
    if (sourceType.includes('weather')) return 'Minor';
    
    return 'Unknown';
  };

  const extractUrgency = (alert: any): UniversalAlert['urgency'] => {
    const urgency = (alert.urgency || alert.immediacy || '').toLowerCase();
    
    if (['immediate', 'urgent', 'now'].includes(urgency)) return 'Immediate';
    if (['expected', 'soon'].includes(urgency)) return 'Expected';
    if (['future', 'later'].includes(urgency)) return 'Future';
    if (['past', 'expired'].includes(urgency)) return 'Past';
    
    return 'Unknown';
  };

  const extractCategory = (alert: any): string => {
    return alert.category || 
           alert.type || 
           alert.event ||
           (sourceType.includes('security') ? 'Security' : 
            sourceType.includes('weather') ? 'Weather' : 
            sourceType.includes('emergency') ? 'Emergency' : 'General');
  };

  const extractArea = (alert: any): string => {
    return alert.area || 
           alert.location || 
           alert.region ||
           alert.province ||
           alert.city ||
           'Location not specified';
  };

  const extractSource = (sourceType: string): UniversalAlert['source'] => {
    if (sourceType.includes('alert-ready') || sourceType.includes('national')) return 'Alert Ready';
    if (sourceType.includes('bc') || sourceType.includes('british')) return 'BC Emergency';
    if (sourceType.includes('everbridge')) return 'Everbridge';
    return 'Other';
  };

  return {
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
    coordinates: alert.coordinates || (alert.latitude && alert.longitude ? {
      latitude: parseFloat(alert.latitude),
      longitude: parseFloat(alert.longitude)
    } : undefined)
  };
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
