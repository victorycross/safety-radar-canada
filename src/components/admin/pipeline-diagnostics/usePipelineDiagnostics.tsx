
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface PipelineStage {
  name: string;
  status: 'success' | 'warning' | 'error' | 'unknown';
  count: number;
  lastActivity: string | null;
  issues: string[];
}

export const usePipelineDiagnostics = () => {
  const { toast } = useToast();
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);

  const diagnoseDataPipeline = async () => {
    try {
      setLoading(true);
      logger.info('Starting data pipeline diagnosis...');
      
      // Stage 1: Alert Sources Configuration
      const { data: sources, error: sourcesError } = await supabase
        .from('alert_sources')
        .select('*');
      
      // Stage 2: Health Metrics (Polling)
      const { data: metrics, error: metricsError } = await supabase
        .from('source_health_metrics')
        .select('*')
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Stage 3: Ingestion Queue
      const { data: queue, error: queueError } = await supabase
        .from('alert_ingestion_queue')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Stage 4: Security Alerts Storage
      const { data: securityAlerts, error: securityError } = await supabase
        .from('security_alerts_ingest')
        .select('id, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Stage 5: Weather Alerts Storage
      const { data: weatherAlerts, error: weatherError } = await supabase
        .from('weather_alerts_ingest')
        .select('id, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Calculate queue status breakdown
      const queueStatus = queue?.reduce((acc, item) => {
        acc[item.processing_status] = (acc[item.processing_status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const pipelineStages: PipelineStage[] = [
        {
          name: 'Alert Sources',
          status: sourcesError ? 'error' : (sources?.length || 0) > 0 ? 'success' : 'warning',
          count: sources?.length || 0,
          lastActivity: sources?.length ? sources[0].updated_at : null,
          issues: sourcesError ? [sourcesError.message] : []
        },
        {
          name: 'Health Polling',
          status: metricsError ? 'error' : (metrics?.length || 0) > 0 ? 'success' : 'warning',
          count: metrics?.length || 0,
          lastActivity: metrics?.length ? metrics[0].timestamp : null,
          issues: metricsError ? [metricsError.message] : (metrics?.length || 0) === 0 ? ['No polling activity in last 24h'] : []
        },
        {
          name: 'Ingestion Queue',
          status: queueError ? 'error' : 
            (queueStatus.pending || 0) > 100 ? 'error' : 
            (queueStatus.pending || 0) > 0 ? 'warning' : 'success',
          count: queue?.length || 0,
          lastActivity: queue?.length ? queue[0].created_at : null,
          issues: queueError ? [queueError.message] : 
            (queueStatus.pending || 0) > 100 ? [`${queueStatus.pending} items stuck in queue - use Command Center to process`] :
            (queueStatus.pending || 0) > 0 ? [`${queueStatus.pending} pending items`] : []
        },
        {
          name: 'Security Storage',
          status: securityError ? 'error' : (securityAlerts?.length || 0) > 0 ? 'success' : 'warning',
          count: securityAlerts?.length || 0,
          lastActivity: securityAlerts?.length ? securityAlerts[0].created_at : null,
          issues: securityError ? [securityError.message] : (securityAlerts?.length || 0) === 0 ? ['No recent security alerts - may indicate RSS parsing issues'] : []
        },
        {
          name: 'Weather Storage',
          status: weatherError ? 'error' : (weatherAlerts?.length || 0) > 0 ? 'success' : 'warning',
          count: weatherAlerts?.length || 0,
          lastActivity: weatherAlerts?.length ? weatherAlerts[0].created_at : null,
          issues: weatherError ? [weatherError.message] : (weatherAlerts?.length || 0) === 0 ? ['No recent weather alerts - may indicate API configuration issues'] : []
        }
      ];

      setPipeline(pipelineStages);
      logger.info('Pipeline diagnosis completed successfully');
    } catch (error) {
      logger.error('Error diagnosing pipeline:', error);
      toast({
        title: 'Error',
        description: 'Failed to diagnose data pipeline',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    diagnoseDataPipeline();
  }, []);

  return {
    pipeline,
    loading,
    diagnoseDataPipeline
  };
};
