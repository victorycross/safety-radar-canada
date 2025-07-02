
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
import { createClient } from 'jsr:@supabase/supabase-js@2';

// Function to get database-driven normalization rules
async function getDatabaseNormalizationRules(sourceType: string) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('normalization_rules')
      .select('*')
      .eq('source_type', sourceType)
      .eq('is_active', true)
      .order('priority', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error fetching normalization rules:', error);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error connecting to database for normalization rules:', error);
    return null;
  }
}

// Function to get classification rules from database
async function getDatabaseClassificationRules(sourceType: string, ruleType: string) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('classification_rules')
      .select('*')
      .eq('rule_type', ruleType)
      .eq('is_active', true)
      .contains('source_types', [sourceType])
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching classification rules:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error connecting to database for classification rules:', error);
    return [];
  }
}

export async function normalizeWithConfiguration(
  rawData: any,
  config: SourceConfiguration,
  sourceType: string
): Promise<UniversalAlert> {
  // Try to get database-driven rules first, fallback to config
  const dbRule = await getDatabaseNormalizationRules(sourceType);
  
  let fieldMappings, transformationRules, severityMapping, categoryMapping;
  
  if (dbRule) {
    fieldMappings = dbRule.field_mappings;
    transformationRules = dbRule.transformation_rules || {};
    severityMapping = dbRule.severity_mapping || {};
    categoryMapping = dbRule.category_mapping || {};
    console.log(`Using database rules for source type: ${sourceType}`);
  } else {
    // Fallback to provided config
    const { normalization, fieldMapping, transformations } = config;
    fieldMappings = {
      title: normalization?.titleField,
      description: normalization?.descriptionField,
      severity: normalization?.severityField,
      category: normalization?.categoryField,
      published: normalization?.publishedField,
      area: normalization?.areaField,
      urgency: normalization?.urgencyField,
      status: normalization?.statusField,
      url: normalization?.urlField,
      instructions: normalization?.instructionsField
    };
    transformationRules = transformations || {};
    severityMapping = transformations?.severityMapping || {};
    categoryMapping = transformations?.categoryMapping || {};
    console.log(`Using fallback config for source type: ${sourceType}`);
  }

  // Extract core fields using configuration
  const title = extractField(rawData, fieldMappings.title) || 'Untitled Alert';
  const description = extractField(rawData, fieldMappings.description) || 'No description available';
  const rawSeverity = extractField(rawData, fieldMappings.severity);
  const category = extractField(rawData, fieldMappings.category) || await determineCategory(sourceType, title.toString(), description.toString(), categoryMapping);
  const published = extractField(rawData, fieldMappings.published) || new Date().toISOString();
  const area = extractCanadianArea(rawData, fieldMappings.area);
  
  // Optional fields
  const urgency = extractField(rawData, fieldMappings.urgency);
  const status = extractField(rawData, fieldMappings.status);
  const url = extractField(rawData, fieldMappings.url);
  const instructions = extractField(rawData, fieldMappings.instructions);

  // Enhanced title cleaning for Canadian government feeds
  const cleanTitle = cleanCanadianGovTitle(title.toString(), transformationRules);
  
  // Enhanced description processing
  const cleanDescriptionText = cleanDescription(description.toString(), transformationRules);

  // Enhanced severity detection using database rules
  const enhancedSeverity = await enhanceSeverityWithDatabaseRules(rawSeverity, cleanDescriptionText, sourceType, severityMapping);
  
  // Enhanced category detection using database rules  
  const enhancedCategory = await enhanceCategoryWithDatabaseRules(category.toString(), cleanTitle, cleanDescriptionText, sourceType, categoryMapping);

  // Build the normalized alert with enhanced processing
  const normalizedAlert: UniversalAlert = {
    id: rawData.id || `config-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    title: cleanTitle,
    description: cleanDescriptionText,
    severity: enhancedSeverity,
    urgency: normalizeUrgency(urgency),
    category: enhancedCategory,
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

// Enhanced severity detection using database classification rules
async function enhanceSeverityWithDatabaseRules(
  rawSeverity: any, 
  content: string, 
  sourceType: string,
  fallbackMapping: any
): Promise<UniversalAlert['severity']> {
  const severityRules = await getDatabaseClassificationRules(sourceType, 'severity');
  
  if (severityRules.length > 0) {
    // Test content against database rules
    for (const rule of severityRules) {
      try {
        const regex = new RegExp(rule.condition_pattern, 'i');
        if (regex.test(content)) {
          console.log(`Matched severity rule: ${rule.classification_value} (confidence: ${rule.confidence_score})`);
          return rule.classification_value as UniversalAlert['severity'];
        }
      } catch (error) {
        console.warn(`Invalid regex pattern in severity rule ${rule.id}:`, error);
      }
    }
  }
  
  // Fallback to traditional severity mapping
  return normalizeSeverity(rawSeverity, fallbackMapping, content);
}

// Enhanced category detection using database classification rules
async function enhanceCategoryWithDatabaseRules(
  fallbackCategory: string,
  title: string,
  description: string,
  sourceType: string,
  fallbackMapping: any
): Promise<string> {
  const categoryRules = await getDatabaseClassificationRules(sourceType, 'category');
  const content = `${title} ${description}`.toLowerCase();
  
  if (categoryRules.length > 0) {
    // Test content against database rules
    for (const rule of categoryRules) {
      try {
        const regex = new RegExp(rule.condition_pattern, 'i');
        if (regex.test(content)) {
          console.log(`Matched category rule: ${rule.classification_value} (confidence: ${rule.confidence_score})`);
          return rule.classification_value;
        }
      } catch (error) {
        console.warn(`Invalid regex pattern in category rule ${rule.id}:`, error);
      }
    }
  }
  
  // Fallback to traditional category determination
  return determineCategory(sourceType, title, description, fallbackMapping);
}

// Helper functions for Canadian government feed optimization
async function determineCategory(sourceType: string, title: string, description: string, categoryMapping?: any): Promise<string> {
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

function cleanCanadianGovTitle(title: string, transformationRules?: any): string {
  const patterns = transformationRules?.title_patterns || [
    '^(Advisory|Alert|Warning|Notice|Bulletin|Update):\\s*',
    '\\s*-\\s*(Government of Canada|Canada\\.ca)$'
  ];
  let cleanTitle = title;
  
  // Apply configured patterns
  patterns.forEach((pattern: string) => {
    try {
      const regex = new RegExp(pattern, 'i');
      cleanTitle = cleanTitle.replace(regex, '');
    } catch (error) {
      console.warn('Invalid title cleaning pattern:', pattern, error);
    }
  });
  
  return cleanTitle
    .replace(/^\[.*?\]\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanDescription(description: string, transformationRules?: any): string {
  const maxLength = transformationRules?.description_limits?.max_length || 500;
  let cleaned = description
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[a-zA-Z0-9#]+;/g, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
    
  // Apply length limits if configured
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength - 3) + '...';
  }
  
  return cleaned;
}
