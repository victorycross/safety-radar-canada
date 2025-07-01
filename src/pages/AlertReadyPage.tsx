
import React from 'react';
import AlertsList from '@/components/alert-ready/AlertsList';
import BCAlertslist from '@/components/alert-ready/BCAlertslist';
import EverbridgeAlertsList from '@/components/alert-ready/EverbridgeAlertsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAllAlertSources } from '@/hooks/useAllAlertSources';
import { useBCAlerts } from '@/hooks/useBCAlerts';
import { useEverbridgeAlerts } from '@/hooks/useEverbridgeAlerts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const AlertReadyPage = () => {
  const { alerts: allAlerts, loading: allLoading, error: allError, fetchAlerts: fetchAllAlerts } = useAllAlertSources();
  const { alerts: bcAlerts, loading: bcLoading, error: bcError, fetchAlerts: fetchBCAlerts } = useBCAlerts();
  const { alerts: everbridgeAlerts, loading: everbridgeLoading, error: everbridgeError, fetchAlerts: fetchEverbridgeAlerts } = useEverbridgeAlerts();

  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold">Alert Ready Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Monitor and manage all active alerts across different sources
      </p>

      <Tabs defaultValue="all-alerts" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-alerts">All Alerts</TabsTrigger>
          <TabsTrigger value="bc-alerts">BC Alerts</TabsTrigger>
          <TabsTrigger value="everbridge">Everbridge</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-alerts" className="space-y-4">
          <AlertsList 
            alerts={allAlerts}
            loading={allLoading}
            error={allError}
            fetchAlerts={fetchAllAlerts}
            activeView="all"
          />
        </TabsContent>
        
        <TabsContent value="bc-alerts" className="space-y-4">
          <BCAlertslist 
            alerts={bcAlerts}
            loading={bcLoading}
            error={bcError}
            fetchAlerts={fetchBCAlerts}
          />
        </TabsContent>
        
        <TabsContent value="everbridge" className="space-y-4">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Everbridge Integration
              </CardTitle>
              <CardDescription>
                Everbridge alerts will appear here once the integration is configured with real API credentials.
              </CardDescription>
            </CardHeader>
          </Card>
          <EverbridgeAlertsList 
            alerts={everbridgeAlerts}
            loading={everbridgeLoading}
            error={everbridgeError}
            fetchAlerts={fetchEverbridgeAlerts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertReadyPage;
