import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';
import { useDataIngestion } from '@/hooks/useDataIngestion';

const DataIngestionDashboard: React.FC = () => {
  const {
    sources,
    healthMetrics,
    queueStatus,
    loading,
    triggerIngestion,
    processQueue,
    toggleSourceStatus,
    getSourceHealth,
    getSourceUptime,
    refreshData
  } = useDataIngestion();

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const activeSourcesCount = sources.filter(s => s.is_active).length;
  const healthySourcesCount = sources.filter(s => s.health_status === 'healthy').length;
  const overallHealthPercent = sources.length > 0 ? (healthySourcesCount / sources.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Enhanced Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Data Ingestion Control Panel
            </span>
            <div className="flex space-x-2">
              <Button
                onClick={async () => {
                  // First trigger ingestion
                  await triggerIngestion();
                  // Then process the queue
                  setTimeout(() => processQueue(), 2000);
                }}
                disabled={loading}
                size="sm"
              >
                <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Full Cycle Test
              </Button>
              <Button
                onClick={triggerIngestion}
                disabled={loading}
                size="sm"
              >
                <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Trigger Ingestion
              </Button>
              <Button
                onClick={processQueue}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <Zap className="mr-1 h-4 w-4" />
                Process Queue
              </Button>
              <Button
                onClick={refreshData}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{activeSourcesCount}</p>
              <p className="text-sm text-blue-700">Active Sources</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{healthySourcesCount}</p>
              <p className="text-sm text-green-700">Healthy Sources</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{queueStatus.pending || 0}</p>
              <p className="text-sm text-orange-700">Pending Alerts</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{Math.round(overallHealthPercent)}%</p>
              <p className="text-sm text-purple-700">Overall Health</p>
            </div>
          </div>
          {/* Add testing instructions */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Testing Instructions:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Use "Full Cycle Test" to trigger ingestion and process queue automatically</li>
              <li>2. Monitor the queue status and source health metrics below</li>
              <li>3. Check individual sources for detailed health information</li>
              <li>4. Use the Feed Testing Dashboard above for granular testing</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Queue Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Processing Queue Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Queue Progress</span>
              <span className="text-sm text-muted-foreground">
                {queueStatus.completed || 0} / {queueStatus.total || 0} processed
              </span>
            </div>
            <Progress 
              value={queueStatus.total > 0 ? ((queueStatus.completed || 0) / queueStatus.total) * 100 : 0} 
              className="h-2" 
            />
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium text-yellow-600">{queueStatus.pending || 0}</p>
                <p className="text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-blue-600">{queueStatus.processing || 0}</p>
                <p className="text-muted-foreground">Processing</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-green-600">{queueStatus.completed || 0}</p>
                <p className="text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-red-600">{queueStatus.failed || 0}</p>
                <p className="text-muted-foreground">Failed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Data Sources ({sources.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sources.map((source) => {
              const uptime = getSourceUptime(source.id);
              const recentMetrics = getSourceHealth(source.id);
              const lastMetric = recentMetrics[0];
              
              return (
                <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center ${getHealthStatusColor(source.health_status)}`}>
                      {getHealthStatusIcon(source.health_status)}
                    </div>
                    <div>
                      <h4 className="font-medium">{source.name}</h4>
                      <p className="text-sm text-muted-foreground">{source.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {source.source_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Poll: {source.polling_interval}s
                        </span>
                        {lastMetric && (
                          <span className="text-xs text-muted-foreground">
                            Last: {lastMetric.response_time_ms}ms
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{uptime.toFixed(1)}% uptime</span>
                      <Button
                        size="sm"
                        variant={source.is_active ? "destructive" : "default"}
                        onClick={() => toggleSourceStatus(source.id, !source.is_active)}
                      >
                        {source.is_active ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                    <Progress value={uptime} className="h-1 w-24" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataIngestionDashboard;
