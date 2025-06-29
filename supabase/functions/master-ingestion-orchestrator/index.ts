import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AlertSource {
  id: string;
  name: string;
  source_type: string;
  api_endpoint: string;
  is_active: boolean;
  polling_interval: number;
  last_poll_at: string | null;
  health_status: string;
  configuration: any;
}

interface HealthMetric {
  source_id: string;
  response_time_ms: number;
  success: boolean;
  error_message?: string;
  records_processed: number;
  http_status_code?: number;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Master ingestion orchestrator started');

    // Get all active alert sources
    const { data: sources, error: sourcesError } = await supabaseClient
      .from('alert_sources')
      .select('*')
      .eq('is_active', true);

    if (sourcesError) {
      throw new Error(`Failed to fetch alert sources: ${sourcesError.message}`);
    }

    console.log(`Found ${sources?.length || 0} active sources to process`);

    const results = [];

    // Process each source
    for (const source of sources || []) {
      try {
        console.log(`Processing source: ${source.name} (${source.source_type})`);
        
        const shouldPoll = shouldPollSource(source);
        if (!shouldPoll) {
          console.log(`Skipping ${source.name} - not due for polling`);
          continue;
        }

        const result = await processSource(source, supabaseClient);
        results.push(result);

      } catch (error) {
        console.error(`Error processing source ${source.name}:`, error);
        
        // Record failed health metric
        await recordHealthMetric(supabaseClient, {
          source_id: source.id,
          response_time_ms: 0,
          success: false,
          error_message: error.message,
          records_processed: 0
        });
      }
    }

    // Run correlation analysis on new incidents
    await runCorrelationAnalysis(supabaseClient);

