
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, AlertTriangle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHubData } from '@/hooks/useHubData';
import { AlertLevel } from '@/types';
import { logger } from '@/utils/logger';

const HubsPage = () => {
  const { hubs, loading, metrics, refreshData } = useHubData();

  logger.debug('HubsPage: Rendering', { hubsCount: hubs.length });

  const getAlertLevelColor = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.SEVERE:
        return 'bg-red-500';
      case AlertLevel.WARNING:
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const getAlertLevelText = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.SEVERE:
        return 'High Risk';
      case AlertLevel.WARNING:
        return 'Caution';
      default:
        return 'Safe';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading international hubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">International Hubs</h1>
              <p className="text-gray-600 mt-1">Monitor security status for global financial centers</p>
            </div>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Hubs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">{metrics.totalHubs}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Alert Hubs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-2xl font-bold">{metrics.alertHubsCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{metrics.hubEmployeesCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold">{metrics.totalIncidents}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hubs.map((hub) => (
            <Link key={hub.id} to={`/hub/${hub.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{hub.flagEmoji}</span>
                      <div>
                        <CardTitle className="text-lg">{hub.name}</CardTitle>
                        <p className="text-sm text-gray-600">{hub.country}</p>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${getAlertLevelColor(hub.alertLevel)} text-white`}
                    >
                      {getAlertLevelText(hub.alertLevel)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{hub.employeeCount}</div>
                      <div className="text-xs text-gray-600">Employees</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{hub.travelWarnings}</div>
                      <div className="text-xs text-gray-600">Warnings</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{hub.localIncidents}</div>
                      <div className="text-xs text-gray-600">Incidents</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Code: {hub.code}</span>
                      <span>{hub.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {hubs.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No International Hubs</h3>
            <p className="text-gray-600">No international hubs are currently configured.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HubsPage;
