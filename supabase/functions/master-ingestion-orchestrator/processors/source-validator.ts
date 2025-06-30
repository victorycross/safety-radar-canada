
import { AlertSource } from '../types.ts';

export function shouldSkipSource(source: AlertSource): { skip: boolean; reason?: string } {
  // Skip sources that require API keys but don't have them configured
  if (source.source_type === 'weather' && source.name.includes('OpenWeatherMap')) {
    console.log('Skipping OpenWeatherMap - requires API key configuration');
    return { skip: true, reason: 'API key required but not configured' };
  }
  
  return { skip: false };
}

export function buildRequestConfig(source: AlertSource): RequestInit {
  const requestConfig: RequestInit = {
    method: 'GET',
    headers: {
      'User-Agent': 'Security-Intelligence-Platform/1.0'
    }
  };

  // Add custom headers from configuration
  if (source.configuration?.headers) {
    requestConfig.headers = {
      ...requestConfig.headers,
      ...source.configuration.headers
    };
  }

  // Add API key if configured
  if (source.configuration?.api_key) {
    requestConfig.headers = {
      ...requestConfig.headers,
      'Authorization': `Bearer ${source.configuration.api_key}`
    };
  }

  return requestConfig;
}
