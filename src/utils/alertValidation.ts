
import { UniversalAlert } from '@/types/alerts';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Validate that an alert conforms to the universal standard
export const validateUniversalAlert = (alert: any): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!alert.id) errors.push('Missing required field: id');
  if (!alert.title) errors.push('Missing required field: title');
  if (!alert.description) errors.push('Missing required field: description');
  if (!alert.severity) errors.push('Missing required field: severity');
  if (!alert.urgency) errors.push('Missing required field: urgency');
  if (!alert.category) errors.push('Missing required field: category');
  if (!alert.status) errors.push('Missing required field: status');
  if (!alert.area) errors.push('Missing required field: area');
  if (!alert.published) errors.push('Missing required field: published');
  if (!alert.source) errors.push('Missing required field: source');

  // Enum validation
  const validSeverities = ['Extreme', 'Severe', 'Moderate', 'Minor', 'Info', 'Unknown'];
  if (alert.severity && !validSeverities.includes(alert.severity)) {
    errors.push(`Invalid severity: ${alert.severity}. Must be one of: ${validSeverities.join(', ')}`);
  }

  const validUrgencies = ['Immediate', 'Expected', 'Future', 'Past', 'Unknown'];
  if (alert.urgency && !validUrgencies.includes(alert.urgency)) {
    errors.push(`Invalid urgency: ${alert.urgency}. Must be one of: ${validUrgencies.join(', ')}`);
  }

  const validStatuses = ['Actual', 'Exercise', 'System', 'Test', 'Draft', 'Unknown'];
  if (alert.status && !validStatuses.includes(alert.status)) {
    errors.push(`Invalid status: ${alert.status}. Must be one of: ${validStatuses.join(', ')}`);
  }

  const validSources = ['Alert Ready', 'BC Emergency', 'Everbridge', 'Other'];
  if (alert.source && !validSources.includes(alert.source)) {
    errors.push(`Invalid source: ${alert.source}. Must be one of: ${validSources.join(', ')}`);
  }

  // Date validation
  if (alert.published && isNaN(Date.parse(alert.published))) {
    errors.push('Invalid published date format');
  }
  if (alert.updated && isNaN(Date.parse(alert.updated))) {
    errors.push('Invalid updated date format');
  }
  if (alert.expires && isNaN(Date.parse(alert.expires))) {
    errors.push('Invalid expires date format');
  }
  if (alert.effective && isNaN(Date.parse(alert.effective))) {
    errors.push('Invalid effective date format');
  }

  // Coordinate validation
  if (alert.coordinates) {
    if (typeof alert.coordinates.latitude !== 'number' || 
        alert.coordinates.latitude < -90 || 
        alert.coordinates.latitude > 90) {
      errors.push('Invalid latitude coordinate');
    }
    if (typeof alert.coordinates.longitude !== 'number' || 
        alert.coordinates.longitude < -180 || 
        alert.coordinates.longitude > 180) {
      errors.push('Invalid longitude coordinate');
    }
  }

  // Warnings for missing optional but useful fields
  if (!alert.instructions && (alert.severity === 'Extreme' || alert.severity === 'Severe')) {
    warnings.push('High severity alert missing instructions');
  }
  if (!alert.url) {
    warnings.push('Alert missing URL for additional details');
  }
  if (!alert.author) {
    warnings.push('Alert missing author information');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Validate a batch of alerts
export const validateAlertBatch = (alerts: any[]): { 
  totalAlerts: number;
  validAlerts: number;
  invalidAlerts: number;
  errors: string[];
  warnings: string[];
} => {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  let validCount = 0;

  alerts.forEach((alert, index) => {
    const validation = validateUniversalAlert(alert);
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
  });

  return {
    totalAlerts: alerts.length,
    validAlerts: validCount,
    invalidAlerts: alerts.length - validCount,
    errors: allErrors,
    warnings: allWarnings
  };
};
