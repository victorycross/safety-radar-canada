
import { UniversalAlert } from '../alert-types.ts';

export async function queueAlertsForProcessing(supabaseClient: any, alerts: UniversalAlert[], sourceId: string): Promise<number> {
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
