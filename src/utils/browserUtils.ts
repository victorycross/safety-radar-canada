
// Browser detection and Chrome-specific utilities
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor);
  const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(userAgent);
  
  return {
    isChrome,
    isSafari,
    isFirefox,
    userAgent,
    vendor: navigator.vendor
  };
};

export const addChromeSpecificLogging = (operation: string, data?: any) => {
  const { isChrome } = getBrowserInfo();
  if (isChrome) {
    console.log(`[CHROME-DEBUG] ${operation}:`, data || '');
    
    // Add performance timing for Chrome
    if (performance && performance.now) {
      console.log(`[CHROME-TIMING] ${operation} at:`, performance.now());
    }
  }
};

export const detectChromeIssues = () => {
  const { isChrome } = getBrowserInfo();
  if (!isChrome) return;
  
  // Check for CSP violations
  document.addEventListener('securitypolicyviolation', (e) => {
    console.error('[CHROME-CSP] Security policy violation:', {
      blockedURI: e.blockedURI,
      violatedDirective: e.violatedDirective,
      originalPolicy: e.originalPolicy
    });
  });
  
  // Check for network errors
  window.addEventListener('error', (e) => {
    if (e.error && e.error.name === 'NetworkError') {
      console.error('[CHROME-NETWORK] Network error detected:', e.error);
    }
  });
};
