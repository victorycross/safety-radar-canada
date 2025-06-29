
import { UniversalAlert } from '@/types/alerts';
import { 
  normalizeSeverity, 
  normalizeUrgency, 
  normalizeStatus, 
  normalizeTitle, 
  normalizeDescription, 
  normalizeArea, 
  normalizeDate,
  extractCoordinates 
} from './alertNormalization';
import { validateUniversalAlert } from './alertValidation';

// Normalize Alert Ready alerts
export const normalizeAlertReadyAlert = (alert: any): UniversalAlert => {
  const normalized: UniversalAlert = {
    id: alert.id || `alert-ready-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: normalizeTitle(alert.title),
    description: normalizeDescription(alert.summary || alert.description),
    severity: normalizeSeverity(alert.severity),
    urgency: normalizeUrgency(alert.urgency),
    category: alert.category || 'General',
    status: normalizeStatus(alert.status),
    area: normalizeArea(alert.area),
    published: normalizeDate(alert.published),
    updated: alert.updated ? normalizeDate(alert.updated) : undefined,
    expires: alert.expiryTime ? normalizeDate(alert.expiryTime) : undefined,
    effective: alert.effectiveTime ? normalizeDate(alert.effectiveTime) : undefined,
    url: alert.url,
    instructions: alert.instructions,
    author: alert.author,
    source: 'Alert Ready',
    coordinates: extractCoordinates(alert)
  };

  // Validate the normalized alert
  const validation = validateUniversalAlert(normalized);
  if (!validation.isValid) {
    console.warn('Alert Ready normalization validation failed:', validation.errors);
  }

  return normalized;
};

// Normalize BC Emergency alerts
export const normalizeBCAlert = (alert: any): UniversalAlert => {
  // Extract data from properties if it's a GeoJSON feature
  const props = alert.properties || alert;
  
  const normalized: UniversalAlert = {
    id: alert.id || props.id || `bc-alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: normalizeTitle(props.title || props.headline || props.name),
    description: normalizeDescription(props.description || props.summary || props.details),
    severity: normalizeSeverity(props.severity || props.priority),
    urgency: normalizeUrgency(props.urgency || props.immediacy),
    category: props.category || props.type || 'Emergency',
    status: normalizeStatus(props.status),
    area: normalizeArea(props.area || props.location || props.region),
    published: normalizeDate(props.published || props.created || props.date),
    updated: props.updated ? normalizeDate(props.updated) : undefined,
    expires: props.expires || props.expiry ? normalizeDate(props.expires || props.expiry) : undefined,
    effective: props.effective || props.onset ? normalizeDate(props.effective || props.onset) : undefined,
    url: props.url || props.link,
    instructions: props.instructions || props.action,
    author: props.author || props.source || 'BC Emergency Management',
    source: 'BC Emergency',
    coordinates: extractCoordinates(alert)
  };

  // Validate the normalized alert
  const validation = validateUniversalAlert(normalized);
  if (!validation.isValid) {
    console.warn('BC Emergency normalization validation failed:', validation.errors);
  }

  return normalized;
};

// Normalize Everbridge alerts
export const normalizeEverbridgeAlert = (alert: any): UniversalAlert => {
  const normalized: UniversalAlert = {
    id: alert.id || `everbridge-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: normalizeTitle(alert.title || alert.subject),
    description: normalizeDescription(alert.description || alert.message || alert.content),
    severity: normalizeSeverity(alert.severity || alert.priority),
    urgency: normalizeUrgency(alert.urgency || alert.immediacy),
    category: alert.category || alert.type || 'Notification',
    status: normalizeStatus(alert.status),
    area: normalizeArea(alert.location || alert.area || alert.region),
    published: normalizeDate(alert.updated || alert.created || alert.timestamp),
    updated: alert.lastModified ? normalizeDate(alert.lastModified) : undefined,
    expires: alert.expires ? normalizeDate(alert.expires) : undefined,
    effective: alert.effective ? normalizeDate(alert.effective) : undefined,
    url: alert.url || alert.link,
    instructions: alert.instructions || alert.actionRequired,
    author: alert.author || alert.sender || 'Everbridge',
    source: 'Everbridge',
    coordinates: extractCoordinates(alert)
  };

  // Validate the normalized alert
  const validation = validateUniversalAlert(normalized);
  if (!validation.isValid) {
    console.warn('Everbridge normalization validation failed:', validation.errors);
  }

  return normalized;
};

// Normalize RSS/XML alerts (for security feeds, etc.)
export const normalizeRSSAlert = (alert: any): UniversalAlert => {
  const normalized: UniversalAlert = {
    id: alert.id || alert.guid || `rss-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: normalizeTitle(alert.title),
    description: normalizeDescription(alert.description || alert.summary),
    severity: normalizeSeverity(alert.severity || 'Info'), // Default RSS to Info level
    urgency: normalizeUrgency(alert.urgency || 'Expected'),
    category: alert.category || 'Information',
    status: normalizeStatus(alert.status || 'Actual'),
    area: normalizeArea(alert.area || alert.location || 'Global'),
    published: normalizeDate(alert.pubDate || alert.published || alert.date),
    updated: alert.updated ? normalizeDate(alert.updated) : undefined,
    expires: alert.expires ? normalizeDate(alert.expires) : undefined,
    effective: alert.effective ? normalizeDate(alert.effective) : undefined,
    url: alert.link || alert.url,
    instructions: alert.instructions,
    author: alert.author || alert.source || 'RSS Feed',
    source: 'Other',
    coordinates: extractCoordinates(alert)
  };

  // Validate the normalized alert
  const validation = validateUniversalAlert(normalized);
  if (!validation.isValid) {
    console.warn('RSS normalization validation failed:', validation.errors);
  }

  return normalized;
};

