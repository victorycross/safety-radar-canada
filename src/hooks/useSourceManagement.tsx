
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface UnifiedSource {
  id: string;
  name: string;
  description: string;
  source_type: string;
  api_endpoint: string;
  is_active: boolean;
  health_status: 'healthy' | 'degraded' | 'error' | 'unknown';
  polling_interval: number;
  last_poll_at: string | null;
  configuration: any;
  created_at: string;
  updated_at: string;
}

export interface SourceHealthMetric {
  id: string;
  source_id: string;
  timestamp: string;
  success: boolean;
  response_time_ms: number;
  records_processed: number;
  error_message: string | null;
}

export const useSourceManagement = () => {
  const [sources, setSources] = useState<UnifiedSource[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<SourceHealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSources = async () => {
    try {
      console.log('Fetching all sources...');
      const { data, error } = await supabase
        .from('alert_sources')
        .select('*')
        .order('name');

      if (error) throw error;

      console.log('Fetched sources:', data);
      setSources(data || []);
    } catch (err) {
      console.error('Error fetching sources:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch sources');
      toast({
        title: 'Error',
        description: 'Failed to fetch sources',
        variant: 'destructive'
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

  const addSource = async (sourceData: Partial<UnifiedSource>) => {
    try {
      const { data, error } = await supabase
        .from('alert_sources')
        .insert([{
          name: sourceData.name,
          description: sourceData.description,
          source_type: sourceData.source_type,
          api_endpoint: sourceData.api_endpoint,
          is_active: sourceData.is_active ?? true,
          polling_interval: sourceData.polling_interval ?? 300,
          configuration: sourceData.configuration ?? {}
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Source Added',
        description: `${sourceData.name} has been added successfully`
      });

      await fetchSources();
      return data;
    } catch (err) {
      console.error('Error adding source:', err);
      toast({
        title: 'Error',
        description: 'Failed to add source',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const updateSource = async (id: string, updates: Partial<UnifiedSource>) => {
    try {
      const { error } = await supabase
        .from('alert_sources')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Source Updated',
        description: 'Source has been updated successfully'
      });

      await fetchSources();
    } catch (err) {
      console.error('Error updating source:', err);
      toast({
        title: 'Error',
        description: 'Failed to update source',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const deleteSource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alert_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Source Deleted',
        description: 'Source has been deleted successfully'
      });

      await fetchSources();
    } catch (err) {
      console.error('Error deleting source:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete source',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const toggleSourceStatus = async (id: string, isActive: boolean) => {
    await updateSource(id, { is_active: isActive });
  };

  const testSource = async (source: UnifiedSource) => {
    try {
      console.log('Testing source connection:', source.name);
      
      // Simulate connection test
      const startTime = Date.now();
      const response = await fetch(source.api_endpoint, {
        method: 'HEAD',
        timeout: 10000
      });
      const responseTime = Date.now() - startTime;

      const success = response.ok;
      
      // Record health metric
      await supabase
        .from('source_health_metrics')
        .insert([{
          source_id: source.id,
          success,
          response_time_ms: responseTime,
          records_processed: 0,
          error_message: success ? null : `HTTP ${response.status}: ${response.statusText}`
        }]);

      await fetchHealthMetrics();

      toast({
        title: success ? 'Connection Successful' : 'Connection Failed',
        description: `Response time: ${responseTime}ms`,
        variant: success ? 'default' : 'destructive'
      });

      return { success, responseTime };
    } catch (err) {
      console.error('Error testing source:', err);
      
      // Record failed health metric
      await supabase
        .from('source_health_metrics')
        .insert([{
          source_id: source.id,
          success: false,
          response_time_ms: 0,
          records_processed: 0,
          error_message: err instanceof Error ? err.message : 'Connection failed'
        }]);

      await fetchHealthMetrics();

      toast({
        title: 'Connection Test Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });

      return { success: false, responseTime: 0 };
    }
  };

  const triggerIngestion = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('master-ingestion-orchestrator');
      
      if (error) throw error;
      
      toast({
        title: 'Ingestion Started',
        description: `Processing ${data?.processed_sources || 0} sources`
      });
      
      // Refresh data after ingestion
      setTimeout(() => {
        fetchSources();
        fetchHealthMetrics();
      }, 2000);
      
    } catch (err) {
      console.error('Error triggering ingestion:', err);
      toast({
        title: 'Error',
        description: 'Failed to trigger ingestion',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getSourceHealth = (sourceId: string) => {
    return healthMetrics.filter(metric => metric.source_id === sourceId);
  };

  const getSourceUptime = (sourceId: string): number => {
    const metrics = getSourceHealth(sourceId);
    if (metrics.length === 0) return 0;
    
    const successCount = metrics.filter(m => m.success).length;
    return Math.round((successCount / metrics.length) * 100);
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([fetchSources(), fetchHealthMetrics()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    sources,
    healthMetrics,
    loading,
    error,
    addSource,
    updateSource,
    deleteSource,
    toggleSourceStatus,
    testSource,
    triggerIngestion,
    getSourceHealth,
    getSourceUptime,
    refreshData
  };
};
