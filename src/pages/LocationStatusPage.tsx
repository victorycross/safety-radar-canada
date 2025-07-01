
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useSecurity } from '@/context/SecurityContext';
import { useHubData } from '@/hooks/useHubData';
import EmployeeDistributionChart from '@/components/dashboard/EmployeeDistributionChart';
import { AlertLevel } from '@/types';
import { Users, Globe, MapPin, AlertTriangle } from 'lucide-react';

const LocationStatusPage = () => {
  const { provinces } = useSecurity();
  const { hubs } = useHubData();
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate metrics
  const totalEmployees = provinces.reduce((acc, province) => acc + province.employeeCount, 0);
  const employeesAtRisk = provinces
    .filter(province => province.alertLevel === AlertLevel.SEVERE || province.alertLevel === AlertLevel.WARNING)
    .reduce((acc, province) => acc + province.employeeCount, 0);
  
  const hubsAtRisk = hubs.filter(hub => 
    hub.alertLevel === AlertLevel.SEVERE || hub.alertLevel === AlertLevel.WARNING
  ).length;

  const getAlertBadge = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
      case AlertLevel.SEVERE:
        return <Badge variant="destructive">Severe</Badge>;
      case AlertLevel.WARNING:
        return <Badge className="bg-yellow-500">Warning</Badge>;
      default:
        return <Badge className="bg-green-500">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Location Status</h1>
        <p className="text-muted-foreground">
          Real-time risk assessment for personnel locations across Canada and international operations
        </p>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Personnel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personnel at Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{employeesAtRisk.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((employeesAtRisk / totalEmployees) * 100).toFixed(1)}% of workforce
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">International Hubs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hubs.length}</div>
            <p className="text-xs text-muted-foreground">Active locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hubs at Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{hubsAtRisk}</div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Location Information */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="provinces">Canadian Provinces</TabsTrigger>
          <TabsTrigger value="international">International Hubs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <EmployeeDistributionChart />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Highest Risk Provinces</CardTitle>
                <CardDescription>Locations requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {provinces
                    .filter(p => p.alertLevel !== AlertLevel.NORMAL && p.employeeCount > 0)
                    .sort((a, b) => b.employeeCount - a.employeeCount)
                    .slice(0, 5)
                    .map(province => (
                      <div key={province.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{province.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {province.employeeCount.toLocaleString()} personnel
                          </div>
                        </div>
                        {getAlertBadge(province.alertLevel)}
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>International Hub Status</CardTitle>
                <CardDescription>Global operations overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hubs
                    .sort((a, b) => {
                      const alertOrder = { [AlertLevel.SEVERE]: 3, [AlertLevel.WARNING]: 2, [AlertLevel.NORMAL]: 1 };
                      return alertOrder[b.alertLevel] - alertOrder[a.alertLevel];
                    })
                    .slice(0, 5)
                    .map(hub => (
                      <div key={hub.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{hub.name}</div>
                          <div className="text-sm text-muted-foreground">{hub.country}</div>
                        </div>
                        {getAlertBadge(hub.alertLevel)}
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="provinces" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Canadian Province Status</CardTitle>
              <CardDescription>Detailed breakdown by province</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs uppercase bg-muted/50">
                    <tr>
                      <th scope="col" className="px-6 py-3">Province</th>
                      <th scope="col" className="px-6 py-3">Personnel</th>
                      <th scope="col" className="px-6 py-3">Percentage</th>
                      <th scope="col" className="px-6 py-3">Risk Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {provinces
                      .filter(p => p.employeeCount > 0)
                      .sort((a, b) => b.employeeCount - a.employeeCount)
                      .map(province => (
                        <tr key={province.id} className="border-b">
                          <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap">
                            {province.name}
                          </th>
                          <td className="px-6 py-4">{province.employeeCount.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            {((province.employeeCount / totalEmployees) * 100).toFixed(1)}%
                          </td>
                          <td className="px-6 py-4">
                            {getAlertBadge(province.alertLevel)}
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="international" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hubs.map(hub => (
              <Card key={hub.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{hub.name}</CardTitle>
                      <CardDescription>{hub.country}</CardDescription>
                    </div>
                    {getAlertBadge(hub.alertLevel)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className={hub.isActive ? 'text-green-600' : 'text-red-600'}>
                        {hub.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span>{hub.updated_at ? new Date(hub.updated_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LocationStatusPage;
