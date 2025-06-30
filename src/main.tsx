
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { logger } from './utils/logger';
import { getBrowserInfo, detectChromeIssues } from './utils/browserUtils';

const { isChrome } = getBrowserInfo();

logger.debug('Main.tsx: Starting application initialization', { isChrome });

// Chrome-specific initialization
if (isChrome) {
  logger.chrome('Chrome detected - applying compatibility measures');
  
  // Set up Chrome-specific error handling
  window.addEventListener('error', (event) => {
    logger.chrome('Global error caught', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    logger.chrome('Unhandled promise rejection', {
      reason: event.reason,
      promise: event.promise
    });
  });
  
  // Detect Chrome-specific issues early
  detectChromeIssues();
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  logger.error('Main.tsx: Root element not found!');
  throw new Error('Root element not found');
} else {
  logger.debug('Main.tsx: Root element found, creating React root');
  
  const root = createRoot(rootElement);
  
  // Chrome-specific rendering with small delay to ensure DOM readiness
  if (isChrome) {
    setTimeout(() => {
      logger.chrome('Chrome delayed render starting');
      root.render(<App />);
      logger.chrome('Chrome app component rendered');
    }, 50);
  } else {
    root.render(<App />);
    logger.debug('Main.tsx: App component rendered');
  }
}
