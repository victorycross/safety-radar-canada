
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useSourceManagement } from '@/hooks/useSourceManagement';

const SourceOverviewTab = () => {
  const { sources, healthMetrics, loading } = useSourceManagement();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading source overview...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalSources = sources.length;
  const activeSources = sources.filter(s => s.is_active).length;
  const healthySources = sources.filter(s => s.health_status === 'healthy').length;
  const errorSources = sources.filter(s => s.health_status === 'error').length;
  const degradedSources = sources.filter(s => s.health_status === 'degraded').length;
  
  const healthPercentage = totalSources > 0 ? (healthySources / totalSources) * 100 : 0;
  const activePercentage = totalSources > 0 ? (activeSources / totalSources) * 100 : 0;

  // Recent activity from health metrics
  const recentMetrics = healthMetrics.slice(0, 10);
  const avgResponseTime = recentMetrics.length > 0 
    ? recentMetrics.reduce((acc, m) => acc + (m.response_time_ms || 0), 0) / recentMetrics.length 
    : 0;

  const sourcesByType = sources.reduce((acc, source) => {
    acc[source.source_type] = (acc[source.source_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSources}</div>
            <p className="text-xs text-muted-foreground">
              {activeSources} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthPercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {healthySources} healthy sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Sources currently active
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
      </div>

      {/* Health Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Health Status</CardTitle>
            <CardDescription>Current status of all sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Healthy</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{healthySources}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {totalSources > 0 ? ((healthySources / totalSources) * 100).toFixed(0) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm">Degraded</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{degradedSources}</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {totalSources > 0 ? ((degradedSources / totalSources) * 100).toFixed(0) : 0}%
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm">Error</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{errorSources}</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {totalSources > 0 ? ((errorSources / totalSources) * 100).toFixed(0) : 0}%
                </Badge>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Health</span>
                <span>{healthPercentage.toFixed(1)}%</span>
              </div>
              <Progress value={healthPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Source Types</CardTitle>
            <CardDescription>Distribution by source type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(sourcesByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{count}</span>
                  <Badge variant="outline">
                    {totalSources > 0 ? ((count / totalSources) * 100).toFixed(0) : 0}%
                  </Badge>
                </div>
              </div>
            ))}
            {Object.keys(sourcesByType).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No sources configured yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SourceOverviewTab;
