import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExecutiveSummary from '@/components/analytics/ExecutiveSummary';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { AnalyticsChartData } from '@/types/analytics';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Shield, AlertTriangle, Users, MapPin, FileText } from 'lucide-react';

const ExecutiveReportsPage = () => {
  // Mock data for executive reporting
  const mockChartData: AnalyticsChartData = {
    incidentsByAlertLevel: [
      { name: 'Normal', value: 45, fill: '#22c55e', color: '#22c55e' },
      { name: 'Warning', value: 12, fill: '#f59e0b', color: '#f59e0b' },
      { name: 'Severe', value: 3, fill: '#ef4444', color: '#ef4444' }
    ],
    incidentsBySource: [
      { name: 'Weather Alerts', value: 25, fill: '#3b82f6', color: '#3b82f6' },
      { name: 'Security Feeds', value: 20, fill: '#8b5cf6', color: '#8b5cf6' },
      { name: 'Manual Reports', value: 15, fill: '#06b6d4', color: '#06b6d4' }
    ],
    provincesByAlertLevel: [
      { name: 'Normal', value: 10, fill: '#22c55e', color: '#22c55e' },
      { name: 'Warning', value: 2, fill: '#f59e0b', color: '#f59e0b' },
      { name: 'Severe', value: 1, fill: '#ef4444', color: '#ef4444' }
    ],
    trendsOverTime: []
  };

  const executiveKPIs = [
    { title: 'Security Posture', value: '87%', trend: '+2%', icon: Shield, color: 'text-green-600' },
    { title: 'Active Incidents', value: '3', trend: '-1', icon: AlertTriangle, color: 'text-orange-600' },
    { title: 'Coverage', value: '13/13', trend: '100%', icon: MapPin, color: 'text-blue-600' },
    { title: 'Personnel at Risk', value: '24', trend: '-5', icon: Users, color: 'text-red-600' },
  ];

  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'power_user']}
      fallbackMessage="Access to Executive Reports requires Administrator or Power User privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Executive Reports</h1>
          <p className="text-muted-foreground">
            Strategic reporting and key performance indicators for organizational leadership
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Executive Overview</TabsTrigger>
            <TabsTrigger value="security">Security Posture</TabsTrigger>
            <TabsTrigger value="operations">Operations Summary</TabsTrigger>
            <TabsTrigger value="compliance">Compliance & Audit</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {executiveKPIs.map((kpi, index) => {
                const Icon = kpi.icon;
                return (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                      <Icon className={`h-4 w-4 ${kpi.color}`} />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{kpi.value}</div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {kpi.trend} from last period
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <ExecutiveSummary 
              totalIncidents={60}
              affectedProvinces={13}
              latestIncident="Security alert in Ontario"
              incidentsByAlertLevel={mockChartData.incidentsByAlertLevel}
              provinces={[]}
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  National Security Posture
                </CardTitle>
                <CardDescription>
                  Comprehensive security assessment across all Canadian operations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">87%</div>
                    <div className="text-sm text-green-600">Overall Security Score</div>
                    <Badge variant="outline" className="mt-2 text-green-700 border-green-300">Strong</Badge>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-700">3</div>
                    <div className="text-sm text-yellow-600">Active Threats</div>
                    <Badge variant="outline" className="mt-2 text-yellow-700 border-yellow-300">Monitored</Badge>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">98%</div>
                    <div className="text-sm text-blue-600">System Uptime</div>
                    <Badge variant="outline" className="mt-2 text-blue-700 border-blue-300">Excellent</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Operations Summary</CardTitle>
                <CardDescription>
                  Key operational metrics and performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4" />
                  <p>Operational reports and metrics dashboard will be available in a future update.</p>
                  <p className="text-sm mt-2">Features in development: Incident response times, resource allocation, and operational efficiency metrics.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance & Audit Reports</CardTitle>
                <CardDescription>
                  Regulatory compliance status and audit findings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4" />
                  <p>Compliance reporting and audit trails will be available in a future update.</p>
                  <p className="text-sm mt-2">Features in development: PIPEDA compliance tracking, security audit reports, and regulatory compliance dashboards.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleProtectedRoute>
  );
};

export default ExecutiveReportsPage;