
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  Clock,
  Database
} from 'lucide-react';

interface SourceAnalyticsProps {
  sources: any[];
}

const SourceAnalytics = ({ sources }: SourceAnalyticsProps) => {
  // Calculate analytics
  const totalSources = sources.length;
  const healthySources = sources.filter(s => s.healthStatus === 'healthy').length;
  const degradedSources = sources.filter(s => s.healthStatus === 'degraded').length;
  const offlineSources = sources.filter(s => s.healthStatus === 'offline').length;
  const errorSources = sources.filter(s => s.healthStatus === 'error').length;
  
  const verifiedSources = sources.filter(s => s.verificationStatus === 'verified').length;
  const avgUptime = sources.reduce((acc, s) => acc + s.uptime, 0) / totalSources || 0;
  const avgReliability = sources.reduce((acc, s) => acc + s.reliabilityScore, 0) / totalSources || 0;
  const avgResponseTime = sources.reduce((acc, s) => acc + s.responseTime, 0) / totalSources || 0;
  const totalDataVolume = sources.reduce((acc, s) => acc + s.dataVolume, 0);

  const healthPercentage = totalSources > 0 ? (healthySources / totalSources) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSources}</div>
            <p className="text-xs text-muted-foreground">
              {verifiedSources} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Avg Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgUptime.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
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
              API response time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Health Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Health Status Breakdown</CardTitle>
            <CardDescription>Current status of all data sources</CardDescription>
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
                <span className="text-sm">Error/Offline</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{errorSources + offlineSources}</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  {totalSources > 0 ? (((errorSources + offlineSources) / totalSources) * 100).toFixed(0) : 0}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Metrics</CardTitle>
            <CardDescription>Average performance across all sources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Reliability Score</span>
                <span className="font-medium">{avgReliability.toFixed(1)}/100</span>
              </div>
              <Progress value={avgReliability} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>System Uptime</span>
                <span className="font-medium">{avgUptime.toFixed(1)}%</span>
              </div>
              <Progress value={avgUptime} className="h-2" />
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span>Total Data Volume (24h)</span>
                <span className="font-medium">{totalDataVolume.toLocaleString()} records</span>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span>Average Response Time</span>
              <span className="font-medium">{avgResponseTime.toFixed(0)}ms</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SourceAnalytics;
