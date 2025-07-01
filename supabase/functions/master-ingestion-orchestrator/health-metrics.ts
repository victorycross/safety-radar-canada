
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
  // Always poll if never polled before
  if (!source.last_poll_at) {
    console.log(`✅ Source ${source.name} never polled, should poll now`);
    return true;
  }
  
  const lastPoll = new Date(source.last_poll_at);
  const now = new Date();
  const timeSinceLastPoll = (now.getTime() - lastPoll.getTime()) / 1000; // seconds
  
  // Use a more reasonable polling interval - minimum 5 minutes for active sources
  const effectiveInterval = Math.max(source.polling_interval || 300, 300); // minimum 5 minutes
  
  const shouldPoll = timeSinceLastPoll >= effectiveInterval;
  
  console.log(`🕐 Source ${source.name}: Last poll ${Math.round(timeSinceLastPoll)}s ago, interval ${effectiveInterval}s, should poll: ${shouldPoll}`);
  
  return shouldPoll;
}
