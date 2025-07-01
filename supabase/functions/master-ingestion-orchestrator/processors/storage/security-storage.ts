
import { AlertSource } from '../../types.ts';
import { mapSecurityAlerts } from './alert-mappers.ts';

export async function storeSecurityAlerts(supabaseClient: any, processedAlerts: any[], source: AlertSource): Promise<number> {
  console.log(`🔒 [Security Storage] Starting storage process for ${source.name}`);
  console.log(`🔒 [Security Storage] Input alerts count: ${processedAlerts.length}`);
  
  if (processedAlerts.length === 0) {
    console.log(`🔒 [Security Storage] No alerts to process - returning 0`);
    return 0;
  }

  try {
    console.log(`🔒 [Security Storage] Mapping ${processedAlerts.length} alerts for source: ${source.name}`);
    console.log(`🔒 [Security Storage] Sample raw alert:`, JSON.stringify(processedAlerts[0], null, 2));
    
    const securityAlerts = mapSecurityAlerts(processedAlerts, source);
    
    console.log(`🔒 [Security Storage] Mapped ${securityAlerts.length} security alerts`);
    console.log(`🔒 [Security Storage] Sample mapped alert:`, JSON.stringify(securityAlerts[0], null, 2));

    console.log(`🔒 [Security Storage] Attempting database upsert...`);
    const { data: insertedAlerts, error: insertError } = await supabaseClient
      .from('security_alerts_ingest')
      .upsert(securityAlerts, { onConflict: 'id' })
      .select();

    if (insertError) {
      console.error(`🔒 [Security Storage] Database error for ${source.name}:`, insertError);
      console.error(`🔒 [Security Storage] Error details:`, JSON.stringify(insertError, null, 2));
      return 0;
    }

    const storedCount = insertedAlerts?.length || 0;
    console.log(`🔒 [Security Storage] Successfully stored ${storedCount} security alerts for ${source.name}`);
    
    if (storedCount !== securityAlerts.length) {
      console.warn(`🔒 [Security Storage] Warning: Mapped ${securityAlerts.length} alerts but stored ${storedCount}`);
    }
    
    return storedCount;
  } catch (error) {
    console.error(`🔒 [Security Storage] Unexpected error in storeSecurityAlerts:`, error);
    console.error(`🔒 [Security Storage] Error stack:`, error.stack);
    return 0;
  }
}
