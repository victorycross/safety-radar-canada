import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, ArrowRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Province, InternationalHub } from '@/types/dashboard';
import { AlertLevel } from '@/types';

interface AlertsSummaryCardProps {
  alertProvinces: Province[];
  alertHubs: InternationalHub[];
  loading: boolean;
}

const AlertsSummaryCard: React.FC<AlertsSummaryCardProps> = ({
  alertProvinces,
  alertHubs,
  loading
}) => {
  const totalAlerts = alertProvinces.length + alertHubs.length;
  const severeCriticalCount = alertProvinces.filter(p => p.alertLevel === AlertLevel.SEVERE).length + 
                              alertHubs.filter(h => h.alertLevel === AlertLevel.SEVERE).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`transition-all hover:shadow-md ${
      totalAlerts > 0 ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-green-500'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {totalAlerts > 0 ? (
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            <CardTitle className="text-lg">
              Public Safety Status
            </CardTitle>
          </div>
          <Link to="/public-safety-alerts">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              View Details
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {totalAlerts === 0 ? (
          <div>
            <p className="text-green-700 font-medium mb-1">All Systems Normal</p>
            <p className="text-sm text-muted-foreground">
              No active weather or public safety alerts
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="text-orange-800 font-medium mb-2">Active Alerts Detected</p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {alertProvinces.length > 0 && (
                  <span>{alertProvinces.length} {alertProvinces.length === 1 ? 'province' : 'provinces'}</span>
                )}
                {alertHubs.length > 0 && (
                  <span>{alertHubs.length} international {alertHubs.length === 1 ? 'hub' : 'hubs'}</span>
                )}
              </div>
            </div>
            
            {severeCriticalCount > 0 && (
              <div className="flex items-center space-x-2">
                <Badge variant="destructive" className="text-xs">
                  {severeCriticalCount} Severe
                </Badge>
                <span className="text-xs text-muted-foreground">
                  High priority alerts requiring immediate attention
                </span>
              </div>
            )}
            
            <Link to="/public-safety-alerts">
              <Button variant="outline" size="sm" className="w-full mt-3">
                <Shield className="h-4 w-4 mr-2" />
                View All Public Safety Alerts
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsSummaryCard;