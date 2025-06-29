
export async function parseRSSItems(rssText: string): Promise<any[]> {
  const items: any[] = [];
  
  // Extract RSS items
  const itemMatches = rssText.match(/<item[^>]*>[\s\S]*?<\/item>/gi);
  
  if (!itemMatches) {
    console.log('No RSS items found in response');
    return items;
  }
  
  for (const itemMatch of itemMatches) {
    const item: any = {};
    
    // Extract common RSS fields
    const titleMatch = itemMatch.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) ||
                      itemMatch.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descMatch = itemMatch.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) ||
                     itemMatch.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
    const linkMatch = itemMatch.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    const pubDateMatch = itemMatch.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
    const guidMatch = itemMatch.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
    
    if (titleMatch) item.title = titleMatch[1].trim();
    if (descMatch) item.description = descMatch[1].trim();
    if (linkMatch) item.link = linkMatch[1].trim();
    if (pubDateMatch) item.pubDate = pubDateMatch[1].trim();
    if (guidMatch) item.guid = guidMatch[1].trim();
    
    // Only add items that have at least a title
    if (item.title) {
      items.push(item);
    }
  }
  
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
