
import { useEffect } from 'react';
import { useSourceState } from './useSourceState';
import { useSourceActions } from './useSourceActions';
import { useSourceHealth } from './useSourceHealth';
import { useSourceTesting } from './useSourceTesting';

export const useSourceManagement = () => {
  const {
    sources,
    setSources,
    healthMetrics,
    setHealthMetrics,
    loading,
    setLoading,
    error,
    setError
  } = useSourceState();

  const {
    fetchSources,
    fetchHealthMetrics,
    addSource,
    updateSource,
    deleteSource,
    toggleSourceStatus,
    triggerIngestion,
    refreshData
  } = useSourceActions({
    setSources,
    setHealthMetrics,
    setLoading,
    setError
  });

  const { getSourceHealth, getSourceUptime } = useSourceHealth(healthMetrics);
  
  const { testSource } = useSourceTesting({ fetchHealthMetrics });

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

// Export types for backward compatibility
export type { UnifiedSource, SourceHealthMetric } from './useSourceState';
