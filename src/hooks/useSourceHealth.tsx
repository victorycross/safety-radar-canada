
import { SourceHealthMetric } from './useSourceState';

export const useSourceHealth = (healthMetrics: SourceHealthMetric[]) => {
  const getSourceHealth = (sourceId: string) => {
    return healthMetrics.filter(metric => metric.source_id === sourceId);
  };

  const getSourceUptime = (sourceId: string): number => {
    const metrics = getSourceHealth(sourceId);
    if (metrics.length === 0) return 0;
    
    const successCount = metrics.filter(m => m.success).length;
    return Math.round((successCount / metrics.length) * 100);
  };

  return {
    getSourceHealth,
    getSourceUptime
  };
};
