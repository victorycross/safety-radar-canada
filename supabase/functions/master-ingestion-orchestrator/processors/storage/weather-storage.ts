
import { AlertSource } from '../../types.ts';
import { mapWeatherAlerts } from './alert-mappers.ts';

export async function storeWeatherAlerts(supabaseClient: any, processedAlerts: any[], source: AlertSource): Promise<number> {
  if (processedAlerts.length === 0) {
    return 0;
  }

  const weatherAlerts = mapWeatherAlerts(processedAlerts, source);

  const { data: insertedAlerts, error: insertError } = await supabaseClient
    .from('weather_alerts_ingest')
    .upsert(weatherAlerts, { onConflict: 'id' })
    .select();

  if (insertError) {
    console.error(`Error storing weather alerts for ${source.name}:`, insertError);
    return 0;
  }

  const storedCount = insertedAlerts?.length || 0;
  console.log(`Stored ${storedCount} weather alerts for ${source.name}`);
  return storedCount;
}
