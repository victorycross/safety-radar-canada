
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Bell, ArrowRight, Globe, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusWidget from './StatusWidget';
import { AlertLevel } from '@/types';
import { Province, InternationalHub } from '@/types/dashboard';

interface CriticalAlertsHeroProps {
  alertProvinces: Province[];
  visibleAlertProvinces: Province[];
  alertHubs: InternationalHub[];
  loading: boolean;
  onViewLocationAlerts?: (type: 'province' | 'hub', locationId: string, locationName: string) => void;
}

const CriticalAlertsHero: React.FC<CriticalAlertsHeroProps> = ({
  alertProvinces,
  visibleAlertProvinces,
  alertHubs,
  loading,
  onViewLocationAlerts
}) => {
  
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const totalAlerts = alertProvinces.length + alertHubs.length;
  const provinceSevereCount = alertProvinces.filter(p => p.alertLevel === AlertLevel.SEVERE).length;
  const provinceWarningCount = alertProvinces.filter(p => p.alertLevel === AlertLevel.WARNING).length;
  const hubSevereCount = alertHubs.filter(h => h.alertLevel === AlertLevel.SEVERE).length;
  const hubWarningCount = alertHubs.filter(h => h.alertLevel === AlertLevel.WARNING).length;

  const handleViewAlerts = (provinceId: string, provinceName: string) => {
    if (onViewLocationAlerts) {
      onViewLocationAlerts('province', provinceId, provinceName);
    }
  };

  const handleHubClick = (hubId: string, hubName: string) => {
    if (onViewLocationAlerts) {
      onViewLocationAlerts('hub', hubId, hubName);
    }
  };

  if (totalAlerts === 0) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-900">All Systems Normal</h2>
              <p className="text-sm text-green-700">No active security alerts across all provinces and international hubs</p>
            </div>
          </div>
          <Badge variant="outline" className="text-green-700 border-green-300">
            Status: Clear
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert Summary Banner */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border border-red-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-900">Active Security Alerts</h2>
              <div className="text-sm text-red-700 space-y-1">
                <div className="flex items-center space-x-4">
                  {alertProvinces.length > 0 && (
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{alertProvinces.length} {alertProvinces.length === 1 ? 'province' : 'provinces'}</span>
                    </span>
                  )}
                  {alertHubs.length > 0 && (
                    <span className="flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span>{alertHubs.length} international {alertHubs.length === 1 ? 'hub' : 'hubs'}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4">
                  {(provinceSevereCount + hubSevereCount) > 0 && (
                    <span className="font-medium">• {provinceSevereCount + hubSevereCount} severe</span>
                  )}
                  {(provinceWarningCount + hubWarningCount) > 0 && (
                    <span className="font-medium">• {provinceWarningCount + hubWarningCount} warning</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/alert-ready">
              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                <Bell className="h-4 w-4" />
                <span>Alert Feed</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Alert Details */}
      <div className="space-y-6">
        {/* Province Alerts */}
        {visibleAlertProvinces.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">Canadian Provinces</h3>
              <Badge variant="outline" className="text-xs">{visibleAlertProvinces.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleAlertProvinces.map((province) => (
                <StatusWidget 
                  key={province.id} 
                  provinceId={province.id} 
                  onViewAlerts={handleViewAlerts}
                />
              ))}
            </div>
          </div>
        )}

        {/* Hub Alerts */}
        {alertHubs.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Globe className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-900">International Hubs</h3>
              <Badge variant="outline" className="text-xs">{alertHubs.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {alertHubs.map((hub) => (
                <Card 
                  key={hub.id} 
                  className={`cursor-pointer transition-all hover:shadow-md border-l-4 ${
                    hub.alertLevel === AlertLevel.SEVERE ? 'border-l-red-500' : 
                    hub.alertLevel === AlertLevel.WARNING ? 'border-l-yellow-500' : 'border-l-green-500'
                  }`}
                  onClick={() => handleHubClick(hub.id, hub.name)}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{hub.flagEmoji}</span>
                        <div>
                          <div className="font-medium text-sm">{hub.name}</div>
                          <div className="text-xs text-muted-foreground">{hub.country}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge
                          variant={hub.alertLevel === AlertLevel.SEVERE ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {hub.alertLevel === AlertLevel.SEVERE ? 'Severe' : 'Warning'}
                        </Badge>
                      </div>
                    </div>
                    {hub.localIncidents > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {hub.localIncidents} incident{hub.localIncidents !== 1 ? 's' : ''}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No visible alerts message */}
        {visibleAlertProvinces.length === 0 && alertHubs.length === 0 && totalAlerts > 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="text-center text-gray-500">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">
                  All locations with alerts are currently hidden. 
                  Use Settings to show them.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CriticalAlertsHero;
