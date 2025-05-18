
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

// ArcGIS REST API endpoint for BC Emergency Alerts
const BC_ALERTS_API = "https://services6.arcgis.com/ubm4tcTYICKBpist/arcgis/rest/services/British_Columbia_Active_Emergency_Alerts/FeatureServer/0/query?where=1%3D1&outFields=*&returnGeometry=false&f=json";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS, status: 204 });
  }

  try {
    // Parse request body
    const { source } = await req.json();
    
    if (source !== "arcgis-bc") {
      return new Response(
        JSON.stringify({ error: "Invalid source specified" }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    console.log("Fetching alerts from BC ArcGIS...");
    const alertsData = await fetchBCAlertsData();
    
    return new Response(
      JSON.stringify({ alerts: alertsData }),
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch BC alerts", details: error.message }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
});

async function fetchBCAlertsData() {
  try {
    // Fetch the data from ArcGIS API
    const response = await fetch(BC_ALERTS_API);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch BC ArcGIS data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if we have features to process
    if (!data.features || !Array.isArray(data.features)) {
      console.log("No features found in the BC ArcGIS response");
      return [];
    }
    
    // Process and format the alerts
    const processedAlerts = data.features.map((feature: any) => {
      const attributes = feature.attributes || {};
      
      return {
        id: attributes.OBJECTID?.toString() || `bc-alert-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: attributes.event_name || "Emergency Alert",
        type: attributes.event_type || "Alert",
        status: attributes.status || "Active",
        severity: attributes.severity || "Unknown",
        location: attributes.area_desc || "British Columbia",
        description: attributes.description || "No additional details available",
        updated: attributes.last_updated ? new Date(attributes.last_updated).toISOString() : new Date().toISOString(),
        url: attributes.info_url || undefined
      };
    });
    
    console.log(`Processed ${processedAlerts.length} BC alerts successfully`);
    return processedAlerts;
  } catch (error) {
    console.error("Error fetching BC ArcGIS data:", error);
    throw error;
  }
}
