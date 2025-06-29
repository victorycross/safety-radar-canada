
import { useToast } from '@/hooks/use-toast';
import {
  fetchAlertSources,
  fetchHealthMetrics,
  fetchQueueStatus,
  triggerMasterIngestion,
  processAlertQueue,
  updateSourceStatus
} from '@/services/dataIngestionService';
import { AlertSource, SourceHealthMetric, QueueStatus } from '@/types/dataIngestion';

interface UseDataIngestionActionsProps {
  setSources: (sources: AlertSource[]) => void;
  setHealthMetrics: (metrics: SourceHealthMetric[]) => void;
  setQueueStatus: (status: QueueStatus) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDataIngestionActions = ({
  setSources,
  setHealthMetrics,
  setQueueStatus,
  setLoading,
  setError
}: UseDataIngestionActionsProps) => {
  const { toast } = useToast();

  const fetchSources = async () => {
    try {
      const sources = await fetchAlertSources();
      setSources(sources);
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

  const fetchMetrics = async () => {
    try {
      const metrics = await fetchHealthMetrics();
      setHealthMetrics(metrics);
    } catch (err) {
      console.error('Error fetching health metrics:', err);
    }
  };

  const fetchQueue = async () => {
    try {
      const status = await fetchQueueStatus();
      setQueueStatus(status);
    } catch (err) {
      console.error('Error fetching queue status:', err);
    }
  };

  const triggerIngestion = async () => {
    try {
      setLoading(true);
      
      const data = await triggerMasterIngestion();
      
      toast({
        title: 'Ingestion Triggered',
        description: `Processed ${data?.processed_sources || 0} sources successfully`,
      });
      
      // Refresh data after ingestion
      await Promise.all([fetchSources(), fetchMetrics(), fetchQueue()]);
      
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
      
      const data = await processAlertQueue();
      
      toast({
        title: 'Queue Processed',
        description: `Processed ${data?.processed_count || 0} queued alerts`,
      });
      
      await fetchQueue();
      
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
      await updateSourceStatus(sourceId, isActive);
      
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

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchSources(),
        fetchMetrics(),
        fetchQueue()
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    fetchSources,
    fetchMetrics,
    fetchQueue,
    triggerIngestion,
    processQueue,
    toggleSourceStatus,
    refreshData
  };
};
