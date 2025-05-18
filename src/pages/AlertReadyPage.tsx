
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Loader2, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AlertsList from '@/components/alert-ready/AlertsList';
import BCAlertslist from '@/components/alert-ready/BCAlertslist';
import { useAlertReady } from '@/hooks/useAlertReady';
import { useBCAlerts } from '@/hooks/useBCAlerts';

const AlertReadyPage = () => {
  const [activeView, setActiveView] = useState('all');
  const { alerts, loading, error, fetchAlerts, filterAlerts } = useAlertReady();
  const { 
    alerts: bcAlerts, 
    loading: bcLoading, 
    error: bcError, 
    fetchAlerts: fetchBCAlerts 
  } = useBCAlerts();
  
  const filteredAlerts = filterAlerts(activeView);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alert Ready</h1>
        <p className="text-muted-foreground">
          Emergency notifications for Canada and British Columbia
        </p>
      </div>
      
      <Tabs defaultValue="national">
        <TabsList className="mb-4">
          <TabsTrigger value="national">
            <Bell className="h-4 w-4 mr-2" />
            National Alerts
          </TabsTrigger>
          <TabsTrigger value="bc">
            <Map className="h-4 w-4 mr-2" />
            BC Alerts
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="national">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2 h-5 w-5 text-warning" />
                    Emergency Alert Feed
                  </CardTitle>
                  <CardDescription>
                    Official alerts from the National Public Alerting System
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchAlerts}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <></>}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="mb-4" onValueChange={setActiveView}>
                <TabsList>
                  <TabsTrigger value="all">All Alerts</TabsTrigger>
                  <TabsTrigger value="severe">Severe & Extreme</TabsTrigger>
                  <TabsTrigger value="immediate">Immediate Action</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <AlertsList 
                alerts={filteredAlerts} 
                loading={loading} 
                error={error} 
                fetchAlerts={fetchAlerts}
                activeView={activeView}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bc">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Map className="mr-2 h-5 w-5 text-primary" />
                    British Columbia Alerts
                  </CardTitle>
                  <CardDescription>
                    Emergency alerts specific to British Columbia
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchBCAlerts}
                  disabled={bcLoading}
                >
                  {bcLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <></>}
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <BCAlertslist 
                alerts={bcAlerts}
                loading={bcLoading}
                error={bcError}
                fetchAlerts={fetchBCAlerts}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertReadyPage;
