
import { UniversalAlert } from '../alert-types.ts';
import { SourceConfiguration } from './types.ts';
import { extractField, extractCoordinates, extractCanadianArea } from './field-extractor.ts';
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
  const category = extractField(rawData, normalization.categoryField) || determineCategory(sourceType, title.toString(), description.toString());
  const published = extractField(rawData, normalization.publishedField) || new Date().toISOString();
  const area = extractCanadianArea(rawData, normalization.areaField);
  
  // Optional fields
  const urgency = extractField(rawData, normalization.urgencyField);
  const status = extractField(rawData, normalization.statusField);
  const url = extractField(rawData, normalization.urlField);
  const instructions = extractField(rawData, normalization.instructionsField);

  // Enhanced title cleaning for Canadian government feeds
  const cleanTitle = cleanCanadianGovTitle(title.toString());
  
  // Enhanced description processing
  const cleanDescriptionText = cleanDescription(description.toString());

  // Build the normalized alert with enhanced processing
  const normalizedAlert: UniversalAlert = {
    id: rawData.id || `config-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: cleanTitle,
    description: cleanDescriptionText,
    severity: normalizeSeverity(rawSeverity, transformations?.severityMapping, cleanDescriptionText),
    urgency: normalizeUrgency(urgency),
    category: category.toString(),
    status: normalizeStatus(status) || 'Actual',
    area: area,
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

// Helper functions for Canadian government feed optimization
function determineCategory(sourceType: string, title: string, description: string): string {
  const content = `${title} ${description}`.toLowerCase();
  
  // Security categories
  if (content.match(/\b(cyber|security|attack|breach|threat|malware|phishing|ransomware)\b/)) {
    return 'Cybersecurity';
  }
  
  // Emergency categories  
  if (content.match(/\b(emergency|disaster|evacuation|shelter|fire|flood|earthquake)\b/)) {
    return 'Emergency';
  }
  
  // Health categories
  if (content.match(/\b(health|disease|outbreak|pandemic|medical|vaccine|illness)\b/)) {
    return 'Health';
  }
  
  // Weather categories
  if (content.match(/\b(weather|storm|tornado|hurricane|blizzard|warning|watch)\b/)) {
    return 'Weather';
  }
  
  // Travel/Immigration categories
  if (content.match(/\b(travel|immigration|visa|passport|border|advisory)\b/)) {
    return 'Travel';
  }
  
  // Government operations
  if (content.match(/\b(government|service|announcement|policy|regulation)\b/)) {
    return 'Government';
  }
  
  return 'General';
}

function cleanCanadianGovTitle(title: string): string {
  return title
    .replace(/^(Advisory|Alert|Warning|Notice|Bulletin|Update):\s*/i, '')
    .replace(/\s*-\s*(Government of Canada|Canada\.ca)$/i, '')
    .replace(/^\[.*?\]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanDescription(description: string): string {
  return description
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}
