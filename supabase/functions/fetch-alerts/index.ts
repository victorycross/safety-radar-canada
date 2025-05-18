
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as xml2js from "https://esm.sh/xml2js@0.6.2";

const ALERT_READY_URL = "https://rss.naad-adna.pelmorex.com/";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS, status: 204 });
  }

  try {
    // Parse request body
    const { source } = await req.json();
    
    if (source !== "alert-ready") {
      return new Response(
        JSON.stringify({ error: "Invalid source specified" }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    console.log("Fetching alerts from Alert Ready...");
    const alertsData = await fetchAlertReadyData();
    
    return new Response(
      JSON.stringify({ alerts: alertsData }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch alerts", details: error.message }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

async function fetchAlertReadyData() {
  try {
    // Fetch the RSS feed from Alert Ready
    const response = await fetch(ALERT_READY_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Alert Ready data: ${response.status} ${response.statusText}`);
    }

    const xmlText = await response.text();
    
    // Skip DOMParser and directly use xml2js for parsing
    // Parse the XML to JSON using xml2js
    const result = await xml2js.parseStringPromise(xmlText);
    
    // Extract entries from the feed
    const entries = result.feed?.entry || [];
    
    // Process and format the alerts
    const processedAlerts = entries.map((entry: any) => {
      // Extract CAP parameters from content
      const content = entry.content?.[0]?._; // Get content text
      let severity = "Unknown";
      let urgency = "Unknown";
      let category = "Other";
      let status = "Actual";
      let area = "Unknown";
      
      // Parse CAP parameters from content
      if (content) {
        const severityMatch = content.match(/severity:\s*([A-Za-z]+)/i);
        if (severityMatch) severity = severityMatch[1];
        
        const urgencyMatch = content.match(/urgency:\s*([A-Za-z]+)/i);
        if (urgencyMatch) urgency = urgencyMatch[1];
        
        const categoryMatch = content.match(/category:\s*([A-Za-z]+)/i);
        if (categoryMatch) category = categoryMatch[1];
        
        const statusMatch = content.match(/status:\s*([A-Za-z]+)/i);
        if (statusMatch) status = statusMatch[1];
        
        const areaMatch = content.match(/areaDesc:\s*([^\n]+)/i);
        if (areaMatch) area = areaMatch[1].trim();
      }
      
      return {
        id: entry.id?.[0] || `alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: entry.title?.[0]?._,
        published: entry.published?.[0],
        updated: entry.updated?.[0],
        summary: entry.summary?.[0]?._,
        severity,
        urgency,
        category,
        status,
        area,
        url: entry.link?.[0]?.$?.href
      };
    });
    
    console.log(`Processed ${processedAlerts.length} alerts successfully`);
    return processedAlerts;
  } catch (error) {
    console.error("Error fetching Alert Ready data:", error);
    throw error;
  }
}
