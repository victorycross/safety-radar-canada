
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, Shield, Users, MapPin } from 'lucide-react';
import { AlertLevel } from '@/types';

interface ExecutiveSummaryProps {
  totalIncidents: number;
  affectedProvinces: number;
  latestIncident: string;
  incidentsByAlertLevel: Array<{ name: string; value: number; color: string }>;
  provinces: Array<{ alertLevel: AlertLevel }>;
}

const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  totalIncidents,
  affectedProvinces,
  latestIncident,
  incidentsByAlertLevel,
  provinces
}) => {
  const severeCount = incidentsByAlertLevel.find(item => item.name === 'Severe')?.value || 0;
  const warningCount = incidentsByAlertLevel.find(item => item.name === 'Warning')?.value || 0;
  const normalCount = incidentsByAlertLevel.find(item => item.name === 'Normal')?.value || 0;

  const riskScore = totalIncidents > 0 ? Math.min(100, (severeCount * 50 + warningCount * 20 + normalCount * 5)) : 0;
  const overallStatus = riskScore > 70 ? 'high' : riskScore > 30 ? 'medium' : 'low';

  const provinceStats = {
    severe: provinces.filter(p => p.alertLevel === AlertLevel.SEVERE).length,
    warning: provinces.filter(p => p.alertLevel === AlertLevel.WARNING).length,
    normal: provinces.filter(p => p.alertLevel === AlertLevel.NORMAL).length
  };

  return (
    <div className="space-y-6">
      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Security Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold">{riskScore}/100</p>
              <p className="text-sm text-muted-foreground">Risk Score</p>
            </div>
            <Badge 
              variant={overallStatus === 'high' ? 'destructive' : overallStatus === 'medium' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {overallStatus} Risk
            </Badge>
          </div>
          <Progress value={riskScore} className="h-2" />
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="font-medium text-red-600">{severeCount}</p>
              <p className="text-muted-foreground">Severe</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-orange-600">{warningCount}</p>
              <p className="text-muted-foreground">Warning</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-green-600">{normalCount}</p>
              <p className="text-muted-foreground">Normal</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{totalIncidents}</span>
              <div className="flex items-center text-green-600">
                {totalIncidents > 50 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-xs ml-1">
                  {totalIncidents > 50 ? '+12%' : '-8%'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-red-600">{severeCount}</span>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Affected Provinces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{affectedProvinces}</span>
              <MapPin className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">4.2m</span>
              <div className="flex items-center text-green-600">
                <TrendingDown className="h-4 w-4" />
                <span className="text-xs ml-1">-15%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Provincial Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Provincial Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{provinceStats.severe}</p>
              <p className="text-sm text-red-700">Provinces at Severe Alert</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{provinceStats.warning}</p>
              <p className="text-sm text-orange-700">Provinces at Warning</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{provinceStats.normal}</p>
              <p className="text-sm text-green-700">Provinces Normal</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Latest Critical Incident */}
      {latestIncident && (
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center text-red-700">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Latest Critical Incident
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{latestIncident}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Immediate attention required - escalated to security operations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExecutiveSummary;
