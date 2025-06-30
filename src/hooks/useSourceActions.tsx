
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedSource } from './useSourceState';

interface UseSourceActionsProps {
  setSources: (sources: UnifiedSource[]) => void;
  setHealthMetrics: (metrics: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSourceActions = ({
  setSources,
  setHealthMetrics,
  setLoading,
  setError
}: UseSourceActionsProps) => {
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
      const typedSources = (data || []).map(source => ({
        ...source,
        health_status: (['healthy', 'degraded', 'error', 'unknown'].includes(source.health_status) 
          ? source.health_status 
          : 'unknown') as 'healthy' | 'degraded' | 'error' | 'unknown'
      }));
      setSources(typedSources);
    } catch (err) {
      console.error('Error fetching sources:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sources';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
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

  const triggerIngestion = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('master-ingestion-orchestrator');
      
      if (error) throw error;
      
      toast({
        title: 'Ingestion Started',
        description: `Processing ${data?.processed_sources || 0} sources`
      });
      
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

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([fetchSources(), fetchHealthMetrics()]);
    } catch (err) {
      console.error('Error refreshing data:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchSources,
    fetchHealthMetrics,
    addSource,
    updateSource,
    deleteSource,
    toggleSourceStatus,
    triggerIngestion,
    refreshData
  };
};
