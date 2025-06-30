
import { AlertSource } from '../../types.ts';
import { mapSecurityAlerts } from './alert-mappers.ts';

export async function storeSecurityAlerts(supabaseClient: any, processedAlerts: any[], source: AlertSource): Promise<number> {
  if (processedAlerts.length === 0) {
    return 0;
  }

  const securityAlerts = mapSecurityAlerts(processedAlerts, source);

  const { data: insertedAlerts, error: insertError } = await supabaseClient
    .from('security_alerts_ingest')
    .upsert(securityAlerts, { onConflict: 'id' })
    .select();

  if (insertError) {
    console.error(`Error storing security alerts for ${source.name}:`, insertError);
    return 0;
  }

  const storedCount = insertedAlerts?.length || 0;
  console.log(`Stored ${storedCount} security alerts for ${source.name}`);
  return storedCount;
}
