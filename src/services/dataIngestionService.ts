
import { supabase } from '@/integrations/supabase/client';
import { AlertSource, SourceHealthMetric, QueueStatus } from '@/types/dataIngestion';

export const fetchAlertSources = async (): Promise<AlertSource[]> => {
  const { data, error } = await supabase
    .from('alert_sources')
    .select('*')
    .order('name');
  
  if (error) throw error;
  
  if (data) {
    // Type assertion to ensure health_status matches our interface
    const mappedSources: AlertSource[] = data.map(source => ({
      ...source,
      health_status: source.health_status as 'healthy' | 'degraded' | 'error' | 'unknown'
    }));
    return mappedSources;
  }
  
  return [];
};

export const fetchHealthMetrics = async (): Promise<SourceHealthMetric[]> => {
  const { data, error } = await supabase
    .from('source_health_metrics')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100);
  
  if (error) throw error;
  
  return data || [];
};

export const fetchQueueStatus = async (): Promise<QueueStatus> => {
  const { data, error } = await supabase
    .from('alert_ingestion_queue')
    .select('processing_status')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Calculate queue statistics
  const status = {
    pending: data?.filter(item => item.processing_status === 'pending').length || 0,
    processing: data?.filter(item => item.processing_status === 'processing').length || 0,
    completed: data?.filter(item => item.processing_status === 'completed').length || 0,
    failed: data?.filter(item => item.processing_status === 'failed').length || 0,
    total: data?.length || 0
  };
  
  return status;
};

export const triggerMasterIngestion = async () => {
  const { data, error } = await supabase.functions.invoke('master-ingestion-orchestrator');
  
  if (error) throw error;
  
  return data;
};

export const processAlertQueue = async () => {
  const { data, error } = await supabase.functions.invoke('process-alert-queue');
  
  if (error) throw error;
  
  return data;
};

export const updateSourceStatus = async (sourceId: string, isActive: boolean) => {
  const { error } = await supabase
    .from('alert_sources')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', sourceId);
  
  if (error) throw error;
};
