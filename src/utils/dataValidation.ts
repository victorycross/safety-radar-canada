
import { 
  ProvinceDataTemplate, 
  InternationalHubDataTemplate, 
  IncidentDataTemplate,
  SecurityAlertDataTemplate,
  WeatherAlertDataTemplate,
  ImmigrationTravelDataTemplate,
  ValidationResult 
} from '@/types/dataTemplates';

export class DataValidator {
  // Province validation
  static validateProvince(data: Partial<ProvinceDataTemplate>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Province name is required');
    }

    if (!data.code?.trim()) {
      errors.push('Province code is required');
    } else if (!/^[A-Z]{2}$/.test(data.code)) {
      errors.push('Province code must be 2 uppercase letters (e.g., ON, QC)');
    }

    if (data.employee_count === undefined || data.employee_count === null) {
      errors.push('Employee count is required');
    } else if (data.employee_count < 0 || data.employee_count > 50000) {
      errors.push('Employee count must be between 0 and 50,000');
    }

    if (data.alert_level && !['normal', 'warning', 'severe'].includes(data.alert_level)) {
      errors.push('Alert level must be normal, warning, or severe');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // International Hub validation
  static validateHub(data: Partial<InternationalHubDataTemplate>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Hub name is required');
    }

    if (!data.country?.trim()) {
      errors.push('Country is required');
    }

    if (!data.code?.trim()) {
      errors.push('Hub code is required');
    }

    if (data.employee_count === undefined || data.employee_count === null) {
      errors.push('Employee count is required');
    } else if (data.employee_count < 0 || data.employee_count > 1000) {
      errors.push('Hub employee count must be between 0 and 1,000');
    }

    if (data.alert_level && !['normal', 'warning', 'severe'].includes(data.alert_level)) {
      errors.push('Alert level must be normal, warning, or severe');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Incident validation
  static validateIncident(data: Partial<IncidentDataTemplate>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.title?.trim()) {
      errors.push('Incident title is required');
    }

    if (!data.description?.trim()) {
      errors.push('Incident description is required');
    }

    if (!data.source?.trim()) {
      errors.push('Source is required');
    } else if (['test', 'unknown', 'Unknown Source', ''].includes(data.source)) {
      errors.push('Source cannot be test, unknown, or empty');
    }

    if (data.alert_level && !['normal', 'warning', 'severe'].includes(data.alert_level)) {
      errors.push('Alert level must be normal, warning, or severe');
    }

    if (data.confidence_score !== undefined && (data.confidence_score < 0 || data.confidence_score > 1)) {
      errors.push('Confidence score must be between 0.0 and 1.0');
    }

    if (data.severity_numeric !== undefined && (data.severity_numeric < 1 || data.severity_numeric > 5)) {
      errors.push('Severity numeric must be between 1 and 5');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Security Alert validation
  static validateSecurityAlert(data: Partial<SecurityAlertDataTemplate>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.id?.trim()) {
      errors.push('Alert ID is required');
    }

    if (!data.title?.trim()) {
      errors.push('Alert title is required');
    }

    if (!data.source?.trim()) {
      errors.push('Source is required');
    } else if (data.source === 'test') {
      errors.push('Source cannot be "test"');
    }

    if (data.category && !['cybersecurity', 'physical_security', 'intelligence', 'other'].includes(data.category)) {
      errors.push('Category must be cybersecurity, physical_security, intelligence, or other');
    }

    if (data.link && !this.isValidUrl(data.link)) {
      warnings.push('Link appears to be invalid URL');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Weather Alert validation
  static validateWeatherAlert(data: Partial<WeatherAlertDataTemplate>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.id?.trim()) {
      errors.push('Weather alert ID is required');
    }

    if (data.severity && !['minor', 'moderate', 'severe', 'extreme'].includes(data.severity)) {
      errors.push('Severity must be minor, moderate, severe, or extreme');
    }

    if (data.onset && !this.isValidISODate(data.onset)) {
      errors.push('Onset date must be valid ISO date string');
    }

    if (data.expires && !this.isValidISODate(data.expires)) {
      errors.push('Expires date must be valid ISO date string');
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  // Helper methods
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private static isValidISODate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  // Bulk validation
  static validateBulkData<T>(
    data: T[], 
    validator: (item: T) => ValidationResult
  ): { validItems: T[]; invalidItems: { item: T; errors: string[] }[] } {
    const validItems: T[] = [];
    const invalidItems: { item: T; errors: string[] }[] = [];

    data.forEach(item => {
      const result = validator(item);
      if (result.isValid) {
        validItems.push(item);
      } else {
        invalidItems.push({ item, errors: result.errors });
      }
    });

    return { validItems, invalidItems };
  }
}
