
export function getAcceptHeader(sourceType: string): string {
  switch (sourceType) {
    case 'weather':
    case 'weather-geocmet':
      return 'application/json, application/geo+json, application/xml, text/xml';
    case 'security':
    case 'security-rss':
    case 'policy':
      return 'application/rss+xml, application/xml, text/xml';
    default:
      return 'application/json, application/xml';
  }
}

export async function parseXmlData(xmlText: string, sourceType: string): Promise<any> {
  // Simple XML parsing - in production, you'd use a proper XML parser
  const items: any[] = [];
  
  // Extract RSS items or CAP alerts
  const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || 
                     xmlText.match(/<alert[^>]*>[\s\S]*?<\/alert>/gi) ||
                     xmlText.match(/<entry[^>]*>[\s\S]*?<\/entry>/gi);

  for (const itemMatch of itemMatches || []) {
    const item: any = {};
    
    // Extract common fields
    const titleMatch = itemMatch.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descMatch = itemMatch.match(/<description[^>]*>([\s\S]*?)<\/description>/i);
    const linkMatch = itemMatch.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
    const pubDateMatch = itemMatch.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
                        itemMatch.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i);
    
    if (titleMatch) item.title = titleMatch[1].trim();
    if (descMatch) item.description = descMatch[1].trim();
    if (linkMatch) item.link = linkMatch[1].trim();
    if (pubDateMatch) item.pubDate = pubDateMatch[1].trim();
    
    // Extract severity for CAP alerts
    const severityMatch = itemMatch.match(/<severity[^>]*>([\s\S]*?)<\/severity>/i);
    if (severityMatch) item.severity = severityMatch[1].trim();
    
    // Extract location data
    const areaMatch = itemMatch.match(/<area[^>]*>([\s\S]*?)<\/area>/i);
    if (areaMatch) item.area = areaMatch[1].trim();
    
    items.push(item);
  }
  
  return { items };
}
