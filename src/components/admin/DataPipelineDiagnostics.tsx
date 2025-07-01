import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ArrowRight,
  Zap,
  RefreshCw,
  Settings,
  PlayCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import PipelineTestButton from './PipelineTestButton';

interface PipelineStage {
  name: string;
  status: 'success' | 'warning' | 'error' | 'unknown';
  count: number;
  lastActivity: string | null;
  issues: string[];
}

const DataPipelineDiagnostics = () => {
  const { toast } = useToast();
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [processingQueue, setProcessingQueue] = useState(false);
  const [settingUpCron, setSettingUpCron] = useState(false);

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
            (queueStatus.pending || 0) > 100 ? [`${queueStatus.pending} items stuck in queue - needs processing`] :
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

  const testDataPipeline = async () => {
    setTesting(true);
    try {
      logger.info('Testing data pipeline...');
      const { data, error } = await supabase.functions.invoke('master-ingestion-orchestrator');
      
      if (error) throw error;
      
      toast({
        title: 'Pipeline Test Started',
        description: 'Monitoring data flow through the pipeline...',
      });

      setTimeout(() => {
        diagnoseDataPipeline();
      }, 5000);

    } catch (error) {
      logger.error('Error testing pipeline:', error);
      toast({
        title: 'Test Failed',
        description: 'Failed to test data pipeline. Check API configurations.',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const processAlertQueue = async () => {
    setProcessingQueue(true);
    try {
      logger.info('Processing alert queue...');
      const { data, error } = await supabase.functions.invoke('process-alert-queue');
      
      if (error) throw error;
      
      toast({
        title: 'Queue Processing Started',
        description: `Processing ${data?.total_items || 0} queued items...`,
      });

      setTimeout(() => {
        diagnoseDataPipeline();
      }, 3000);

    } catch (error) {
      logger.error('Error processing queue:', error);
      toast({
        title: 'Queue Processing Failed',
        description: 'Failed to process alert queue.',
        variant: 'destructive'
      });
    } finally {
      setProcessingQueue(false);
    }
  };

  const setupCronJobs = async () => {
    setSettingUpCron(true);
    try {
      logger.info('Setting up cron jobs...');
      const { data, error } = await supabase.functions.invoke('setup-cron-jobs');
      
      if (error) throw error;
      
      toast({
        title: 'Cron Jobs Setup',
        description: data?.success ? 'Cron jobs configured successfully' : 'Setup completed with warnings',
        variant: data?.success ? 'default' : 'destructive'
      });

    } catch (error) {
      logger.error('Error setting up cron jobs:', error);
      toast({
        title: 'Cron Setup Failed',
        description: 'Failed to set up automated processing.',
        variant: 'destructive'
      });
    } finally {
      setSettingUpCron(false);
    }
  };

  useEffect(() => {
    diagnoseDataPipeline();
  }, []);

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Database className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      warning: 'secondary', 
      error: 'destructive',
      unknown: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const hasErrors = pipeline.some(stage => stage.status === 'error');
  const hasWarnings = pipeline.some(stage => stage.status === 'warning');
  const queueStage = pipeline.find(stage => stage.name === 'Ingestion Queue');
  const hasStuckQueue = queueStage?.issues.some(issue => issue.includes('stuck'));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Data Pipeline Diagnostics</h2>
          <p className="text-muted-foreground">
            Analyze the flow of data from alert sources to storage
          </p>
        </div>
        <div className="space-x-2">
          <Button onClick={diagnoseDataPipeline} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Re-diagnose
          </Button>
          <Button onClick={testDataPipeline} disabled={testing}>
            <Zap className={`mr-2 h-4 w-4 ${testing ? 'animate-pulse' : ''}`} />
            Test Pipeline
          </Button>
        </div>
      </div>

      {/* Add Pipeline Test Component */}
      <div className="bg-card p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Quick Pipeline Test</h3>
        <PipelineTestButton />
      </div>

      {/* Add Pipeline Management Actions */}
      {(hasStuckQueue || hasErrors) && (
        <div className="bg-card p-4 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Pipeline Management</h3>
          <div className="space-x-2">
            {hasStuckQueue && (
              <Button onClick={processAlertQueue} disabled={processingQueue} variant="outline">
                <PlayCircle className={`mr-2 h-4 w-4 ${processingQueue ? 'animate-pulse' : ''}`} />
                Process Queue Now
              </Button>
            )}
            <Button onClick={setupCronJobs} disabled={settingUpCron} variant="outline">
              <Settings className={`mr-2 h-4 w-4 ${settingUpCron ? 'animate-pulse' : ''}`} />
              Setup Automation
            </Button>
          </div>
        </div>
      )}

      {/* Overall Status Alert */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical Issues Detected:</strong> The data pipeline has errors that prevent proper data flow.
            Common issues: Missing API keys (OpenWeatherMap), incorrect API endpoints, RSS parsing problems, or stuck queue items.
          </AlertDescription>
        </Alert>
      )}

      {!hasErrors && hasWarnings && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Performance Issues:</strong> Some pipeline stages have warnings that may impact data processing efficiency.
            This often indicates RSS feeds returning 0 items, API configuration issues, or pending queue items.
          </AlertDescription>
        </Alert>
      )}

      {!hasErrors && !hasWarnings && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Pipeline Healthy:</strong> All stages are functioning correctly and data is flowing as expected.
          </AlertDescription>
        </Alert>
      )}

      {/* Pipeline Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Flow</CardTitle>
          <CardDescription>
            Visual representation of data flow through each stage of the ingestion pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            {pipeline.map((stage, index) => (
              <div key={stage.name} className="flex flex-col lg:flex-row items-center">
                <div className="flex flex-col items-center space-y-2 min-w-[160px]">
                  <div className="flex items-center space-x-2">
                    {getStageIcon(stage.status)}
                    <span className="font-medium">{stage.name}</span>
                  </div>
                  
                  {getStatusBadge(stage.status)}
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold">{stage.count}</p>
                    <p className="text-xs text-muted-foreground">
                      {stage.lastActivity 
                        ? `Last: ${new Date(stage.lastActivity).toLocaleString()}`
                        : 'No activity'
                      }
                    </p>
                  </div>

                  {stage.issues.length > 0 && (
                    <div className="text-xs text-red-600 text-center">
                      {stage.issues.map((issue, idx) => (
                        <p key={idx}>{issue}</p>
                      ))}
                    </div>
                  )}
                </div>
                
                {index < pipeline.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-muted-foreground hidden lg:block mx-2" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stage Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pipeline.map((stage) => (
          <Card key={stage.name} className={`${
            stage.status === 'error' ? 'border-red-200' : 
            stage.status === 'warning' ? 'border-yellow-200' : 
            'border-green-200'
          }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{stage.name}</CardTitle>
                {getStageIcon(stage.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                {getStatusBadge(stage.status)}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Records (24h):</span>
                <span className="font-medium">{stage.count}</span>
              </div>

              {stage.lastActivity && (
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Last Activity:</span>
                  <p className="text-xs">{new Date(stage.lastActivity).toLocaleString()}</p>
                </div>
              )}

              {stage.issues.length > 0 && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-red-600">Issues:</span>
                  {stage.issues.map((issue, idx) => (
                    <p key={idx} className="text-xs text-red-600">{issue}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Help */}
      <Card>
        <CardHeader>
          <CardTitle>Common Configuration Issues</CardTitle>
          <CardDescription>
            Steps to resolve typical pipeline problems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Stuck Queue Items</h4>
            <p className="text-xs text-muted-foreground">
              • Use "Process Queue Now" button to manually clear stuck items
              • Set up automation with "Setup Automation" to prevent future backups
              • Check edge function logs for processing errors
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">OpenWeatherMap API (401 Unauthorized)</h4>
            <p className="text-xs text-muted-foreground">
              • Add your OpenWeatherMap API key to Supabase secrets as 'OPENWEATHERMAP_API_KEY'
              • Update the alert source configuration to include the API key
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Environment Canada (404 Not Found)</h4>
            <p className="text-xs text-muted-foreground">
              • Current endpoint may be incorrect. Try: https://api.weather.gc.ca/collections/alerts/items
              • Check if GeoMet API structure has changed
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">RSS Feeds Parsing 0 Items</h4>
            <p className="text-xs text-muted-foreground">
              • RSS feeds may have changed structure or be temporarily unavailable
              • Check RSS parser logic in master-ingestion-orchestrator
              • Verify RSS item extraction patterns
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPipelineDiagnostics;
