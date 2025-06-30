
import DOMPurify from 'dompurify';

export interface DOMPurifyConfig {
  ALLOWED_TAGS?: string[];
  ALLOWED_ATTR?: string[];
  FORBID_TAGS?: string[];
  FORBID_ATTR?: string[];
}

export class InputSanitizer {
  private static defaultConfig: DOMPurifyConfig = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style']
  };

  static sanitizeHTML(input: string, config?: DOMPurifyConfig): string {
    if (!input || typeof input !== 'string') return '';
    
    const sanitizeConfig = { ...this.defaultConfig, ...config };
    return DOMPurify.sanitize(input, sanitizeConfig);
  }

  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    // Remove all HTML tags and decode HTML entities
    return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitizedEmail = this.sanitizeText(email);
    return emailRegex.test(sanitizedEmail) && sanitizedEmail === email;
  }

  static validateURL(url: string): boolean {
    try {
      const sanitizedUrl = this.sanitizeText(url);
      new URL(sanitizedUrl);
      return sanitizedUrl === url && (url.startsWith('http://') || url.startsWith('https://'));
    } catch {
      return false;
    }
  }

  static sanitizeFilename(filename: string): string {
    if (!filename || typeof filename !== 'string') return '';
    
    // Remove path traversal attempts and dangerous characters
    return filename
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\.\./g, '')
      .replace(/^\.+/, '')
      .trim()
      .substring(0, 255); // Limit filename length
  }

  static validateAndSanitizeInput(input: any, type: 'text' | 'html' | 'email' | 'url' | 'filename'): string {
    if (!input) return '';
    
    const stringInput = String(input);
    
    switch (type) {
      case 'html':
        return this.sanitizeHTML(stringInput);
      case 'email':
        const sanitizedEmail = this.sanitizeText(stringInput);
        return this.validateEmail(sanitizedEmail) ? sanitizedEmail : '';
      case 'url':
        const sanitizedUrl = this.sanitizeText(stringInput);
        return this.validateURL(sanitizedUrl) ? sanitizedUrl : '';
      case 'filename':
        return this.sanitizeFilename(stringInput);
      case 'text':
      default:
        return this.sanitizeText(stringInput);
    }
  }
}
