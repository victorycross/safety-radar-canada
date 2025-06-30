
import DOMPurify from 'dompurify';

// XSS Protection and Input Sanitization
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  // Basic XSS protection - remove script tags and dangerous attributes
  const sanitized = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
  
  return sanitized.trim();
};

// SQL Injection Protection
export const validateSQLInput = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\/\*|\*\/|;|'|"|`)/,
    /(\bOR\b.*=|AND.*=|\bUNION\b|\bSELECT\b.*\bFROM\b)/i
  ];
  
  return !sqlPatterns.some(pattern => pattern.test(input));
};

// Email validation with security considerations
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(email);
  
  if (sanitized !== email) {
    return { isValid: false, error: 'Email contains invalid characters' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  if (sanitized.length > 254) {
    return { isValid: false, error: 'Email too long' };
  }
  
  return { isValid: true };
};

// URL validation for API endpoints
export const validateURL = (url: string): { isValid: boolean; error?: string } => {
  const sanitized = sanitizeInput(url);
  
  if (sanitized !== url) {
    return { isValid: false, error: 'URL contains invalid characters' };
  }
  
  try {
    const urlObj = new URL(sanitized);
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }
    
    // Prevent localhost access in production
    if (process.env.NODE_ENV === 'production' && 
        (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1')) {
      return { isValid: false, error: 'Localhost URLs not allowed in production' };
    }
    
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

// General text input validation
export const validateTextInput = (
  input: string, 
  options: {
    minLength?: number;
    maxLength?: number;
    allowHTML?: boolean;
    required?: boolean;
  } = {}
): { isValid: boolean; error?: string; sanitized: string } => {
  const { minLength = 0, maxLength = 1000, allowHTML = false, required = false } = options;
  
  if (required && (!input || input.trim().length === 0)) {
    return { isValid: false, error: 'This field is required', sanitized: '' };
  }
  
  const sanitized = allowHTML ? input : sanitizeInput(input);
  
  if (sanitized.length < minLength) {
    return { 
      isValid: false, 
      error: `Minimum length is ${minLength} characters`, 
      sanitized 
    };
  }
  
  if (sanitized.length > maxLength) {
    return { 
      isValid: false, 
      error: `Maximum length is ${maxLength} characters`, 
      sanitized 
    };
  }
  
  if (!validateSQLInput(sanitized)) {
    return { 
      isValid: false, 
      error: 'Input contains potentially dangerous content', 
      sanitized 
    };
  }
  
  return { isValid: true, sanitized };
};

// Rate limiting helper for client-side
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests: number[] = [];
  
  return (): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Remove old requests outside the window
    while (requests.length > 0 && requests[0] < windowStart) {
      requests.shift();
    }
    
    // Check if we're within the limit
    if (requests.length >= maxRequests) {
      return false;
    }
    
    requests.push(now);
    return true;
  };
};
