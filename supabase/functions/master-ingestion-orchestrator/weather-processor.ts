
export async function processGeoMetSource(source: any, supabaseClient: any) {
  const startTime = Date.now();
  
  try {
    console.log(`Processing GeoMet weather source: ${source.name}`);
    
    const response = await fetch(source.api_endpoint, {
      headers: {
        'User-Agent': 'Security-Intelligence-Platform/1.0',
        'Accept': 'application/json, application/geo+json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Fetched weather data from ${source.name}:`, Object.keys(data));
    
    let alerts: any[] = [];
    
    // Handle GeoJSON format
    if (data.features && Array.isArray(data.features)) {
      alerts = data.features.map((feature: any) => {
        const props = feature.properties || {};
        return {
          id: props.id || `weather-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          description: props.description || props.headline || 'Weather alert',
          severity: props.severity || 'Unknown',
          event_type: props.event || props.type || 'Weather',
          onset: props.onset || props.effective,
          expires: props.expires || props.expiry,
          geometry_coordinates: feature.geometry?.coordinates,
          raw_data: feature
        };
      });
    } else if (data.alerts && Array.isArray(data.alerts)) {
      alerts = data.alerts;
    } else if (Array.isArray(data)) {
      alerts = data;
    }

    console.log(`Processed ${alerts.length} weather alerts from ${source.name}`);

    // Store directly in weather_alerts_ingest table
    if (alerts.length > 0) {
      const weatherAlerts = alerts.map((alert, index) => ({
        id: alert.id || `${source.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${index}`,
        description: alert.description || 'Weather alert',
        severity: alert.severity,
        event_type: alert.event_type || alert.event || 'Weather',
        onset: alert.onset ? new Date(alert.onset).toISOString() : null,
        expires: alert.expires ? new Date(alert.expires).toISOString() : null,
        geometry_coordinates: alert.geometry_coordinates ? JSON.stringify(alert.geometry_coordinates) : null,
        raw_data: alert
      }));

      const { data: insertedAlerts, error: insertError } = await supabaseClient
        .from('weather_alerts_ingest')
        .upsert(weatherAlerts, { onConflict: 'id' })
        .select();

      if (insertError) {
        console.error(`Error storing weather alerts for ${source.name}:`, insertError);
        throw insertError;
      }

      console.log(`Successfully stored ${insertedAlerts?.length || 0} weather alerts for ${source.name}`);
      
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
    console.error(`Error processing GeoMet weather source ${source.name}:`, error);
    throw error;
  }
}
