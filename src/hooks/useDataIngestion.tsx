
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface AlertSource {
  id: string;
  name: string;
  description: string;
  source_type: string;
  api_endpoint: string;
  is_active: boolean;
  polling_interval: number;
  last_poll_at: string | null;
  health_status: 'healthy' | 'degraded' | 'error' | 'unknown';
  configuration: any;
  created_at: string;
  updated_at: string;
}

export interface SourceHealthMetric {
  id: string;
  source_id: string;
  timestamp: string;
  response_time_ms: number;
  success: boolean;
  error_message: string | null;
  records_processed: number;
  http_status_code: number | null;
}

export interface QueueItem {
  id: string;
  source_id: string;
  raw_payload: any;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_attempts: number;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

export const useDataIngestion = () => {
  const [sources, setSources] = useState<AlertSource[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<SourceHealthMetric[]>([]);
  const [queueStatus, setQueueStatus] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSources = async () => {
    try {
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
        setSources(mappedSources);
      }
    } catch (err) {
      console.error('Error fetching alert sources:', err);
      setError('Failed to load alert sources');
      toast({
        title: 'Error',
        description: 'Failed to load alert sources',
        variant: 'destructive',
      });
    }
  };

  const fetchHealthMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('source_health_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      
      setHealthMetrics(data || []);
    } catch (err) {
      console.error('Error fetching health metrics:', err);
    }
  };

  const fetchQueueStatus = async () => {
    try {
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
      
      setQueueStatus(status);
    } catch (err) {
      console.error('Error fetching queue status:', err);
    }
  };

  const triggerIngestion = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('master-ingestion-orchestrator');
      
      if (error) throw error;
      
      toast({
        title: 'Ingestion Triggered',
        description: `Processed ${data?.processed_sources || 0} sources successfully`,
      });
      
      // Refresh data after ingestion
      await Promise.all([fetchSources(), fetchHealthMetrics(), fetchQueueStatus()]);
      
    } catch (err) {
      console.error('Error triggering ingestion:', err);
      toast({
        title: 'Error',
        description: 'Failed to trigger data ingestion',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const processQueue = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('process-alert-queue');
      
      if (error) throw error;
      
      toast({
        title: 'Queue Processed',
        description: `Processed ${data?.processed_count || 0} queued alerts`,
      });
      
      await fetchQueueStatus();
      
    } catch (err) {
      console.error('Error processing queue:', err);
      toast({
        title: 'Error',
        description: 'Failed to process alert queue',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSourceStatus = async (sourceId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('alert_sources')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', sourceId);
      
      if (error) throw error;
      
      toast({
        title: isActive ? 'Source Activated' : 'Source Deactivated',
        description: 'Alert source status updated successfully',
      });
      
      await fetchSources();
      
    } catch (err) {
      console.error('Error updating source status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update source status',
        variant: 'destructive',
      });
    }
  };

  const getSourceHealth = (sourceId: string) => {
    return healthMetrics
      .filter(metric => metric.source_id === sourceId)
      .slice(0, 10); // Last 10 metrics
  };

  const getSourceUptime = (sourceId: string) => {
    const metrics = getSourceHealth(sourceId);
    if (!metrics.length) return 0;
    
    const successCount = metrics.filter(m => m.success).length;
    return (successCount / metrics.length) * 100;
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchSources(),
        fetchHealthMetrics(),
        fetchQueueStatus()
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    refreshData();
    
    // Set up realtime subscriptions
    const sourcesSubscription = supabase
      .channel('alert_sources_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alert_sources' }, fetchSources)
      .subscribe();
      
    const metricsSubscription = supabase
      .channel('health_metrics_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'source_health_metrics' }, fetchHealthMetrics)
      .subscribe();
    
    const queueSubscription = supabase
      .channel('queue_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alert_ingestion_queue' }, fetchQueueStatus)
      .subscribe();
    
    return () => {
      supabase.removeChannel(sourcesSubscription);
      supabase.removeChannel(metricsSubscription);
      supabase.removeChannel(queueSubscription);
    };
  }, []);

  return {
    sources,
    healthMetrics,
    queueStatus,
    loading,
    error,
    triggerIngestion,
    processQueue,
    toggleSourceStatus,
    getSourceHealth,
    getSourceUptime,
    refreshData
  };
};