// Main normalization function that handles all sources
export const normalizeAlert = (alert: any, source: string): UniversalAlert => {
  console.log(`Normalizing alert from source: ${source}`, { alertId: alert.id, alertTitle: alert.title });
  
  try {
    switch (source.toLowerCase()) {
      case 'alert-ready':
      case 'national':
        return normalizeAlertReadyAlert(alert);
      case 'bc':
      case 'bc-emergency':
        return normalizeBCAlert(alert);
      case 'everbridge':
        return normalizeEverbridgeAlert(alert);
      case 'rss':
      case 'security-rss':
        return normalizeRSSAlert(alert);
      default:
        console.warn(`Unknown source type: ${source}, using generic normalization`);
        // Generic fallback normalization
        const normalized: UniversalAlert = {
          id: alert.id || `generic-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: normalizeTitle(alert.title || alert.name || alert.subject),
          description: normalizeDescription(alert.description || alert.summary || alert.message),
          severity: normalizeSeverity(alert.severity),
          urgency: normalizeUrgency(alert.urgency),
          category: alert.category || alert.type || 'General',
          status: normalizeStatus(alert.status),
          area: normalizeArea(alert.area || alert.location),
          published: normalizeDate(alert.published || alert.created || alert.timestamp),
          updated: alert.updated ? normalizeDate(alert.updated) : undefined,
          expires: alert.expires ? normalizeDate(alert.expires) : undefined,
          effective: alert.effective ? normalizeDate(alert.effective) : undefined,
          url: alert.url || alert.link,
          instructions: alert.instructions,
          author: alert.author || alert.source,
          source: 'Other',
          coordinates: extractCoordinates(alert)
        };

        const validation = validateUniversalAlert(normalized);
        if (!validation.isValid) {
          console.warn('Generic normalization validation failed:', validation.errors);
        }

        return normalized;
    }
  } catch (error) {
    console.error(`Error normalizing alert from source ${source}:`, error);
    // Return a minimal valid alert in case of error
    return {
      id: `error-${Date.now()}`,
      title: 'Alert Processing Error',
      description: 'Failed to process alert data',
      severity: 'Unknown',
      urgency: 'Unknown',
      category: 'Error',
      status: 'Unknown',
      area: 'Unknown',
      published: new Date().toISOString(),
      source: 'Other'
    };
  }
};

// Batch normalization with validation reporting
export const normalizeAlertBatch = (alerts: any[], source: string): {
  normalizedAlerts: UniversalAlert[];
  validationReport: {
    total: number;
    valid: number;
    invalid: number;
    errors: string[];
    warnings: string[];
  };
} => {
  const normalizedAlerts: UniversalAlert[] = [];
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  let validCount = 0;

  alerts.forEach((alert, index) => {
    try {
      const normalized = normalizeAlert(alert, source);
      const validation = validateUniversalAlert(normalized);
      
      if (validation.isValid) {
        validCount++;
      } else {
        validation.errors.forEach(error => 
          allErrors.push(`Alert ${index + 1}: ${error}`)
        );
      }
      
      validation.warnings.forEach(warning => 
        allWarnings.push(`Alert ${index + 1}: ${warning}`)
      );
      
      normalizedAlerts.push(normalized);
    } catch (error) {
      allErrors.push(`Alert ${index + 1}: Failed to normalize - ${error.message}`);
    }
  });

  return {
    normalizedAlerts,
    validationReport: {
      total: alerts.length,
      valid: validCount,
      invalid: alerts.length - validCount,
      errors: allErrors,
      warnings: allWarnings
    }
  };
};
