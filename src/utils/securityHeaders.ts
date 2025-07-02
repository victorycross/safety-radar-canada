
export const securityHeaders = {
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Vite in development
        "https://cdn.jsdelivr.net",
        "https://unpkg.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // Required for Tailwind and styled components
        "https://fonts.googleapis.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",
        "*.supabase.co"
      ],
      connectSrc: [
        "'self'",
        "https://*.supabase.co",
        "https://api.openai.com",
        "https://api.stripe.com",
        "wss://*.supabase.co"
      ],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: true
    }
  },

  // Additional security headers
  additionalHeaders: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
  }
};

export const generateCSPString = (): string => {
  const csp = securityHeaders.contentSecurityPolicy.directives;
  
  return Object.entries(csp)
    .map(([directive, sources]) => {
      if (typeof sources === 'boolean') {
        return sources ? directive.replace(/([A-Z])/g, '-$1').toLowerCase() : '';
      }
      const formattedDirective = directive.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${formattedDirective} ${Array.isArray(sources) ? sources.join(' ') : sources}`;
    })
    .filter(Boolean)
    .join('; ');
};

export const applySecurityHeaders = (element: HTMLElement) => {
  // Apply CSP via meta tag (for static hosting)
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = generateCSPString();
  
  if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    document.head.appendChild(cspMeta);
  }

  // Apply other security headers via meta tags where possible
  const headers = [
    { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
    { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
    { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
  ];

  headers.forEach(({ httpEquiv, content }) => {
    if (!document.querySelector(`meta[http-equiv="${httpEquiv}"]`)) {
      const meta = document.createElement('meta');
      meta.httpEquiv = httpEquiv;
      meta.content = content;
      document.head.appendChild(meta);
    }
  });
};
