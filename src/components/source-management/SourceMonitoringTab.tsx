
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Server
} from 'lucide-react';
import { UnifiedSource, SourceHealthMetric } from '@/hooks/useSourceState';

interface SourceMonitoringTabProps {
  sources: UnifiedSource[];
  healthMetrics: SourceHealthMetric[];
  getSourceHealth: (sourceId: string) => any;
  getSourceUptime: (sourceId: string) => number;
  loading: boolean;
}

const SourceMonitoringTab: React.FC<SourceMonitoringTabProps> = ({ 
  sources, 
  healthMetrics, 
  getSourceHealth, 
  getSourceUptime, 
  loading 
}) => {
  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Server className="h-4 w-4 text-gray-600" />;
    }
  };

  const getHealthBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Source Monitoring</h3>
        <p className="text-muted-foreground">
          Real-time health status and performance metrics
        </p>
      </div>

      {/* Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Health Overview
          </CardTitle>
          <CardDescription>
            Current status of all monitored sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['healthy', 'degraded', 'error'].map(status => {
              const count = sources.filter(s => s.health_status === status).length;
              return (
                <div key={status} className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    {getHealthIcon(status)}
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{status}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Source Details */}
      <div className="grid gap-4">
        {sources.map((source) => {
          const uptime = getSourceUptime(source.id);
          const recentMetrics = healthMetrics
            .filter(m => m.source_id === source.id)
            .slice(0, 5);

          return (
            <Card key={source.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getHealthIcon(source.health_status)}
                      {source.name}
                    </CardTitle>
                    <CardDescription>{source.source_type}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getHealthBadgeVariant(source.health_status)} className="capitalize">
                      {source.health_status}
                    </Badge>
                    {source.is_active && (
                      <Badge variant="outline">Active</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Uptime</div>
                    <div className="font-semibold">{uptime.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Last Poll</div>
                    <div className="font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {source.last_poll_at 
                        ? new Date(source.last_poll_at).toLocaleTimeString()
                        : 'Never'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Interval</div>
                    <div className="font-semibold">{source.polling_interval}s</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Recent Checks</div>
                    <div className="font-semibold">{recentMetrics.length}</div>
                  </div>
                </div>

                {recentMetrics.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Recent Performance
                    </div>
                    <div className="space-y-2">
                      {recentMetrics.map((metric) => (
                        <div key={metric.id} className="flex items-center justify-between text-xs">
                          <span>{new Date(metric.timestamp).toLocaleString()}</span>
                          <div className="flex items-center gap-2">
                            <span>{metric.response_time_ms || 0}ms</span>
                            <Badge 
                              variant={metric.success ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {metric.success ? 'Success' : 'Failed'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sources.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No sources to monitor yet. Add sources to see their health status.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SourceMonitoringTab;
