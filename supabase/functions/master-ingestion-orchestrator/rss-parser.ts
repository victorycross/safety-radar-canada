
export async function parseRSSItems(rssText: string): Promise<any[]> {
  const items: any[] = [];
  
  console.log(`Parsing RSS content of ${rssText.length} characters`);
  
  // Try to extract RSS items using multiple patterns
  const itemPatterns = [
    /<item[^>]*>[\s\S]*?<\/item>/gi,
    /<entry[^>]*>[\s\S]*?<\/entry>/gi, // Atom feeds
    /<article[^>]*>[\s\S]*?<\/article>/gi
  ];
  
  let itemMatches: RegExpMatchArray | null = null;
  
  for (const pattern of itemPatterns) {
    itemMatches = rssText.match(pattern);
    if (itemMatches && itemMatches.length > 0) {
      console.log(`Found ${itemMatches.length} items using pattern`);
      break;
    }
  }
  
  if (!itemMatches) {
    console.log('No RSS items found in response - checking for JSON structure');
    
    // Try parsing as JSON in case it's a JSON feed
    try {
      const jsonData = JSON.parse(rssText);
      if (jsonData.items && Array.isArray(jsonData.items)) {
        console.log(`Found ${jsonData.items.length} items in JSON feed`);
        return jsonData.items;
      }
      if (jsonData.entries && Array.isArray(jsonData.entries)) {
        console.log(`Found ${jsonData.entries.length} entries in JSON feed`);
        return jsonData.entries;
      }
    } catch (e) {
      console.log('Content is not valid JSON either');
    }
    
    return items;
  }
  
  for (const itemMatch of itemMatches) {
    const item: any = {};
    
    // Extract common RSS/Atom fields with multiple tag variations
    const fieldMappings = [
      { field: 'title', patterns: [
        /<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i,
        /<title[^>]*>([\s\S]*?)<\/title>/i
      ]},
      { field: 'description', patterns: [
        /<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i,
        /<description[^>]*>([\s\S]*?)<\/description>/i,
        /<content[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/content>/i,
        /<content[^>]*>([\s\S]*?)<\/content>/i,
        /<summary[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/summary>/i,
        /<summary[^>]*>([\s\S]*?)<\/summary>/i
      ]},
      { field: 'link', patterns: [
        /<link[^>]*href=["']([\s\S]*?)["'][^>]*>/i,
        /<link[^>]*>([\s\S]*?)<\/link>/i
      ]},
      { field: 'pubDate', patterns: [
        /<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i,
        /<published[^>]*>([\s\S]*?)<\/published>/i,
        /<updated[^>]*>([\s\S]*?)<\/updated>/i,
        /<date[^>]*>([\s\S]*?)<\/date>/i
      ]},
      { field: 'guid', patterns: [
        /<guid[^>]*>([\s\S]*?)<\/guid>/i,
        /<id[^>]*>([\s\S]*?)<\/id>/i
      ]},
      { field: 'category', patterns: [
        /<category[^>]*>([\s\S]*?)<\/category>/i,
        /<tag[^>]*>([\s\S]*?)<\/tag>/i
      ]}
    ];
    
    for (const mapping of fieldMappings) {
      for (const pattern of mapping.patterns) {
        const match = itemMatch.match(pattern);
        if (match) {
          item[mapping.field] = match[1].trim();
          break;
        }
      }
    }
    
    // Only add items that have at least a title or description
    if (item.title || item.description) {
      // Clean up HTML entities and tags
      if (item.title) {
        item.title = item.title.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
      }
      if (item.description) {
        item.description = item.description.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
      }
      
      items.push(item);
    }
  }
  
  console.log(`Successfully parsed ${items.length} valid RSS items`);
  return items;
}

export function classifyLocation(title: string, description: string): string {
  const content = `${title || ''} ${description || ''}`.toLowerCase();
  
  // Canada-specific terms
  const canadianTerms = [
    'canada', 'canadian', 'ontario', 'quebec', 'british columbia', 'alberta',
    'manitoba', 'saskatchewan', 'nova scotia', 'new brunswick', 'newfoundland',
    'prince edward island', 'northwest territories', 'nunavut', 'yukon',
    'toronto', 'montreal', 'vancouver', 'calgary', 'ottawa', 'edmonton',
    'cse', 'cccs', 'cyber.gc.ca', 'government of canada', 'gc.ca'
  ];
  
  const hasCanadianTerms = canadianTerms.some(term => content.includes(term));
  
  return hasCanadianTerms ? 'Canada' : 'Global';
}

export function extractRSSMetadata(rssText: string): any {
  const metadata: any = {};
  
  // Extract channel/feed level information
  const channelMatch = rssText.match(/<channel[^>]*>[\s\S]*?<\/channel>/i);
  if (channelMatch) {
    const channelContent = channelMatch[0];
    
    const titleMatch = channelContent.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) metadata.feedTitle = titleMatch[1].trim();
    
    const descMatch = channelContent.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
    if (descMatch) metadata.feedDescription = descMatch[1].trim();
    
    const linkMatch = channelContent.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    if (linkMatch) metadata.feedLink = linkMatch[1].trim();
  }
  
  return metadata;
}
