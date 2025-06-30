
export async function processSecurityRSSSource(source: any, supabaseClient: any) {
  const startTime = Date.now();
  
  try {
    console.log(`Processing security RSS source: ${source.name}`);
    
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
    console.log(`Fetched ${xmlText.length} characters from ${source.name}`);
    
    // Simple RSS parsing
    const items: any[] = [];
    const itemMatches = xmlText.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];

    for (const itemMatch of itemMatches) {
      const item: any = { raw_xml: itemMatch };
      
      // Extract common RSS fields
      const titleMatch = itemMatch.match(/<title[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/title>|<title[^>]*>([\s\S]*?)<\/title>/i);
      const descMatch = itemMatch.match(/<description[^>]*><!\[CDATA\[([\s\S]*?)\]\]><\/description>|<description[^>]*>([\s\S]*?)<\/description>/i);
      const linkMatch = itemMatch.match(/<link[^>]*>([\s\S]*?)<\/link>/i);
      const pubDateMatch = itemMatch.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i);
      const guidMatch = itemMatch.match(/<guid[^>]*>([\s\S]*?)<\/guid>/i);
      
      if (titleMatch) item.title = (titleMatch[1] || titleMatch[2] || '').trim();
      if (descMatch) item.description = (descMatch[1] || descMatch[2] || '').trim();
      if (linkMatch) item.link = linkMatch[1].trim();
      if (pubDateMatch) item.pubDate = pubDateMatch[1].trim();
      if (guidMatch) item.guid = guidMatch[1].trim();
      
      items.push(item);
    }

    console.log(`Parsed ${items.length} items from ${source.name}`);

    // Store directly in security_alerts_ingest table
    if (items.length > 0) {
      const securityAlerts = items.map((item, index) => ({
        id: item.guid || `${source.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
        title: item.title || 'Untitled Alert',
        summary: item.description || 'No description available',
        link: item.link,
        pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
        source: source.name,
        category: 'cybersecurity',
        location: 'Global',
        raw_data: item
      }));

      const { data: insertedAlerts, error: insertError } = await supabaseClient
        .from('security_alerts_ingest')
        .upsert(securityAlerts, { onConflict: 'id' })
        .select();

      if (insertError) {
        console.error(`Error storing security alerts for ${source.name}:`, insertError);
        throw insertError;
      }

      console.log(`Successfully stored ${insertedAlerts?.length || 0} security alerts for ${source.name}`);
      
      return {
        source_name: source.name,
        success: true,
        records_processed: insertedAlerts?.length || 0,
        response_time_ms: Date.now() - startTime
      };
    }

    return {
      source_name: source.name,
      success: true,
      records_processed: 0,
      response_time_ms: Date.now() - startTime
    };

  } catch (error) {
    console.error(`Error processing security RSS source ${source.name}:`, error);
    throw error;
  }
}
