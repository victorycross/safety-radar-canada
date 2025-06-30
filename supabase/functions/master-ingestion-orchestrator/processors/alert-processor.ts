
import { AlertSource } from '../types.ts';
import { normalizeAlerts } from '../alert-normalizer.ts';
import { normalizeAlertBatchWithConfig } from '../config-driven-normalizer.ts';

export function extractAlertsFromData(data: any): any[] {
  let alertsArray: any[] = [];
  
  if (Array.isArray(data)) {
    alertsArray = data;
  } else if (data.alerts && Array.isArray(data.alerts)) {
    alertsArray = data.alerts;
  } else if (data.features && Array.isArray(data.features)) {
    alertsArray = data.features; // GeoJSON
  } else if (data.items && Array.isArray(data.items)) {
    alertsArray = data.items;
  } else if (data.channel && data.channel.item && Array.isArray(data.channel.item)) {
    alertsArray = data.channel.item; // RSS
  } else {
    alertsArray = [data]; // Single alert
  }
  
  return alertsArray;
}

export async function processAlerts(data: any, source: AlertSource): Promise<any[]> {
  let processedAlerts: any[];
  
  // Check if source has custom normalization configuration
  if (source.configuration?.normalization && source.configuration.normalization.titleField) {
    console.log(`Using configuration-driven normalization for ${source.name}`);
    
    const alertsArray = extractAlertsFromData(data);
    
    processedAlerts = normalizeAlertBatchWithConfig(
      alertsArray,
      source.configuration,
      source.source_type
    );
  } else {
    // Fall back to legacy normalization
    processedAlerts = await normalizeAlerts(data, source);
  }
  
  console.log(`Normalized ${processedAlerts.length} alerts from ${source.name}`);
  return processedAlerts;
}
