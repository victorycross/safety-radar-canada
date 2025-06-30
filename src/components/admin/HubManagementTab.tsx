
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, AlertTriangle, MapPin, Plus, Settings } from 'lucide-react';
import { useHubData } from '@/hooks/useHubData';
import { AlertLevel } from '@/types';
import { Link } from 'react-router-dom';

const HubManagementTab = () => {
  const { hubs, incidents, loading, metrics, refreshData } = useHubData();

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
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-muted-foreground">Loading hub management...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hub Management</h2>
          <p className="text-muted-foreground">Manage international financial hubs and their security status</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={refreshData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="default" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Hub
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Hubs Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>International Hubs</span>
            <Badge variant="outline">{hubs.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hubs.map((hub) => (
              <div key={hub.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{hub.flagEmoji}</span>
                  <div>
                    <h3 className="font-medium">{hub.name}</h3>
                    <p className="text-sm text-gray-600">{hub.country} • {hub.code}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-bold">{hub.employeeCount}</div>
                    <div className="text-xs text-gray-600">Employees</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold">{hub.localIncidents}</div>
                    <div className="text-xs text-gray-600">Incidents</div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${getAlertLevelColor(hub.alertLevel)} text-white`}
                  >
                    {getAlertLevelText(hub.alertLevel)}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Link to={`/hub/${hub.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hubs.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No International Hubs</h3>
              <p className="text-gray-600 mb-4">No international hubs are currently configured.</p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add First Hub
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Hub Incidents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Hub Incidents</span>
            <Badge variant="outline">{incidents.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {incidents.length > 0 ? (
            <div className="space-y-4">
              {incidents.slice(0, 5).map((incident) => {
                const hub = hubs.find(h => h.id === incident.hubId);
                return (
                  <div key={incident.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {hub?.flagEmoji} {hub?.name}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`${getAlertLevelColor(incident.alertLevel)} text-white text-xs`}
                          >
                            {getAlertLevelText(incident.alertLevel)}
                          </Badge>
                        </div>
                        <h3 className="font-medium text-gray-900">{incident.title}</h3>
                        {incident.description && (
                          <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Source: {incident.source}</span>
                          <span>Status: {incident.verificationStatus}</span>
                          <span>{new Date(incident.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Incidents</h3>
              <p className="text-gray-600">No hub incidents have been recorded.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HubManagementTab;
