
import { useState } from 'react';

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

export const useSourceState = () => {
  const [sources, setSources] = useState<UnifiedSource[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<SourceHealthMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return {
    sources,
    setSources,
    healthMetrics,
    setHealthMetrics,
    loading,
    setLoading,
    error,
    setError
  };
};
