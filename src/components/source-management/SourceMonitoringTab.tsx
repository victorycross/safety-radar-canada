
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  RefreshCw 
} from 'lucide-react';
import { useSourceManagement } from '@/hooks/useSourceManagement';

const SourceMonitoringTab = () => {
  const { sources, healthMetrics, loading, triggerIngestion } = useSourceManagement();

  // Calculate real-time metrics
  const recentMetrics = healthMetrics.slice(0, 20);
  const successRate = recentMetrics.length > 0 
    ? (recentMetrics.filter(m => m.success).length / recentMetrics.length) * 100 
    : 0;

  const avgResponseTime = recentMetrics.length > 0
    ? recentMetrics.reduce((acc, m) => acc + (m.response_time_ms || 0), 0) / recentMetrics.length
    : 0;

  const totalRecordsProcessed = recentMetrics.reduce((acc, m) => acc + (m.records_processed || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Real-time Monitoring</h3>
          <p className="text-muted-foreground">Live performance metrics and diagnostics</p>
        </div>
        <Button onClick={triggerIngestion} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Last 20 operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">
              Recent average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Processed</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecordsProcessed}</div>
            <p className="text-xs text-muted-foreground">
              Recent operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sources.filter(s => s.is_active).length}</div>
            <p className="text-xs text-muted-foreground">
              Currently polling
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Source Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Source Performance</CardTitle>
          <CardDescription>Individual source health and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sources.map((source) => {
              const sourceMetrics = healthMetrics.filter(m => m.source_id === source.id).slice(0, 5);
              const sourceSuccessRate = sourceMetrics.length > 0
                ? (sourceMetrics.filter(m => m.success).length / sourceMetrics.length) * 100
                : 0;
              
              return (
                <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{source.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {source.source_type}
                      </Badge>
                      {source.health_status === 'healthy' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Last poll: {source.last_poll_at ? new Date(source.last_poll_at).toLocaleString() : 'Never'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">{sourceSuccessRate.toFixed(0)}%</div>
                      <div className="text-xs text-muted-foreground">Success Rate</div>
                    </div>
                    
                    <div className="w-24">
                      <Progress value={sourceSuccessRate} className="h-2" />
                    </div>
                  </div>
                </div>
              );
            })}
            
            {sources.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No sources configured yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SourceMonitoringTab;
