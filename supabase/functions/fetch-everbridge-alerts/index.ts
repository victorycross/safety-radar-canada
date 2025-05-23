
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// This would be replaced with actual Everbridge API integration
// For now, we'll return mock data as an example
const mockEverbridgeAlerts = [
  {
    id: "everbridge-001",
    title: "Office Building Access Restricted",
    type: "Security",
    status: "Active",
    severity: "Moderate",
    location: "Vancouver Head Office",
    description: "Access to the main office building is currently restricted due to a security incident. Please work from home if possible. Updates will be provided via email.",
    updated: new Date().toISOString(),
    url: "https://manager.everbridge.net/alerts"
  },
  {
    id: "everbridge-002",
    title: "Regional Internet Outage",
    type: "IT Infrastructure",
    status: "Active",
    severity: "Warning",
    location: "Lower Mainland Operations",
    description: "Internet service provider reports regional outage affecting Lower Mainland operations. IT team is monitoring the situation. Expected resolution by 5:00 PM.",
    updated: new Date(Date.now() - 3600000).toISOString(),
    url: "https://manager.everbridge.net/alerts"
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS, status: 204 });
  }

  try {
    // Parse request body
    const { source } = await req.json();
    
    if (source !== "everbridge") {
      return new Response(
        JSON.stringify({ error: "Invalid source specified" }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    console.log("Fetching alerts from Everbridge...");
    
    // In a real implementation, this would actually call the Everbridge API
    // For now, we'll return mock data
    const alertsData = mockEverbridgeAlerts;
    
    return new Response(
      JSON.stringify({ alerts: alertsData }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch Everbridge alerts", details: error.message }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
});
