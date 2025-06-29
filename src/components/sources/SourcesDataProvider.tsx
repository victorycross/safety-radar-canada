
import React, { useState, useEffect } from 'react';
import { useDataIngestion } from '@/hooks/useDataIngestion';
import { EnhancedSource } from '@/components/sources/EnhancedSourceCard';

interface SourcesDataProviderProps {
  children: (data: {
    sources: EnhancedSource[];
    loading: boolean;
    error: string | null;
    refreshData: () => void;
  }) => React.ReactNode;
  autoRefresh: boolean;
  refreshInterval: number;
}

const SourcesDataProvider: React.FC<SourcesDataProviderProps> = ({
  children,
  autoRefresh,
  refreshInterval
}) => {
  const { 
    sources: dbSources, 
    healthMetrics, 
    loading, 
    error, 
    refreshData,
    getSourceHealth,
    getSourceUptime
  } = useDataIngestion();

  const [sources, setSources] = useState<EnhancedSource[]>([]);

  useEffect(() => {
    if (dbSources) {
      const enhancedSources: EnhancedSource[] = dbSources.map(source => {
        const healthMetrics = getSourceHealth(source.id);
        const latestHealth = healthMetrics.length > 0 ? healthMetrics[0] : null;
        const uptime = getSourceUptime(source.id);
        
        return {
          id: source.id,
          name: source.name,
          description: source.description || 'No description available',
          type: source.source_type,
          verificationStatus: 'verified' as const,
          lastUpdate: source.last_poll_at ? new Date(source.last_poll_at).toLocaleString() : 'Never',
          healthStatus: source.health_status as 'healthy' | 'degraded' | 'offline' | 'error',
          uptime: uptime,
          dataVolume: latestHealth?.records_processed || 0,
          responseTime: latestHealth?.response_time_ms || 0,
          errorRate: latestHealth?.success === false ? 100 : 0,
          reliabilityScore: latestHealth?.success === false ? 0 : uptime
        };
      });
      setSources(enhancedSources);
    }
  }, [dbSources, healthMetrics, getSourceHealth, getSourceUptime]);

  // Auto-refresh logic
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing sources data...');
      refreshData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshData]);

  return <>{children({ sources, loading, error, refreshData })}</>;
};

export default SourcesDataProvider;
