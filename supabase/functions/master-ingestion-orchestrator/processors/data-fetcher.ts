
import { AlertSource } from '../types.ts';
import { getAcceptHeader, parseXmlData } from '../alert-normalizer.ts';
import { buildRequestConfig } from './source-validator.ts';

export async function fetchSourceData(source: AlertSource): Promise<{ data: any; httpStatus: number }> {
  const requestConfig = buildRequestConfig(source);
  
  // Add Accept header
  requestConfig.headers = {
    ...requestConfig.headers,
    'Accept': getAcceptHeader(source.source_type)
  };

  console.log(`Fetching data from: ${source.api_endpoint}`);
  const response = await fetch(source.api_endpoint, requestConfig);
  const httpStatus = response.status;
  
  if (!response.ok) {
    const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
    console.error(`API request failed for ${source.name}: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  const contentType = response.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else if (contentType.includes('xml') || contentType.includes('rss')) {
    const text = await response.text();
    console.log(`Fetched ${text.length} characters of XML/RSS content`);
    data = await parseXmlData(text, source.source_type);
  } else {
    data = await response.text();
  }

  return { data, httpStatus };
}
