
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MapPin, Clock, TrendingUp } from 'lucide-react';
import { UniversalAlert } from '@/types/alerts';

interface CriticalAlertsSummaryProps {
  alerts: UniversalAlert[];
  loading: boolean;
}

const CriticalAlertsSummary: React.FC<CriticalAlertsSummaryProps> = ({ alerts, loading }) => {
  if (loading) {
    return (
      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Filter for critical alerts (Extreme and Severe)
  const criticalAlerts = alerts.filter(alert => 
    alert.severity === 'Extreme' || alert.severity === 'Severe'
  );

  // Get immediate urgency alerts
  const immediateAlerts = alerts.filter(alert => alert.urgency === 'Immediate');

  // Get unique affected areas
  const affectedAreas = [...new Set(alerts.map(alert => alert.area))].filter(Boolean);

  // Get most recent alert
  const mostRecentAlert = alerts.length > 0 
    ? alerts.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime())[0]
    : null;

  // Calculate severity distribution
  const severityCount = {
    extreme: alerts.filter(a => a.severity === 'Extreme').length,
    severe: alerts.filter(a => a.severity === 'Severe').length,
    moderate: alerts.filter(a => a.severity === 'Moderate').length,
    minor: alerts.filter(a => a.severity === 'Minor').length
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Extreme': return 'bg-red-600 text-white';
      case 'Severe': return 'bg-red-500 text-white';
      case 'Moderate': return 'bg-orange-500 text-white';
      case 'Minor': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const alertDate = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - alertDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="mb-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-green-900">All Clear</CardTitle>
                <CardDescription className="text-green-700">
                  No active alerts from external sources
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-6 space-y-4">
      {/* Main Alert Summary */}
      <Card className={`border-l-4 ${criticalAlerts.length > 0 ? 'border-l-red-500 bg-red-50' : 'border-l-orange-500 bg-orange-50'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                criticalAlerts.length > 0 ? 'bg-red-100' : 'bg-orange-100'
              }`}>
                <AlertTriangle className={`h-5 w-5 ${
                  criticalAlerts.length > 0 ? 'text-red-600' : 'text-orange-600'
                }`} />
              </div>
              <div>
                <CardTitle className={criticalAlerts.length > 0 ? 'text-red-900' : 'text-orange-900'}>
                  {alerts.length} Active Alert{alerts.length !== 1 ? 's' : ''} from External Sources
                </CardTitle>
                <CardDescription className={criticalAlerts.length > 0 ? 'text-red-700' : 'text-orange-700'}>
                  {criticalAlerts.length > 0 
                    ? `${criticalAlerts.length} critical alert${criticalAlerts.length !== 1 ? 's' : ''} requiring immediate attention`
                    : 'Monitoring active alerts from government and emergency services'
                  }
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {mostRecentAlert && (
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Latest: {formatTimeAgo(mostRecentAlert.published)}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Severity Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Severity Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(severityCount).map(([severity, count]) => (
              count > 0 && (
                <div key={severity} className="flex items-center justify-between">
                  <Badge 
                    className={`text-xs ${getSeverityColor(severity.charAt(0).toUpperCase() + severity.slice(1))}`}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Badge>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              )
            ))}
          </CardContent>
        </Card>

        {/* Immediate Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Immediate Action</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold">{immediateAlerts.length}</span>
              <span className="text-sm text-muted-foreground">alert{immediateAlerts.length !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requiring immediate response
            </p>
          </CardContent>
        </Card>

        {/* Affected Areas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Affected Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="text-2xl font-bold">{affectedAreas.length}</span>
              <span className="text-sm text-muted-foreground">location{affectedAreas.length !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {affectedAreas.slice(0, 2).join(', ')}
              {affectedAreas.length > 2 && ` +${affectedAreas.length - 2} more`}
            </p>
          </CardContent>
        </Card>

        {/* Alert Sources */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alert Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {[...new Set(alerts.map(a => a.source))].slice(0, 3).map((source, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground truncate">{source}</span>
                  <span className="text-xs font-medium">
                    {alerts.filter(a => a.source === source).length}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Critical Alert Preview */}
      {criticalAlerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-red-900 text-sm">Most Critical Alert</CardTitle>
              <Badge className={getSeverityColor(criticalAlerts[0].severity)}>
                {criticalAlerts[0].severity}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <h4 className="font-medium text-red-900 mb-1">{criticalAlerts[0].title}</h4>
            <p className="text-sm text-red-700 mb-2">{criticalAlerts[0].description}</p>
            <div className="flex items-center justify-between text-xs text-red-600">
              <span>{criticalAlerts[0].area}</span>
              <span>{formatTimeAgo(criticalAlerts[0].published)}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CriticalAlertsSummary;
