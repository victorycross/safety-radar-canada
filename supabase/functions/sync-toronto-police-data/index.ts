
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use the service role key for full admin rights to DB
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Toronto Police API endpoints
const MAJOR_CRIMES_ENDPOINT = "https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Major_Crime_Indicators_Open_Data/FeatureServer/0/query";
const SHOOTING_ENDPOINT = "https://services.arcgis.com/S9th0jAJ7bqgIRjw/arcgis/rest/services/Shooting_and_Firearm_Discharges_Open_Data/FeatureServer/0/query";

// Function to fetch data from Toronto Police API
async function fetchPoliceData(endpoint: string, params: Record<string, string> = {}) {
  try {
    const url = new URL(endpoint);
    
    // Set default parameters
    const defaultParams = {
      where: "1=1",
      outFields: "*",
      outSR: "4326",
      f: "json",
      resultRecordCount: "100", // Limit results for testing
      ...params
    };
    
    // Add parameters to URL
    Object.entries(defaultParams).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    console.log(`Fetching data from: ${url.toString()}`);
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error("Error fetching police data:", error);
    throw error;
  }
}

// Function to update database with the fetched data
async function processData(data: any) {
  if (!data || !data.features || !Array.isArray(data.features)) {
    throw new Error("Invalid data format received");
  }
  
  const records = data.features.map((feature: any) => {
    const attributes = feature.attributes;
    const geometry = feature.geometry;
    
    return {
      event_id: attributes.OBJECTID?.toString() || attributes.EventId?.toString() || attributes.event_id?.toString(),
      division: attributes.Division || attributes.division,
      category: attributes.MCI_Category || attributes.Occurrence_Type || attributes.category,
      report_date: attributes.reporteddate ? new Date(attributes.reporteddate).toISOString() : null,
      occurrence_date: attributes.occurrencedate ? new Date(attributes.occurrencedate).toISOString() : null,
      premises_type: attributes.premises_type || attributes.premisestype,
      neighborhood: attributes.Hood_ID || attributes.neighbourhood,
      longitude: geometry?.x || attributes.longitude,
      latitude: geometry?.y || attributes.latitude,
      location: geometry ? `POINT(${geometry.x} ${geometry.y})` : null,
      raw_data: attributes
    };
  });
  
  // Get existing event IDs to avoid duplicates
  const { data: existingIds } = await supabase
    .from('toronto_police_incidents')
    .select('event_id');
  
  const existingIdSet = new Set(existingIds?.map(item => item.event_id));
  
  // Filter out records that already exist
  const newRecords = records.filter(record => !existingIdSet.has(record.event_id));
  
  if (newRecords.length === 0) {
    return { processed: 0, message: "No new records to insert" };
  }
  
  console.log(`Inserting ${newRecords.length} new records`);
  
  // Insert new records
  const { data: insertedData, error } = await supabase
    .from('toronto_police_incidents')
    .insert(newRecords);
  
  if (error) {
    console.error("Error inserting records:", error);
    throw error;
  }
  
  return { processed: newRecords.length, message: `Inserted ${newRecords.length} new records` };
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Starting Toronto Police data sync");
    
    // Update status to processing
    await supabase
      .from('data_sync_status')
      .update({
        last_sync_time: new Date().toISOString(),
        status: 'processing',
        message: 'Data sync in progress'
      })
      .eq('source', 'toronto_police');
    
    console.log("Fetching major crimes data");
    // Fetch major crimes data
    const majorCrimes = await fetchPoliceData(MAJOR_CRIMES_ENDPOINT);
    const majorCrimesResult = await processData(majorCrimes);
    
    console.log("Fetching shooting data");
    // Fetch shooting data
    const shootings = await fetchPoliceData(SHOOTING_ENDPOINT);
    const shootingsResult = await processData(shootings);
    
    console.log("Sync completed successfully");
    // Update status to success
    await supabase
      .from('data_sync_status')
      .update({
        last_sync_time: new Date().toISOString(),
        status: 'success',
        message: `Sync completed: ${majorCrimesResult.processed} major crimes, ${shootingsResult.processed} shootings`
      })
      .eq('source', 'toronto_police');
    
    return new Response(
      JSON.stringify({
        success: true,
        majorCrimes: majorCrimesResult,
        shootings: shootingsResult
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders 
        } 
      }
    );
    
  } catch (error: any) {
    console.error("Error during sync:", error);
    
    // Update status to error
    await supabase
      .from('data_sync_status')
      .update({
        last_sync_time: new Date().toISOString(),
        status: 'error',
        message: error.message || 'Unknown error occurred during sync'
      })
      .eq('source', 'toronto_police');
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error"
      }),
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
});
