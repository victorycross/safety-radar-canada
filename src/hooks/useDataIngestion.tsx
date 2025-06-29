
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDataIngestionState } from './useDataIngestionState';
import { useDataIngestionActions } from './useDataIngestionActions';
import { useSourceHealth } from './useSourceHealth';

export const useDataIngestion = () => {
  const {
    sources,
    setSources,
    healthMetrics,
    setHealthMetrics,
    queueStatus,
    setQueueStatus,
    loading,
    setLoading,
    error,
    setError
  } = useDataIngestionState();

  const {
    fetchSources,
    fetchMetrics,
    fetchQueue,
    triggerIngestion,
    processQueue,
    toggleSourceStatus,
    refreshData
  } = useDataIngestionActions({
    setSources,
    setHealthMetrics,
    setQueueStatus,
    setLoading,
    setError
  });

  const { getSourceHealth, getSourceUptime } = useSourceHealth(healthMetrics);

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
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'source_health_metrics' }, fetchMetrics)
      .subscribe();
    
    const queueSubscription = supabase
      .channel('queue_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alert_ingestion_queue' }, fetchQueue)
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

// Export types for backward compatibility
export type { AlertSource, SourceHealthMetric, QueueItem } from '@/types/dataIngestion';
