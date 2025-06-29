
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Bell, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusWidget from './StatusWidget';
import { AlertLevel } from '@/types';

interface CriticalAlertsHeroProps {
  alertProvinces: any[];
  visibleAlertProvinces: any[];
  loading: boolean;
}

const CriticalAlertsHero: React.FC<CriticalAlertsHeroProps> = ({
  alertProvinces,
  visibleAlertProvinces,
  loading
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

  if (alertProvinces.length === 0) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-green-900">All Systems Normal</h2>
              <p className="text-sm text-green-700">No active security alerts across all provinces</p>
            </div>
          </div>
          <Badge variant="outline" className="text-green-700 border-green-300">
            Status: Clear
          </Badge>
        </div>
      </div>
    );
  }

  const severeCount = alertProvinces.filter(p => p.alertLevel === AlertLevel.SEVERE).length;
  const warningCount = alertProvinces.filter(p => p.alertLevel === AlertLevel.WARNING).length;

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
              <p className="text-sm text-red-700">
                {alertProvinces.length} {alertProvinces.length === 1 ? 'province requires' : 'provinces require'} attention
                {severeCount > 0 && (
                  <span className="ml-2 font-medium">• {severeCount} severe</span>
                )}
                {warningCount > 0 && (
                  <span className="ml-2 font-medium">• {warningCount} warning</span>
                )}
              </p>
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
      {visibleAlertProvinces.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleAlertProvinces.map((province) => (
            <StatusWidget key={province.id} provinceId={province.id} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">
                All provinces with alerts are currently hidden. 
                Use Settings to show them.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CriticalAlertsHero;
