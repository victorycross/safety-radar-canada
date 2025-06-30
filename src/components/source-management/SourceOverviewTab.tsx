
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { UnifiedSource, SourceHealthMetric } from '@/hooks/useSourceState';

interface SourceOverviewTabProps {
  sources: UnifiedSource[];
  healthMetrics: SourceHealthMetric[];
  loading: boolean;
  error: string | null;
}

const SourceOverviewTab: React.FC<SourceOverviewTabProps> = ({ 
  sources, 
  healthMetrics, 
  loading 
}) => {
  const activeSources = sources.filter(s => s.is_active);
  const healthySources = sources.filter(s => s.health_status === 'healthy');
  const errorSources = sources.filter(s => s.health_status === 'error');
  
  const recentMetrics = healthMetrics
    .filter(m => Date.now() - new Date(m.timestamp).getTime() < 24 * 60 * 60 * 1000)
    .length;

  const stats = [
    {
      title: 'Total Sources',
      value: sources.length,
      icon: Database,
      description: 'Configured data sources'
    },
    {
      title: 'Active Sources',
      value: activeSources.length,
      icon: Activity,
      description: 'Currently polling for data'
    },
    {
      title: 'Healthy Sources',
      value: healthySources.length,
      icon: CheckCircle,
      description: 'Sources with no issues'
    },
    {
      title: 'Sources with Errors',
      value: errorSources.length,
      icon: AlertTriangle,
      description: 'Sources requiring attention'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Health checks and data ingestion in the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {recentMetrics} health checks performed in the last 24 hours
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Source Types Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Source Types</CardTitle>
          <CardDescription>
            Breakdown of configured source types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(sources.map(s => s.source_type))).map(type => {
              const count = sources.filter(s => s.source_type === type).length;
              return (
                <Badge key={type} variant="outline" className="capitalize">
                  {type} ({count})
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SourceOverviewTab;
