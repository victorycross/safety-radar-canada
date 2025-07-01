
export async function processImmigrationTravelSource(source: any, supabaseClient: any) {
  const startTime = Date.now();
  
  try {
    console.log(`🏛️ [Immigration Travel Processor] Processing source: ${source.name}`);
    console.log(`🏛️ [Immigration Travel Processor] API endpoint: ${source.api_endpoint}`);
    
    const response = await fetch(source.api_endpoint, {
      headers: {
        'User-Agent': 'Security-Intelligence-Platform/1.0',
        'Accept': 'application/atom+xml, application/xml, text/xml, application/rss+xml'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();
    console.log(`🏛️ [Immigration Travel Processor] Fetched ${xmlText.length} characters from ${source.name}`);
    console.log(`🏛️ [Immigration Travel Processor] Feed content sample (first 500 chars):`, xmlText.substring(0, 500));
    
    // Enhanced parsing to handle both RSS and Atom feeds
    const items: any[] = [];
    
    // Check if it's an Atom feed
    const isAtomFeed = xmlText.includes('<feed') && xmlText.includes('xmlns="http://www.w3.org/2005/Atom"');
    console.log(`🏛️ [Immigration Travel Processor] Feed type detected: ${isAtomFeed ? 'Atom' : 'RSS'}`);
    
    // Parse based on feed type
    let itemMatches: RegExpMatchArray | null = null;
    
    if (isAtomFeed) {
      // Atom feeds use <entry> tags
      itemMatches = xmlText.match(/<entry[^>]*>[\s\S]*?<\/entry>/gi) || [];
      console.log(`🏛️ [Immigration Travel Processor] Found ${itemMatches.length} Atom entries`);
    } else {
      // RSS feeds use <item> tags
      itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
      console.log(`🏛️ [Immigration Travel Processor] Found ${itemMatches.length} RSS items`);
    }

    for (let i = 0; i < itemMatches.length; i++) {
      const itemMatch = itemMatches[i];
      const item: any = { raw_xml: itemMatch };
      
      console.log(`🏛️ [Immigration Travel Processor] Processing ${isAtomFeed ? 'entry' : 'item'} ${i + 1}/${itemMatches.length}`);
      
      if (isAtomFeed) {
        // Parse Atom entry fields
        const idMatch = itemMatch.match(/<id[^>]*>([\s\S]*?)<\/id>/i);
        const titleMatch = itemMatch.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title[^>]*>([\s\S]*?)<\/title>/i);
        const summaryMatch = itemMatch.match(/<summary[^>]*type="html"[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/summary>|<summary[^>]*type="html"[^>]*>([\s\S]*?)<\/summary>|<summary[^>]*>([\s\S]*?)<\/summary>/i);
        const contentMatch = itemMatch.match(/<content[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/content>|<content[^>]*>([\s\S]*?)<\/content>/i);
        const linkMatch = itemMatch.match(/<link[^>]*href=["']([\s\S]*?)["'][^>]*>/i);
        const updatedMatch = itemMatch.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i);
        const categoryMatch = itemMatch.match(/<category[^>]*term=["']([\s\S]*?)["'][^>]*>/i);
        const authorMatch = itemMatch.match(/<author[^>]*>[\s\S]*?<name[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/name>|<author[^>]*>[\s\S]*?<name[^>]*>([\s\S]*?)<\/name>/i);
        
        if (idMatch) item.guid = idMatch[1].trim();
        if (titleMatch) {
          item.title = (titleMatch[1] || titleMatch[2] || '').trim();
          console.log(`🏛️ [Immigration Travel Processor] Entry ${i + 1} title: ${item.title}`);
        }
        if (summaryMatch) {
          item.summary = (summaryMatch[1] || summaryMatch[2] || summaryMatch[3] || '').trim();
          console.log(`🏛️ [Immigration Travel Processor] Entry ${i + 1} summary length: ${item.summary?.length || 0}`);
        }
        if (contentMatch) {
          item.content = (contentMatch[1] || contentMatch[2] || '').trim();
          console.log(`🏛️ [Immigration Travel Processor] Entry ${i + 1} content length: ${item.content?.length || 0}`);
        }
        if (linkMatch) item.link = linkMatch[1].trim();
        if (updatedMatch) item.pubDate = updatedMatch[1].trim();
        if (categoryMatch) item.category = categoryMatch[1].trim();
        if (authorMatch) item.author = (authorMatch[1] || authorMatch[2] || '').trim();
        
      } else {
        // Parse RSS item fields (existing logic)
        const titleMatch = itemMatch.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title[^>]*>([\s\S]*?)<\/title>/i);
        const descMatch = itemMatch.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description[^>]*>([\s\S]*?)<\/description>/i);
        const linkMatch = itemMatch.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
        const pubDateMatch = itemMatch.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
        const guidMatch = itemMatch.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
        const categoryMatch = itemMatch.match(/<category[^>]*>([\s\S]*?)<\/category>/i);
        
        if (titleMatch) {
          item.title = (titleMatch[1] || titleMatch[2] || '').trim();
          console.log(`🏛️ [Immigration Travel Processor] Item ${i + 1} title: ${item.title}`);
        }
        if (descMatch) {
          item.summary = (descMatch[1] || descMatch[2] || '').trim();
          console.log(`🏛️ [Immigration Travel Processor] Item ${i + 1} description length: ${item.summary?.length || 0}`);
        }
        if (linkMatch) item.link = linkMatch[1].trim();
        if (pubDateMatch) item.pubDate = pubDateMatch[1].trim();
        if (guidMatch) item.guid = guidMatch[1].trim();
        if (categoryMatch) item.category = categoryMatch[1].trim();
      }
      
      items.push(item);
    }

    console.log(`🏛️ [Immigration Travel Processor] Parsed ${items.length} items from ${source.name}`);

    // Store directly in immigration_travel_announcements table
    if (items.length > 0) {
      console.log(`🏛️ [Immigration Travel Processor] Mapping ${items.length} items to announcements format`);
      
      const { storeImmigrationTravelAnnouncements } = await import('./processors/storage/immigration-travel-storage.ts');
      const storedCount = await storeImmigrationTravelAnnouncements(supabaseClient, items, source);
      
      console.log(`🏛️ [Immigration Travel Processor] Successfully stored ${storedCount} announcements for ${source.name}`);
      
      if (storedCount !== items.length) {
        console.warn(`🏛️ [Immigration Travel Processor] Warning: Attempted to store ${items.length} announcements but only stored ${storedCount}`);
      }
      
      return {
        source_name: source.name,
        success: true,
        records_processed: storedCount,
        response_time_ms: Date.now() - startTime
      };
    }

    console.log(`🏛️ [Immigration Travel Processor] No items to store for ${source.name}`);
    return {
      source_name: source.name,
      success: true,
      records_processed: 0,
      response_time_ms: Date.now() - startTime
    };

  } catch (error) {
    console.error(`🏛️ [Immigration Travel Processor] Error processing source ${source.name}:`, error);
    console.error(`🏛️ [Immigration Travel Processor] Error stack:`, error.stack);
    throw error;
  }
}
