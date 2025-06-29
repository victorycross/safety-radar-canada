
import { useState } from 'react';
import { AlertSource, SourceHealthMetric, QueueStatus } from '@/types/dataIngestion';

export const useDataIngestionState = () => {
  const [sources, setSources] = useState<AlertSource[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<SourceHealthMetric[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueStatus>({
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return {
    sources,
    setSources,
    healthMetrics,
    setHealthMetrics,
    queueStatus,
    setQueueStatus,
    loading,
    setLoading,
    error,
    setError
  };
};
