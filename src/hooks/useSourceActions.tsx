
import { UnifiedSource } from './useSourceState';
import { useSourceOperations } from './useSourceOperations';
import { useSourceIngestion } from './useSourceIngestion';
import { useSourceHealthMetrics } from './useSourceHealthMetrics';

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
  const {
    fetchSources,
    addSource,
    updateSource,
    deleteSource
  } = useSourceOperations({ setSources, setLoading, setError });

  const { fetchHealthMetrics } = useSourceHealthMetrics({ setHealthMetrics });

  const {
    triggerIngestion,
    toggleSourceStatus
  } = useSourceIngestion({ fetchSources, fetchHealthMetrics, setLoading });

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
