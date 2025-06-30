
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, AlertTriangle, MapPin, Globe, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHubData } from '@/hooks/useHubData';
import { AlertLevel } from '@/types';
import { logger } from '@/utils/logger';

const HubDetailPage = () => {
  const { hubId } = useParams<{ hubId: string }>();
  const { hubs, incidents, loading, getHub, getHubIncidents, refreshData } = useHubData();

  logger.debug('HubDetailPage: Rendering', { hubId });

  if (!hubId) {
    return <Navigate to="/hubs" replace />;
  }

  const hub = getHub(hubId);
  const hubIncidents = getHubIncidents(hubId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading hub details...</p>
        </div>
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hub Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested hub could not be found.</p>
          <Link to="/hubs">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hubs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/hubs">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Hubs
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{hub.flagEmoji}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{hub.name}</h1>
                  <p className="text-sm text-gray-600">{hub.country} • {hub.code}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant="secondary"
                className={`${getAlertLevelColor(hub.alertLevel)} text-white`}
              >
                {getAlertLevelText(hub.alertLevel)}
              </Badge>
              <Button onClick={refreshData} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">{hub.employeeCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Travel Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold">{hub.travelWarnings}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Local Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <span className="text-2xl font-bold">{hub.localIncidents}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Globe className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">
                  {hub.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Incidents</span>
              <Badge variant="outline">{hubIncidents.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hubIncidents.length > 0 ? (
              <div className="space-y-4">
                {hubIncidents.slice(0, 5).map((incident) => (
                  <div key={incident.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{incident.title}</h3>
                        {incident.description && (
                          <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>Source: {incident.source}</span>
                          <span>Status: {incident.verificationStatus}</span>
                          <span>Confidence: {Math.round(incident.confidenceScore * 100)}%</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <Badge
                          variant="secondary"
                          className={`${getAlertLevelColor(incident.alertLevel)} text-white`}
                        >
                          {getAlertLevelText(incident.alertLevel)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(incident.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Incidents</h3>
                <p className="text-gray-600">This hub has no recorded incidents.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hub Information */}
        <Card>
          <CardHeader>
            <CardTitle>Hub Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Location Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Country:</span>
                    <span>{hub.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hub Code:</span>
                    <span>{hub.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span>{hub.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span>
                      {hub.created_at ? new Date(hub.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span>
                      {hub.updated_at ? new Date(hub.updated_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HubDetailPage;
