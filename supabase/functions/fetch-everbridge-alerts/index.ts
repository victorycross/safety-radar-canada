
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (source !== "everbridge") {
      return new Response(
        JSON.stringify({ error: "Invalid source specified" }),
        { status: 400, headers: CORS_HEADERS }
      );
    }

    console.log("Fetching alerts from Everbridge...");
    
    // TODO: Implement actual Everbridge API integration
    // For now, return empty array instead of mock data
    const alertsData = [];
    
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
