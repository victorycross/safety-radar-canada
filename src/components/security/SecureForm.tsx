
import React, { useState, useCallback } from 'react';
import { InputSanitizer } from './InputSanitizer';
import { useToast } from '@/hooks/use-toast';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';
import { SecurityValidator } from '@/utils/securityValidation';

interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (sanitizedData: Record<string, any>) => Promise<void>;
  rateLimitKey: string;
  maxSubmissions?: number;
  timeWindowMs?: number;
  enableCSRF?: boolean;
  enableHoneypot?: boolean;
}

interface SubmissionRecord {
  count: number;
  firstSubmission: number;
}

const submissionHistory = new Map<string, SubmissionRecord>();

export const SecureForm: React.FC<SecureFormProps> = ({
  children,
  onSubmit,
  rateLimitKey,
  maxSubmissions = 5,
  timeWindowMs = 60000, // 1 minute
  enableCSRF = true,
  enableHoneypot = true
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csrfToken] = useState(() => crypto.randomUUID());

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    const existing = submissionHistory.get(rateLimitKey);

    if (!existing) {
      submissionHistory.set(rateLimitKey, { count: 1, firstSubmission: now });
      return true;
    }

    // Reset if time window has passed
    if (now - existing.firstSubmission > timeWindowMs) {
      submissionHistory.set(rateLimitKey, { count: 1, firstSubmission: now });
      return true;
    }

    // Check if limit exceeded
    if (existing.count >= maxSubmissions) {
      return false;
    }

    // Increment count
    existing.count++;
    submissionHistory.set(rateLimitKey, existing);
    return true;
  }, [rateLimitKey, maxSubmissions, timeWindowMs]);

  const validateFormSecurity = (formData: FormData): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check honeypot field (should be empty)
    if (enableHoneypot && formData.get('website')) {
      errors.push('Suspicious form submission detected');
    }

    // CSRF token validation
    if (enableCSRF && formData.get('csrf_token') !== csrfToken) {
      errors.push('Invalid security token');
    }

    // Validate all text inputs for security threats
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && value.length > 0) {
        const validation = SecurityValidator.validateInput(value);
        if (!validation.isValid) {
          errors.push(`Invalid input in ${key}: ${validation.errors.join(', ')}`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (isSubmitting) return;

    // Rate limiting check
    if (!checkRateLimit()) {
      toast({
        title: 'Rate Limit Exceeded',
        description: `Too many submissions. Please wait before trying again.`,
        variant: 'destructive'
      });
      
      await logSecurityEvent({
        action: SecurityEvents.RATE_LIMIT_EXCEEDED,
        new_values: { form: rateLimitKey, maxSubmissions, timeWindowMs }
      });
      
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      
      // Security validation
      const securityCheck = validateFormSecurity(formData);
      if (!securityCheck.isValid) {
        await logSecurityEvent({
          action: SecurityEvents.SUSPICIOUS_ACTIVITY,
          new_values: { 
            type: 'form_security_violation',
            form: rateLimitKey,
            errors: securityCheck.errors
          }
        });
        
        toast({
          title: 'Security Error',
          description: 'Form submission blocked due to security concerns.',
          variant: 'destructive'
        });
        return;
      }

      const sanitizedData: Record<string, any> = {};

      // Sanitize all form inputs
      for (const [key, value] of formData.entries()) {
        // Skip security fields
        if (['csrf_token', 'website'].includes(key)) continue;
        
        if (typeof value === 'string') {
          // Determine sanitization type based on field name
          let sanitizationType: 'text' | 'html' | 'email' | 'url' = 'text';
          
          if (key.toLowerCase().includes('email')) {
            sanitizationType = 'email';
          } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('link')) {
            sanitizationType = 'url';
          } else if (key.toLowerCase().includes('description') || key.toLowerCase().includes('content')) {
            sanitizationType = 'html';
          }

          const sanitized = InputSanitizer.validateAndSanitizeInput(value, sanitizationType);
          if (sanitized) {
            sanitizedData[key] = sanitized;
          }
        } else {
          sanitizedData[key] = value;
        }
      }

      await onSubmit(sanitizedData);
      
      // Log successful form submission
      await logSecurityEvent({
        action: 'FORM_SUBMISSION_SUCCESS',
        new_values: { 
          form: rateLimitKey,
          fieldsCount: Object.keys(sanitizedData).length
        }
      });

    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Submission Error',
        description: 'An error occurred while processing your request.',
        variant: 'destructive'
      });
      
      await logSecurityEvent({
        action: 'FORM_SUBMISSION_ERROR',
        new_values: { 
          form: rateLimitKey,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {children}
      
      {/* Security fields */}
      {enableCSRF && (
        <input type="hidden" name="csrf_token" value={csrfToken} />
      )}
      
      {/* Honeypot field - should remain empty */}
      {enableHoneypot && (
        <input 
          type="text" 
          name="website" 
          style={{ display: 'none' }} 
          tabIndex={-1} 
          autoComplete="off"
        />
      )}
      
      {/* Timestamp for additional validation */}
      <input type="hidden" name="form_timestamp" value={Date.now()} />
    </form>
  );
};
