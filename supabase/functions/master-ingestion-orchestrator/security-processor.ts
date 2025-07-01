
export async function processSecurityRSSSource(source: any, supabaseClient: any) {
  const startTime = Date.now();
  
  try {
    console.log(`🔐 [Security Processor] Processing security RSS source: ${source.name}`);
    console.log(`🔐 [Security Processor] API endpoint: ${source.api_endpoint}`);
    
    const response = await fetch(source.api_endpoint, {
      headers: {
        'User-Agent': 'Security-Intelligence-Platform/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();
    console.log(`🔐 [Security Processor] Fetched ${xmlText.length} characters from ${source.name}`);
    console.log(`🔐 [Security Processor] RSS content sample (first 500 chars):`, xmlText.substring(0, 500));
    
    // Enhanced RSS parsing with detailed logging
    const items: any[] = [];
    const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
    
    console.log(`🔐 [Security Processor] Found ${itemMatches.length} RSS items in XML`);

    for (let i = 0; i < itemMatches.length; i++) {
      const itemMatch = itemMatches[i];
      const item: any = { raw_xml: itemMatch };
      
      console.log(`🔐 [Security Processor] Processing item ${i + 1}/${itemMatches.length}`);
      
      // Extract common RSS fields with enhanced logging
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
      
      items.push(item);
    }

    console.log(`🔐 [Security Processor] Parsed ${items.length} items from ${source.name}`);

    // Store directly in security_alerts_ingest table with enhanced logging
    if (items.length > 0) {
      console.log(`🔐 [Security Processor] Mapping ${items.length} items to security alerts format`);
      
      const securityAlerts = items.map((item, index) => {
        const alertId = item.guid || `${source.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`;
        const alert = {
          id: alertId,
          title: item.title || 'Untitled Alert',
          summary: item.description || 'No description available',
          link: item.link,
          pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          source: source.name,
          category: 'cybersecurity',
          location: 'Global',
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
    console.error(`🔐 [Security Processor] Error processing security RSS source ${source.name}:`, error);
    console.error(`🔐 [Security Processor] Error stack:`, error.stack);
    throw error;
  }
}