    return new Response(
      JSON.stringify({
        success: true,
        processed_sources: results.length,
        results: results,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Master orchestrator error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function shouldPollSource(source: AlertSource): boolean {
  if (!source.last_poll_at) return true;
  
  const lastPoll = new Date(source.last_poll_at);
  const now = new Date();
  const timeSinceLastPoll = (now.getTime() - lastPoll.getTime()) / 1000;
  
  return timeSinceLastPoll >= source.polling_interval;
}

async function processSource(source: AlertSource, supabaseClient: any) {
  const startTime = Date.now();
  let httpStatus: number | undefined;
  
  try {
    console.log(`Fetching data from: ${source.api_endpoint}`);
    
    // Use specialized processing for different source types
    if (source.source_type === 'weather-geocmet') {
      return await processGeoMetSource(source, supabaseClient);
    } else if (source.source_type === 'security-rss') {
      return await processSecurityRSSSource(source, supabaseClient);
    }
    
    // ... keep existing code for other source types
    const requestConfig: RequestInit = {
      method: 'GET',
      headers: {
        'User-Agent': 'Security-Intelligence-Platform/1.0',
        'Accept': getAcceptHeader(source.source_type)
      }
    };

    // Add API key if configured
    if (source.configuration?.api_key) {
      requestConfig.headers = {
        ...requestConfig.headers,
        'Authorization': `Bearer ${source.configuration.api_key}`
      };
    }

    const response = await fetch(source.api_endpoint, requestConfig);
    httpStatus = response.status;
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    let data: any;

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else if (contentType.includes('xml') || contentType.includes('rss')) {
      const text = await response.text();
      data = await parseXmlData(text, source.source_type);
    } else {
      data = await response.text();
    }

    // Process and normalize the data
    const processedAlerts = await normalizeAlerts(data, source);
    
    // Queue alerts for processing
    const queuedCount = await queueAlertsForProcessing(supabaseClient, processedAlerts, source.id);
    
    const responseTime = Date.now() - startTime;
    
    // Record successful health metric
    await recordHealthMetric(supabaseClient, {
      source_id: source.id,
      response_time_ms: responseTime,
      success: true,
      records_processed: queuedCount,
      http_status_code: httpStatus
    });

    return {
      source_name: source.name,
      success: true,
      records_processed: queuedCount,
      response_time_ms: responseTime
    };

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    await recordHealthMetric(supabaseClient, {
      source_id: source.id,
      response_time_ms: responseTime,
      success: false,
      error_message: error.message,
      records_processed: 0,
      http_status_code: httpStatus
    });

    throw error;
  }
}

async function processSecurityRSSSource(source: AlertSource, supabaseClient: any) {
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

function classifyLocation(title: string, description: string): string {
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

async function parseRSSItems(rssText: string): Promise<any[]> {
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

// ... keep existing code (processGeoMetSource function)
async function processGeoMetSource(source: AlertSource, supabaseClient: any) {
  const startTime = Date.now();
  let retryCount = 0;
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  
  while (retryCount <= maxRetries) {
    try {
      console.log(`Attempting GeoMet API call (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      const response = await fetch(source.api_endpoint, {
        method: 'GET',
        headers: {
          'User-Agent': 'Security-Intelligence-Platform/1.0',
          'Accept': 'application/json, application/geo+json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const geoJsonData = await response.json();
      console.log(`Received GeoJSON data with ${geoJsonData.features?.length || 0} features`);
      
      // Process and save weather alerts
      const processedCount = await processWeatherAlerts(geoJsonData, supabaseClient);
      
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
      console.error(`GeoMet API attempt ${retryCount + 1} failed:`, error);
      
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

async function processWeatherAlerts(geoJsonData: any, supabaseClient: any): Promise<number> {
  if (!geoJsonData.features || !Array.isArray(geoJsonData.features)) {
    console.log('No features found in GeoJSON response');
    return 0;
  }
  
  const alerts = [];
  
  for (const feature of geoJsonData.features) {
    try {
      const alert = {
        id: feature.id || feature.properties?.id || `alert_${Date.now()}_${Math.random()}`,
        geometry_coordinates: feature.geometry?.coordinates || null,
        event_type: feature.properties?.eventType || feature.properties?.event_type || null,
        severity: feature.properties?.severity || null,
        onset: feature.properties?.onset ? new Date(feature.properties.onset).toISOString() : null,
        expires: feature.properties?.expires ? new Date(feature.properties.expires).toISOString() : null,
        description: feature.properties?.description || feature.properties?.headline || null,
        raw_data: feature,
        updated_at: new Date().toISOString()
      };
      
      alerts.push(alert);
    } catch (error) {
      console.error('Error processing weather alert feature:', error, feature);
    }
  }
  
  if (alerts.length === 0) {
    console.log('No valid alerts to process');
    return 0;
  }
  
  // Use upsert to handle duplicates
  const { error: insertError } = await supabaseClient
    .from('weather_alerts_ingest')
    .upsert(alerts, { onConflict: 'id' });
  
  if (insertError) {
    console.error('Failed to insert weather alerts:', insertError);
    throw new Error(`Failed to save weather alerts: ${insertError.message}`);
  }
  
  console.log(`Successfully processed ${alerts.length} weather alerts`);
  return alerts.length;
}

function getAcceptHeader(sourceType: string): string {
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

async function parseXmlData(xmlText: string, sourceType: string): Promise<any> {
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

async function normalizeAlerts(data: any, source: AlertSource): Promise<any[]> {
  const alerts: any[] = [];
  
  // Handle different data formats
  let items: any[] = [];
  
  if (data.items) {
    items = data.items;
  } else if (data.features) {
    items = data.features; // GeoJSON format
  } else if (Array.isArray(data)) {
    items = data;
  } else if (data.alerts) {
    items = data.alerts;
  }

  for (const item of items) {
    const normalizedAlert = {
      title: item.title || item.properties?.headline || item.summary || 'Untitled Alert',
      description: item.description || item.properties?.description || item.content || '',
      severity: normalizeSeverity(item.severity || item.properties?.severity || 'Minor'),
      timestamp: parseTimestamp(item.pubDate || item.updated || item.properties?.onset || new Date().toISOString()),
      source_type: source.source_type,
      source_name: source.name,
      raw_data: item,
      confidence_score: calculateConfidenceScore(item, source),
      geographic_data: extractGeographicData(item)
    };
    
    alerts.push(normalizedAlert);
  }
  
  return alerts;
}

function normalizeSeverity(severity: string): string {
  const severityLower = severity.toLowerCase();
  
  if (['extreme', 'severe', 'critical', 'high'].includes(severityLower)) {
    return 'severe';
  } else if (['moderate', 'warning', 'medium'].includes(severityLower)) {
    return 'warning';
  } else {
    return 'normal';
  }
}

function parseTimestamp(timestamp: string): string {
  try {
    return new Date(timestamp).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function calculateConfidenceScore(item: any, source: AlertSource): number {
  let score = 0.5; // Base score
  
  // Increase confidence for official sources
  if (['weather', 'weather-geocmet', 'emergency', 'security-rss'].includes(source.source_type)) {
    score += 0.3;
  }
  
  // Increase confidence if location data is present
  if (item.geometry || item.area || item.location) {
    score += 0.1;
  }
  
  // Increase confidence if timestamp is recent
  const timestamp = new Date(item.pubDate || item.updated || Date.now());
  const hoursOld = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
  if (hoursOld < 24) {
    score += 0.1;
  }
  
  return Math.min(1.0, score);
}

function extractGeographicData(item: any): any {
  const geoData: any = {};
  
  // Extract coordinates from various formats
  if (item.geometry?.coordinates) {
    geoData.longitude = item.geometry.coordinates[0];
    geoData.latitude = item.geometry.coordinates[1];
  }
  
  // Extract area information
  if (item.area || item.properties?.areaDesc) {
    geoData.area = item.area || item.properties.areaDesc;
  }
  
  return geoData;
}

async function queueAlertsForProcessing(supabaseClient: any, alerts: any[], sourceId: string): Promise<number> {
  if (!alerts.length) return 0;
  
  const queueItems = alerts.map(alert => ({
    source_id: sourceId,
    raw_payload: alert,
    processing_status: 'pending'
  }));
  
  const { error } = await supabaseClient
    .from('alert_ingestion_queue')
    .insert(queueItems);
  
  if (error) {
    console.error('Failed to queue alerts:', error);
    return 0;
  }
  
  return alerts.length;
}

async function recordHealthMetric(supabaseClient: any, metric: HealthMetric) {
  const { error } = await supabaseClient
    .from('source_health_metrics')
    .insert(metric);
  
  if (error) {
    console.error('Failed to record health metric:', error);
  }
}

async function runCorrelationAnalysis(supabaseClient: any) {
  try {
    console.log('Running correlation analysis...');
    
    // Get recent incidents for correlation (last 24 hours)
    const { data: recentIncidents, error } = await supabaseClient
      .from('incidents')
      .select('*')
      .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('timestamp', { ascending: false });
    
    if (error || !recentIncidents?.length) {
      console.log('No recent incidents for correlation analysis');
      return;
    }
    
    // Simple correlation logic - find incidents with similar titles or descriptions
    const correlations: any[] = [];
    
    for (let i = 0; i < recentIncidents.length; i++) {
      for (let j = i + 1; j < recentIncidents.length; j++) {
        const incident1 = recentIncidents[i];
        const incident2 = recentIncidents[j];
        
        const similarity = calculateSimilarity(incident1, incident2);
        
        if (similarity > 0.7) {
          correlations.push({
            primary_incident_id: incident1.id,
            related_incident_id: incident2.id,
            correlation_type: 'semantic',
            confidence_score: similarity
          });
        }
      }
    }
    
    if (correlations.length > 0) {
      await supabaseClient
        .from('alert_correlations')
        .upsert(correlations, { onConflict: 'primary_incident_id,related_incident_id' });
      
      console.log(`Created ${correlations.length} correlations`);
    }
    
  } catch (error) {
    console.error('Correlation analysis error:', error);
  }
}

function calculateSimilarity(incident1: any, incident2: any): number {
  // Simple similarity calculation based on title and description overlap
  const title1 = incident1.title.toLowerCase();
  const title2 = incident2.title.toLowerCase();
  const desc1 = incident1.description.toLowerCase();
  const desc2 = incident2.description.toLowerCase();
  
  // Calculate word overlap
  const words1 = new Set([...title1.split(' '), ...desc1.split(' ')]);
  const words2 = new Set([...title2.split(' '), ...desc2.split(' ')]);
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}
