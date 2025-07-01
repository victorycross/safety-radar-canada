
export async function processSecurityRSSSource(source: any, supabaseClient: any) {
  const startTime = Date.now();
  
  try {
    console.log(`🔐 [Security Processor] Processing security RSS/Atom source: ${source.name}`);
    console.log(`🔐 [Security Processor] API endpoint: ${source.api_endpoint}`);
    
    const response = await fetch(source.api_endpoint, {
      headers: {
        'User-Agent': 'Security-Intelligence-Platform/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();
    console.log(`🔐 [Security Processor] Fetched ${xmlText.length} characters from ${source.name}`);
    console.log(`🔐 [Security Processor] Feed content sample (first 500 chars):`, xmlText.substring(0, 500));
    
    // Enhanced parsing to handle both RSS and Atom feeds
    const items: any[] = [];
    
    // Check if it's an Atom feed
    const isAtomFeed = xmlText.includes('<feed') && xmlText.includes('xmlns="http://www.w3.org/2005/Atom"');
    console.log(`🔐 [Security Processor] Feed type detected: ${isAtomFeed ? 'Atom' : 'RSS'}`);
    
    // Parse based on feed type
    let itemMatches: RegExpMatchArray | null = null;
    
    if (isAtomFeed) {
      // Atom feeds use <entry> tags
      itemMatches = xmlText.match(/<entry[^>]*>[\s\S]*?<\/entry>/gi) || [];
      console.log(`🔐 [Security Processor] Found ${itemMatches.length} Atom entries`);
    } else {
      // RSS feeds use <item> tags
      itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
      console.log(`🔐 [Security Processor] Found ${itemMatches.length} RSS items`);
    }

    for (let i = 0; i < itemMatches.length; i++) {
      const itemMatch = itemMatches[i];
      const item: any = { raw_xml: itemMatch };
      
      console.log(`🔐 [Security Processor] Processing ${isAtomFeed ? 'entry' : 'item'} ${i + 1}/${itemMatches.length}`);
      
      if (isAtomFeed) {
        // Parse Atom entry fields
        const idMatch = itemMatch.match(/<id[^>]*>([\s\S]*?)<\/id>/i);
        const titleMatch = itemMatch.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title[^>]*>([\s\S]*?)<\/title>/i);
        const contentMatch = itemMatch.match(/<content[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/content>|<content[^>]*>([\s\S]*?)<\/content>/i);
        const summaryMatch = itemMatch.match(/<summary[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/summary>|<summary[^>]*>([\s\S]*?)<\/summary>/i);
        const linkMatch = itemMatch.match(/<link[^>]*href=["']([\s\S]*?)["'][^>]*>/i);
        const updatedMatch = itemMatch.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i);
        const authorMatch = itemMatch.match(/<author[^>]*>[\s\S]*?<name[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/name>|<author[^>]*>[\s\S]*?<name[^>]*>([\s\S]*?)<\/name>/i);
        
        if (idMatch) item.guid = idMatch[1].trim();
        if (titleMatch) {
          item.title = (titleMatch[1] || titleMatch[2] || '').trim();
          console.log(`🔐 [Security Processor] Entry ${i + 1} title: ${item.title}`);
        }
        if (contentMatch) {
          item.description = (contentMatch[1] || contentMatch[2] || '').trim();
          console.log(`🔐 [Security Processor] Entry ${i + 1} content length: ${item.description?.length || 0}`);
        } else if (summaryMatch) {
          item.description = (summaryMatch[1] || summaryMatch[2] || '').trim();
          console.log(`🔐 [Security Processor] Entry ${i + 1} summary length: ${item.description?.length || 0}`);
        }
        if (linkMatch) item.link = linkMatch[1].trim();
        if (updatedMatch) item.pubDate = updatedMatch[1].trim();
        if (authorMatch) item.author = (authorMatch[1] || authorMatch[2] || '').trim();
        
      } else {
        // Parse RSS item fields (existing logic)
        const titleMatch = itemMatch.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title[^>]*>([\s\S]*?)<\/title>/i);
        const descMatch = itemMatch.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description[^>]*>([\s\S]*?)<\/description>/i);
        const linkMatch = itemMatch.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
        const pubDateMatch = itemMatch.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
        const guidMatch = itemMatch.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
        
        if (titleMatch) {
          item.title = (titleMatch[1] || titleMatch[2] || '').trim();
          console.log(`🔐 [Security Processor] Item ${i + 1} title: ${item.title}`);
        }
        if (descMatch) {
          item.description = (descMatch[1] || descMatch[2] || '').trim();
          console.log(`🔐 [Security Processor] Item ${i + 1} description length: ${item.description?.length || 0}`);
        }
        if (linkMatch) item.link = linkMatch[1].trim();
        if (pubDateMatch) item.pubDate = pubDateMatch[1].trim();
        if (guidMatch) item.guid = guidMatch[1].trim();
      }
      
      items.push(item);
    }

    console.log(`🔐 [Security Processor] Parsed ${items.length} items from ${source.name}`);

    // Store directly in security_alerts_ingest table with enhanced logging
    if (items.length > 0) {
      console.log(`🔐 [Security Processor] Mapping ${items.length} items to security alerts format`);
      
      const securityAlerts = items.map((item, index) => {
        const alertId = item.guid || item.id || `${source.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`;
        const alert = {
          id: alertId,
          title: item.title || 'Untitled Alert',
          summary: item.description || 'No description available',
          link: item.link,
          pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          source: source.name,
          category: 'cybersecurity',
          location: 'Canada', // CCCS is Canadian
          raw_data: item
        };
        
        if (index === 0) {
          console.log(`🔐 [Security Processor] Sample security alert:`, JSON.stringify(alert, null, 2));
        }
        
        return alert;
      });

      console.log(`🔐 [Security Processor] Attempting to insert ${securityAlerts.length} security alerts`);

      const { data: insertedAlerts, error: insertError } = await supabaseClient
        .from('security_alerts_ingest')
        .upsert(securityAlerts, { onConflict: 'id' })
        .select();

      if (insertError) {
        console.error(`🔐 [Security Processor] Database insertion error for ${source.name}:`, insertError);
        console.error(`🔐 [Security Processor] Error details:`, JSON.stringify(insertError, null, 2));
        console.error(`🔐 [Security Processor] Sample alert that failed:`, JSON.stringify(securityAlerts[0], null, 2));
        throw insertError;
      }

      const storedCount = insertedAlerts?.length || 0;
      console.log(`🔐 [Security Processor] Successfully stored ${storedCount} security alerts for ${source.name}`);
      
      if (storedCount !== securityAlerts.length) {
        console.warn(`🔐 [Security Processor] Warning: Attempted to store ${securityAlerts.length} alerts but only stored ${storedCount}`);
      }
      
      return {
        source_name: source.name,
        success: true,
        records_processed: storedCount,
        response_time_ms: Date.now() - startTime
      };
    }

    console.log(`🔐 [Security Processor] No items to store for ${source.name}`);
    return {
      source_name: source.name,
      success: true,
      records_processed: 0,
      response_time_ms: Date.now() - startTime
    };

  } catch (error) {
    console.error(`🔐 [Security Processor] Error processing security RSS/Atom source ${source.name}:`, error);
    console.error(`🔐 [Security Processor] Error stack:`, error.stack);
    throw error;
  }
}
