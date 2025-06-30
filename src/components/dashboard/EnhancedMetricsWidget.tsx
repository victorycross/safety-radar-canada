
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Globe, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { DashboardMetrics } from '@/types/dashboard';
import { AlertLevel } from '@/types';

interface EnhancedMetricsWidgetProps {
  metrics: DashboardMetrics;
  loading?: boolean;
}

const EnhancedMetricsWidget: React.FC<EnhancedMetricsWidgetProps> = ({
  metrics,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalLocations = metrics.totalProvinces + (metrics.totalHubs || 0);
  const totalAlerts = metrics.alertProvincesCount + (metrics.alertHubsCount || 0);
  const totalEmployees = metrics.employeesCount + (metrics.hubEmployeesCount || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Locations */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
            Total Locations
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3 text-blue-600" />
              <Globe className="h-3 w-3 text-green-600" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{totalLocations}</div>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{metrics.totalProvinces} Provinces</span>
              </span>
              <span className="flex items-center space-x-1">
                <Globe className="h-3 w-3" />
                <span>{metrics.totalHubs || 0} Hubs</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
            Active Alerts
            {totalAlerts > 0 ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-baseline space-x-2">
              <div className="text-2xl font-bold">{totalAlerts}</div>
              {totalAlerts === 0 && (
                <Badge variant="outline" className="text-green-700 border-green-200">
                  All Clear
                </Badge>
              )}
            </div>
            {totalAlerts > 0 && (
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>{metrics.alertProvincesCount} Provinces</span>
                <span>{metrics.alertHubsCount || 0} Hubs</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Total Employees */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
            Total Employees
            <Users className="h-4 w-4 text-blue-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{totalEmployees.toLocaleString()}</div>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <span>{metrics.employeesCount.toLocaleString()} Domestic</span>
              <span>{(metrics.hubEmployeesCount || 0).toLocaleString()} International</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
            Recent Incidents
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-2xl font-bold">{metrics.incidentsCount}</div>
            <div className="text-xs text-muted-foreground">
              Past 30 days
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedMetricsWidget;
