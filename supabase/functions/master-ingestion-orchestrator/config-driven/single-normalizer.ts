
import { UniversalAlert } from '../alert-types.ts';
import { SourceConfiguration } from './types.ts';
import { extractField, extractCoordinates } from './field-extractor.ts';
import { 
  normalizeSeverity, 
  normalizeUrgency, 
  normalizeStatus, 
  normalizeDate, 
  getSourceName 
} from './data-transformers.ts';

export function normalizeWithConfiguration(
  rawData: any,
  config: SourceConfiguration,
  sourceType: string
): UniversalAlert {
  const { normalization, fieldMapping, transformations } = config;

  // Extract core fields using configuration
  const title = extractField(rawData, normalization.titleField) || 'Untitled Alert';
  const description = extractField(rawData, normalization.descriptionField) || 'No description available';
  const rawSeverity = extractField(rawData, normalization.severityField);
  const category = extractField(rawData, normalization.categoryField) || 'General';
  const published = extractField(rawData, normalization.publishedField) || new Date().toISOString();
  const area = extractField(rawData, normalization.areaField) || 'Area not specified';
  
  // Optional fields
  const urgency = extractField(rawData, normalization.urgencyField);
  const status = extractField(rawData, normalization.statusField);
  const url = extractField(rawData, normalization.urlField);
  const instructions = extractField(rawData, normalization.instructionsField);

  // Build the normalized alert
  const normalizedAlert: UniversalAlert = {
    id: rawData.id || `config-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: title.toString(),
    description: description.toString(),
    severity: normalizeSeverity(rawSeverity, transformations?.severityMapping),
    urgency: normalizeUrgency(urgency),
    category: category.toString(),
    status: normalizeStatus(status),
    area: area.toString(),
    published: normalizeDate(published),
    source: getSourceName(sourceType),
    url: url?.toString(),
    instructions: instructions?.toString(),
    coordinates: extractCoordinates(rawData)
  };

  console.log(`Config-driven normalization completed for ${sourceType}:`, {
    originalTitle: extractField(rawData, normalization.titleField),
    normalizedTitle: normalizedAlert.title,
    originalSeverity: rawSeverity,
    normalizedSeverity: normalizedAlert.severity
  });

  return normalizedAlert;
}
