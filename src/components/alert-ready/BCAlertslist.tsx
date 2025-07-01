
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, AlertTriangle, Filter, MapPin } from 'lucide-react';
import { UniversalAlert } from '@/types/alerts';
import UniversalAlertCard from '@/components/alerts/UniversalAlertCard';

interface BCAlertslistProps {
  alerts: UniversalAlert[];
  loading: boolean;
  error: string | null;
  fetchAlerts: () => void;
  onAlertClick?: (alert: UniversalAlert) => void;
}

const BCAlertslist: React.FC<BCAlertslistProps> = ({
  alerts,
  loading,
  error,
  fetchAlerts,
  onAlertClick
}) => {
  const [viewFilter, setViewFilter] = useState('all');

  const filteredAlerts = React.useMemo(() => {
    if (viewFilter === 'severe') {
      return alerts.filter(alert => 
        alert.severity === 'Extreme' || alert.severity === 'Severe'
      );
    }
    
    if (viewFilter === 'immediate') {
      return alerts.filter(alert => alert.urgency === 'Immediate');
    }
    
    return alerts;
  }, [alerts, viewFilter]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Loading BC Emergency Alerts...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Error Loading BC Alerts
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchAlerts} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                BC Emergency Alerts
              </CardTitle>
              <CardDescription>
                {filteredAlerts.length} BC alert{filteredAlerts.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={viewFilter} onValueChange={setViewFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="severe">Severe Only</SelectItem>
                  <SelectItem value="immediate">Immediate Only</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchAlerts} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alerts List */}
      {filteredAlerts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No BC Alerts Found</h3>
              <p className="text-gray-600 mb-4">
                {viewFilter === 'all' 
                  ? 'No BC Emergency alerts are currently available.'
                  : `No BC alerts match the current filter: ${viewFilter}`
                }
              </p>
              <Button onClick={fetchAlerts} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh BC Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert, index) => (
            <div 
              key={alert.id || index} 
              className={onAlertClick ? 'cursor-pointer' : ''}
              onClick={() => onAlertClick?.(alert)}
            >
              <UniversalAlertCard alert={alert} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BCAlertslist;
