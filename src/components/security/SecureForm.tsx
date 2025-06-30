
import React, { useState, useCallback } from 'react';
import { InputSanitizer } from './InputSanitizer';
import { useToast } from '@/hooks/use-toast';
import { logSecurityEvent, SecurityEvents } from '@/utils/securityAudit';

interface SecureFormProps {
  children: React.ReactNode;
  onSubmit: (sanitizedData: Record<string, any>) => Promise<void>;
  rateLimitKey: string;
  maxSubmissions?: number;
  timeWindowMs?: number;
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
  timeWindowMs = 60000 // 1 minute
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const sanitizedData: Record<string, any> = {};

      // Sanitize all form inputs
      for (const [key, value] of formData.entries()) {
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

          sanitizedData[key] = InputSanitizer.validateAndSanitizeInput(value, sanitizationType);
        } else {
          sanitizedData[key] = value;
        }
      }

      await onSubmit(sanitizedData);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Submission Error',
        description: 'An error occurred while processing your request.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {children}
      <input type="hidden" name="csrf_token" value={Date.now().toString()} />
    </form>
  );
};
