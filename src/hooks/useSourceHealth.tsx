
import { SourceHealthMetric } from '@/types/dataIngestion';

export const useSourceHealth = (healthMetrics: SourceHealthMetric[]) => {
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

  return {
    getSourceHealth,
    getSourceUptime
  };
};
