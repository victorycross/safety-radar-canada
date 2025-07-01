
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedSource } from './useSourceState';

interface UseSourceIngestionProps {
  fetchSources: () => Promise<void>;
  fetchHealthMetrics: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useSourceIngestion = ({
  fetchSources,
  fetchHealthMetrics,
  setLoading
}: UseSourceIngestionProps) => {
  const { toast } = useToast();

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

  const toggleSourceStatus = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('alert_sources')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

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
        variant: 'destructive'
      });
    }
  };

  return {
    triggerIngestion,
    toggleSourceStatus
  };
};
