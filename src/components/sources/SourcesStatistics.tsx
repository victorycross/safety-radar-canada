
import { EnhancedSource } from '@/components/sources/EnhancedSourceCard';

export interface SourcesStats {
  total: number;
  healthy: number;
  verified: number;
  avgUptime: number;
}

export const useSourcesStatistics = (sources: EnhancedSource[]): SourcesStats => {
  const total = sources.length;
  const healthy = sources.filter(s => s.healthStatus === 'healthy').length;
  const verified = sources.filter(s => s.verificationStatus === 'verified').length;
  const avgUptime = sources.reduce((acc, s) => acc + s.uptime, 0) / total || 0;
  
  return { total, healthy, verified, avgUptime };
};
