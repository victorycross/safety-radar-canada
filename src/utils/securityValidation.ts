
import { InputSanitizer } from '@/components/security/InputSanitizer';
import { logSecurityEvent, SecurityEvents } from './securityAudit';

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue?: any;
  errors: string[];
}

export class SecurityValidator {
  private static suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /expression\s*\(/gi, // CSS expression
    /eval\s*\(/gi, // Eval function
    /setTimeout\s*\(/gi, // setTimeout
    /setInterval\s*\(/gi, // setInterval
    /Function\s*\(/gi, // Function constructor
    /<iframe\b[^>]*>/gi, // iframes
    /<object\b[^>]*>/gi, // objects
    /<embed\b[^>]*>/gi, // embeds
    /data:text\/html/gi, // Data URLs with HTML
    /vbscript:/gi, // VBScript protocol
  ];

  private static sqlInjectionPatterns = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b)/gi,
    /(--|\/\*|\*\/)/g, // SQL comments
    /(\bor\b|\band\b)\s*\d+\s*=\s*\d+/gi, // OR/AND conditions
    /[\';]/g, // Quote characters in suspicious contexts
  ];

  static validateInput(value: any, type: 'text' | 'html' | 'email' | 'url' = 'text'): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: []
    };

    if (!value) {
      result.sanitizedValue = '';
      return result;
    }

    const stringValue = String(value);

    // Check for suspicious patterns
    const suspiciousFound = this.suspiciousPatterns.some(pattern => pattern.test(stringValue));
    if (suspiciousFound) {
      result.errors.push('Potentially malicious content detected');
      result.isValid = false;
      
      // Log suspicious activity
      logSecurityEvent({
        action: SecurityEvents.SUSPICIOUS_ACTIVITY,
        new_values: { 
          type: 'malicious_input', 
          value: stringValue.substring(0, 100),
          patterns_matched: this.suspiciousPatterns.filter(p => p.test(stringValue)).length
        }
      });
    }

    // SQL injection detection for database-bound inputs
    if (type === 'text' && stringValue.length > 50) {
      const sqlInjectionFound = this.sqlInjectionPatterns.some(pattern => pattern.test(stringValue));
      if (sqlInjectionFound) {
        result.errors.push('Potential SQL injection detected');
        result.isValid = false;
        
        logSecurityEvent({
          action: SecurityEvents.SUSPICIOUS_ACTIVITY,
          new_values: { 
            type: 'sql_injection_attempt', 
            value: stringValue.substring(0, 100)
          }
        });
      }
    }

    // If validation passed, sanitize the input
    if (result.isValid) {
      result.sanitizedValue = InputSanitizer.validateAndSanitizeInput(stringValue, type);
    }

    return result;
  }

  static validateFileUpload(file: File): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: []
    };

    // File type validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/csv'];
    if (!allowedTypes.includes(file.type)) {
      result.errors.push(`File type ${file.type} not allowed`);
      result.isValid = false;
    }

    // File size validation (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      result.errors.push('File size exceeds 10MB limit');
      result.isValid = false;
    }

    // Filename validation
    const sanitizedName = InputSanitizer.sanitizeFilename(file.name);
    if (sanitizedName !== file.name) {
      result.errors.push('Invalid characters in filename');
      result.isValid = false;
    }

    // Check for suspicious file extensions
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.jar', '.js', '.vbs', '.php'];
    const hasExt = dangerousExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (hasExt) {
      result.errors.push('Dangerous file extension detected');
      result.isValid = false;
      
      logSecurityEvent({
        action: SecurityEvents.SUSPICIOUS_ACTIVITY,
        new_values: { 
          type: 'dangerous_file_upload', 
          filename: file.name,
          size: file.size,
          file_type: file.type
        }
      });
    }

    return result;
  }

  static validateAPIKey(apiKey: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: []
    };

    if (!apiKey || typeof apiKey !== 'string') {
      result.errors.push('API key is required');
      result.isValid = false;
      return result;
    }

    // Basic API key format validation
    if (apiKey.length < 20) {
      result.errors.push('API key appears too short');
      result.isValid = false;
    }

    // Check for obvious test/dummy keys
    const testPatterns = ['test', 'dummy', 'fake', 'example', '123456', 'abcdef'];
    const isTestKey = testPatterns.some(pattern => apiKey.toLowerCase().includes(pattern));
    if (isTestKey) {
      result.errors.push('Test API key detected');
      result.isValid = false;
    }

    result.sanitizedValue = apiKey.trim();
    return result;
  }
}
