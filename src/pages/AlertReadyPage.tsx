
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AlertsList from '@/components/alert-ready/AlertsList';
import { useAlertReady } from '@/hooks/useAlertReady';

const AlertReadyPage = () => {
  const [activeView, setActiveView] = useState('all');
  const { alerts, loading, error, fetchAlerts, filterAlerts } = useAlertReady();
  
  const filteredAlerts = filterAlerts(activeView);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alert Ready</h1>
        <p className="text-muted-foreground">
          Canada's National Public Alerting System emergency notifications
        </p>
      </div>
      
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
    </div>
  );
};

export default AlertReadyPage;
