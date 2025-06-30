
import { getBrowserInfo, addChromeSpecificLogging } from './browserUtils';

// Production-ready logging utility with Chrome-specific debugging
const isDevelopment = process.env.NODE_ENV === 'development';
const { isChrome } = getBrowserInfo();

export const logger = {
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data || '');
      if (isChrome) {
        addChromeSpecificLogging(`INFO: ${message}`, data);
      }
    }
  },
  
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '');
      if (isChrome) {
        addChromeSpecificLogging(`WARN: ${message}`, data);
      }
    }
  },
  
  error: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error || '');
      if (isChrome) {
        addChromeSpecificLogging(`ERROR: ${message}`, error);
      }
    }
    // In production, you might want to send errors to a monitoring service
  },
  
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, data || '');
      if (isChrome) {
        addChromeSpecificLogging(`DEBUG: ${message}`, data);
      }
    }
  },
  
  // Chrome-specific logging method
  chrome: (message: string, data?: any) => {
    if (isDevelopment && isChrome) {
      console.log(`[CHROME] ${message}`, data || '');
      addChromeSpecificLogging(message, data);
    }
  }
};
