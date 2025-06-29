
// Enhanced RSS content processing utilities
export interface ProcessedAlertContent {
  cleanTitle: string;
  structuredSummary: string;
  geographicArea: string;
  effectiveTime?: string;
  expiryTime?: string;
  instructions?: string;
  additionalInfo: Record<string, any>;
}

export function cleanAlertTitle(title: string): string {
  if (!title) return 'Untitled Alert';
  
  // Remove common prefixes/suffixes
  let cleaned = title
    .replace(/^(Alert|Warning|Advisory|Notice):\s*/i, '')
    .replace(/\s*-\s*(Alert Ready|Emergency Alert)$/i, '')
    .replace(/^\[.*?\]\s*/, '') // Remove bracketed prefixes
    .trim();
  
  // Capitalize properly
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function extractGeographicInfo(content: string, areaDesc?: string): string {
  if (areaDesc && areaDesc !== 'Unknown') {
    return areaDesc;
  }
  
  // Try to extract geographic information from content
  const geoPatterns = [
    /(?:area|region|zone)s?\s*:?\s*([^.\n]+)/i,
    /affecting\s+([^.\n]+)/i,
    /in\s+(?:the\s+)?([A-Z][^.\n,]+(?:,\s*[A-Z][A-Za-z\s]+)*)/,
  ];
  
  for (const pattern of geoPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim().replace(/\s+/g, ' ');
    }
  }
  
  return 'Area not specified';
}

export function extractInstructions(content: string): string | undefined {
  const instructionPatterns = [
    /(?:recommended\s+action|what\s+to\s+do|instructions?):\s*([^.\n]+(?:\.[^.\n]*)*)/i,
    /(?:please|residents\s+should|people\s+should)\s+([^.\n]+)/i,
    /action\s+required:\s*([^.\n]+)/i,
  ];
  
  for (const pattern of instructionPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return undefined;
}

export function processAlertSummary(summary: string): string {
  if (!summary) return 'No summary available';
  
  // Remove HTML tags if present
  let cleaned = summary.replace(/<[^>]*>/g, '');
  
  // Remove redundant phrases
  cleaned = cleaned
    .replace(/emergency\s+alert\s+issued\s+by/i, 'Issued by')
    .replace(/this\s+is\s+an?\s+/i, '')
    .replace(/^\s*alert:\s*/i, '')
    .trim();
  
  // Ensure proper sentence structure
  if (cleaned && !cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
    cleaned += '.';
  }
  
  return cleaned;
}

export function extractTimeInformation(content: string): { effective?: string; expires?: string } {
  const timeInfo: { effective?: string; expires?: string } = {};
  
  // Look for effective time
  const effectivePatterns = [
    /effective\s+(?:from\s+)?([^.\n]+)/i,
    /in\s+effect\s+(?:from\s+)?([^.\n]+)/i,
  ];
  
  for (const pattern of effectivePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      timeInfo.effective = match[1].trim();
      break;
    }
  }
  
  // Look for expiry time
  const expiryPatterns = [
    /(?:expires?|until|ends?)\s+([^.\n]+)/i,
    /valid\s+until\s+([^.\n]+)/i,
  ];
  
  for (const pattern of expiryPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      timeInfo.expires = match[1].trim();
      break;
    }
  }
  
  return timeInfo;
}

export function processRSSContent(entry: any, content?: string): ProcessedAlertContent {
  const rawTitle = entry.title?.[0]?._ || entry.title?.[0] || '';
  const rawSummary = entry.summary?.[0]?._ || entry.summary?.[0] || '';
  const fullContent = content || rawSummary;
  
  const cleanTitle = cleanAlertTitle(rawTitle);
  const structuredSummary = processAlertSummary(rawSummary);
  const geographicArea = extractGeographicInfo(fullContent);
  const instructions = extractInstructions(fullContent);
  const timeInfo = extractTimeInformation(fullContent);
  
  return {
    cleanTitle,
    structuredSummary,
    geographicArea,
    effectiveTime: timeInfo.effective,
    expiryTime: timeInfo.expires,
    instructions,
    additionalInfo: {
      author: entry.author?.[0]?.name?.[0] || entry.author?.[0],
      category: entry.category?.[0]?.$?.term || entry.category?.[0],
      link: entry.link?.[0]?.$?.href || entry.link?.[0],
    }
  };
}
