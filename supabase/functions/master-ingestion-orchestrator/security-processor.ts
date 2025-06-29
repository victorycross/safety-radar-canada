
import { parseRSSItems, classifyLocation } from './rss-parser.ts';
import { recordHealthMetric } from './health-metrics.ts';
import { AlertSource, ProcessingResult } from './types.ts';

export async function processSecurityRSSSource(source: AlertSource, supabaseClient: any): Promise<ProcessingResult> {
  const startTime = Date.now();
  let retryCount = 0;
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  while (retryCount <= maxRetries) {
    try {
      console.log(`Attempting CSE RSS fetch (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      const response = await fetch(source.api_endpoint, {
        method: 'GET',
        headers: {
          'User-Agent': 'Security-Intelligence-Platform/1.0',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const rssText = await response.text();
      console.log(`Received RSS data: ${rssText.length} characters`);
      
      // Process and save security alerts
      const processedCount = await processSecurityAlerts(rssText, supabaseClient);
      
      const responseTime = Date.now() - startTime;
      
      // Record successful health metric
      await recordHealthMetric(supabaseClient, {
        source_id: source.id,
        response_time_ms: responseTime,
        success: true,
        records_processed: processedCount,
        http_status_code: response.status
      });
      
      return {
        source_name: source.name,
        success: true,
        records_processed: processedCount,
        response_time_ms: responseTime
      };
      
    } catch (error) {
      console.error(`CSE RSS attempt ${retryCount + 1} failed:`, error);
      
      if (retryCount === maxRetries) {
        // Final attempt failed, record failure
        const responseTime = Date.now() - startTime;
        await recordHealthMetric(supabaseClient, {
          source_id: source.id,
          response_time_ms: responseTime,
          success: false,
          error_message: `Failed after ${maxRetries + 1} attempts: ${error.message}`,
          records_processed: 0
        });
        throw error;
      }
      
      // Wait before retry with exponential backoff
      const delay = baseDelay * Math.pow(2, retryCount);
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      retryCount++;
    }
  }
}

async function processSecurityAlerts(rssText: string, supabaseClient: any): Promise<number> {
  // Parse RSS/XML data
  const items = await parseRSSItems(rssText);
  
  if (!items || items.length === 0) {
    console.log('No RSS items found');
    return 0;
  }
  
  const alerts = [];
  
  for (const item of items) {
    try {
      // Extract GUID/ID
      let id = item.guid || item.id;
      if (!id && item.link) {
        // Fallback: use link as ID if no GUID
        id = item.link;
      }
      if (!id) {
        // Fallback: generate ID from title and pubDate
        id = `cse_${Date.now()}_${Math.random()}`;
      }
      
      // Classify location based on content
      const location = classifyLocation(item.title, item.description);
      
      const alert = {
        id: id,
        title: item.title || 'Untitled Alert',
        pub_date: item.pubDate ? new Date(item.pubDate).toISOString() : null,
        summary: item.description || item.summary || null,
        link: item.link || null,
        source: 'CSE',
        category: 'cybersecurity',
        location: location,
        raw_data: item,
        updated_at: new Date().toISOString()
      };
      
      alerts.push(alert);
    } catch (error) {
      console.error('Error processing security alert item:', error, item);
    }
  }
  
  if (alerts.length === 0) {
    console.log('No valid security alerts to process');
    return 0;
  }
  
  // Use upsert to handle duplicates (only insert where id not already exists)
  const { error: insertError } = await supabaseClient
    .from('security_alerts_ingest')
    .upsert(alerts, { onConflict: 'id' });
  
  if (insertError) {
    console.error('Failed to insert security alerts:', insertError);
    throw new Error(`Failed to save security alerts: ${insertError.message}`);
  }
  
  console.log(`Successfully processed ${alerts.length} security alerts`);
  return alerts.length;
}
