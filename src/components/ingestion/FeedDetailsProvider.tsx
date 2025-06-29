
interface FeedDetails {
  description: string;
  apiKeyLabel: string;
  apiKeyPlaceholder: string;
  endpointDefault: string;
  helpText: string;
  pollIntervalDefault: string;
  pollIntervalNote: string;
}

export const getFeedDetails = (feedId: string): FeedDetails => {
  switch (feedId) {
    case 'cse-cybersecurity':
      return {
        description: 'Canadian Cyber Security Centre (CSE) RSS feed for cybersecurity alerts',
        apiKeyLabel: 'API Key (Optional)',
        apiKeyPlaceholder: 'Usually not required for public RSS feeds',
        endpointDefault: 'https://cyber.gc.ca/webservice/en/rss/alerts',
        helpText: 'CSE RSS feed provides cybersecurity alerts with automatic geolocation classification. No authentication typically required for public feeds.',
        pollIntervalDefault: '600',
        pollIntervalNote: 'Recommended: 10 minutes (600 seconds) for cybersecurity alerts'
      };
    case 'weather-ca-geocmet':
      return {
        description: 'Environment Canada GeoMet-OGC API for weather alerts in GeoJSON format',
        apiKeyLabel: 'API Key (Optional)',
        apiKeyPlaceholder: 'Usually not required for public weather alerts',
        endpointDefault: 'https://api.weather.gc.ca/collections/alerts-fc/items',
        helpText: 'GeoMet-OGC API provides weather alerts with geographic data in GeoJSON format. No authentication typically required for public alerts.',
        pollIntervalDefault: '300',
        pollIntervalNote: 'Recommended: 5 minutes (300 seconds) for weather alerts'
      };
    case 'weather-ca':
      return {
        description: 'Environment Canada Weather API requires authentication for full access',
        apiKeyLabel: 'Environment Canada API Key',
        apiKeyPlaceholder: 'Enter your Environment Canada API key',
        endpointDefault: 'https://weather.gc.ca/rss/warning/on_e.xml',
        helpText: 'You can obtain an API key from Environment and Climate Change Canada\'s web services portal',
        pollIntervalDefault: '300',
        pollIntervalNote: 'Standard polling interval for weather data'
      };
    case 'social-media':
      return {
        description: 'Social Media Monitoring requires API keys for various platforms',
        apiKeyLabel: 'Social Media API Keys (JSON)',
        apiKeyPlaceholder: '{"twitter": "key", "facebook": "key"}',
        endpointDefault: 'Multiple platforms',
        helpText: 'Configure API keys for Twitter, Facebook, and other social media platforms in JSON format',
        pollIntervalDefault: '600',
        pollIntervalNote: 'Social media can be polled less frequently'
      };
    case 'everbridge':
      return {
        description: 'Everbridge requires API credentials for access',
        apiKeyLabel: 'Everbridge API Credentials',
        apiKeyPlaceholder: 'username:password:orgId',
        endpointDefault: 'https://api.everbridge.net/rest/broadcasts',
        helpText: 'Format: username:password:organizationId',
        pollIntervalDefault: '300',
        pollIntervalNote: 'Emergency alerts should be checked frequently'
      };
    case 'cisa-alerts':
      return {
        description: 'CISA Security Alerts - Usually works without API key',
        apiKeyLabel: 'API Key (Optional)',
        apiKeyPlaceholder: 'Not typically required',
        endpointDefault: 'https://www.cisa.gov/cybersecurity-advisories/all.xml',
        helpText: 'CISA RSS feeds are typically public and don\'t require authentication',
        pollIntervalDefault: '1800',
        pollIntervalNote: 'Security advisories can be checked every 30 minutes'
      };
    case 'alert-ready':
      return {
        description: 'Alert Ready Canada - Public emergency alerts',
        apiKeyLabel: 'API Key (Optional)',
        apiKeyPlaceholder: 'Not typically required',
        endpointDefault: 'https://alerts.pelmorex.com/rss',
        helpText: 'Alert Ready feeds are public emergency alerts and typically don\'t require authentication',
        pollIntervalDefault: '300',
        pollIntervalNote: 'Emergency alerts should be checked frequently'
      };
    case 'bc-arcgis':
      return {
        description: 'BC ArcGIS Emergency Data - Public GIS services',
        apiKeyLabel: 'API Key (Optional)',
        apiKeyPlaceholder: 'Not typically required',
        endpointDefault: 'BC ArcGIS Emergency Services API',
        helpText: 'BC government emergency data is typically publicly accessible',
        pollIntervalDefault: '600',
        pollIntervalNote: 'GIS data can be updated less frequently'
      };
    default:
      return {
        description: 'Configure this data source',
        apiKeyLabel: 'API Key',
        apiKeyPlaceholder: 'Enter API key if required',
        endpointDefault: '',
        helpText: 'Configure the data source settings',
        pollIntervalDefault: '300',
        pollIntervalNote: 'Standard polling interval'
      };
  }
};
