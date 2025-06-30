
import React, { useState, useCallback } from 'react';
import { SecurityValidator } from '@/utils/securityValidation';
import { SecurityService } from '@/services/securityService';
import { AlertTriangle, Shield } from 'lucide-react';

interface EnhancedInputSanitizerProps {
  children: React.ReactElement;
  validateOnChange?: boolean;
  showSecurityIndicator?: boolean;
  onSecurityIssue?: (issues: string[]) => void;
}

const EnhancedInputSanitizer: React.FC<EnhancedInputSanitizerProps> = ({
  children,
  validateOnChange = true,
  showSecurityIndicator = true,
  onSecurityIssue
}) => {
  const [securityStatus, setSecurityStatus] = useState<{
    isSecure: boolean;
    issues: string[];
  }>({ isSecure: true, issues: [] });

  const validateInput = useCallback((value: string) => {
    const validation = SecurityValidator.validateInput(value, 'text');
    
    const isSecure = validation.isValid;
    const issues = validation.errors;

    setSecurityStatus({ isSecure, issues });
    
    if (!isSecure && onSecurityIssue) {
      onSecurityIssue(issues);
    }

    return validation;
  }, [onSecurityIssue]);

  const handleInputChange = useCallback((originalHandler: any) => {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      
      if (validateOnChange) {
        const validation = validateInput(value);
        
        // If validation fails, sanitize the input
        if (!validation.isValid && validation.sanitizedValue) {
          event.target.value = validation.sanitizedValue;
        }
      }
      
      // Call original handler
      if (originalHandler) {
        originalHandler(event);
      }
    };
  }, [validateOnChange, validateInput]);

  const handleInputBlur = useCallback((originalHandler: any) => {
    return (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      
      // Always validate on blur
      const validation = validateInput(value);
      
      if (!validation.isValid && validation.sanitizedValue) {
        event.target.value = validation.sanitizedValue;
        
        // Trigger change event to update form state
        const changeEvent = new Event('change', { bubbles: true });
        event.target.dispatchEvent(changeEvent);
      }
      
      // Call original handler
      if (originalHandler) {
        originalHandler(event);
      }
    };
  }, [validateInput]);

  // Clone the child element and add our security handlers
  const enhancedChild = React.cloneElement(children, {
    onChange: handleInputChange(children.props.onChange),
    onBlur: handleInputBlur(children.props.onBlur),
    className: `${children.props.className || ''} ${
      !securityStatus.isSecure ? 'border-red-500' : ''
    }`.trim()
  });

  return (
    <div className="relative">
      {enhancedChild}
      
      {showSecurityIndicator && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {securityStatus.isSecure ? (
            <Shield className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          )}
        </div>
      )}
      
      {!securityStatus.isSecure && securityStatus.issues.length > 0 && (
        <div className="mt-1 text-sm text-red-600">
          {securityStatus.issues.map((issue, index) => (
            <div key={index} className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              {issue}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedInputSanitizer;
