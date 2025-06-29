
import { HealthMetric } from './types.ts';

export async function recordHealthMetric(supabaseClient: any, metric: HealthMetric) {
  const { error } = await supabaseClient
    .from('source_health_metrics')
    .insert(metric);
  
  if (error) {
    console.error('Failed to record health metric:', error);
  }
}

export function shouldPollSource(source: any): boolean {
  if (!source.last_poll_at) return true;
  
  const lastPoll = new Date(source.last_poll_at);
  const now = new Date();
  const timeSinceLastPoll = (now.getTime() - lastPoll.getTime()) / 1000;
  
  return timeSinceLastPoll >= source.polling_interval;
}
