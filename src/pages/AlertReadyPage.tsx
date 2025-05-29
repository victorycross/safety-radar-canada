
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';
import { useAlertReady } from '@/hooks/useAlertReady';
import { useBCAlerts } from '@/hooks/useBCAlerts';
import { useEverbridgeAlerts } from '@/hooks/useEverbridgeAlerts';
import AlertsList from '@/components/alert-ready/AlertsList';
import BCAlertslist from '@/components/alert-ready/BCAlertslist';
import EverbridgeAlertsList from '@/components/alert-ready/EverbridgeAlertsList';

const AlertReadyPage = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [activeSource, setActiveSource] = useState<string>('national');
  
  const {
    alerts: nationalAlerts,
    loading: nationalLoading,
    error: nationalError,
    fetchAlerts: fetchNationalAlerts,
    filterAlerts
  } = useAlertReady();
  
  const {
    alerts: bcAlerts,
    loading: bcLoading,
    error: bcError,
    fetchAlerts: fetchBCAlerts
  } = useBCAlerts();
  
  const {
    alerts: everbridgeAlerts,
    loading: everbridgeLoading,
    error: everbridgeError,
    fetchAlerts: fetchEverbridgeAlerts
  } = useEverbridgeAlerts();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };
  
  const handleSourceChange = (value: string) => {
    setActiveSource(value);
  };

  const filteredNationalAlerts = filterAlerts(activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <AlertTriangle className="mr-2 text-warning" />
          Emergency Alerts
        </h1>
        <p className="text-muted-foreground">
          Current emergency alerts from various sources across Canada
        </p>
      </div>
      
      <Tabs defaultValue="national" value={activeSource} onValueChange={handleSourceChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="national">National Alert Ready</TabsTrigger>
          <TabsTrigger value="bc">BC Specific Alerts</TabsTrigger>
          <TabsTrigger value="everbridge">Everbridge Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="national">
          <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="all">All Alerts</TabsTrigger>
              <TabsTrigger value="severe">Severe Only</TabsTrigger>
              <TabsTrigger value="immediate">Immediate Action</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <AlertsList 
                alerts={filteredNationalAlerts}
                loading={nationalLoading}
                error={nationalError}
                fetchAlerts={fetchNationalAlerts}
                activeView={activeTab}
              />
            </TabsContent>
            
            <TabsContent value="severe" className="mt-6">
              <AlertsList 
                alerts={filteredNationalAlerts}
                loading={nationalLoading}
                error={nationalError}
                fetchAlerts={fetchNationalAlerts}
                activeView={activeTab}
              />
            </TabsContent>
            
            <TabsContent value="immediate" className="mt-6">
              <AlertsList 
                alerts={filteredNationalAlerts}
                loading={nationalLoading}
                error={nationalError}
                fetchAlerts={fetchNationalAlerts}
                activeView={activeTab}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>
        
        <TabsContent value="bc">
          <BCAlertslist 
            alerts={bcAlerts}
            loading={bcLoading}
            error={bcError}
            fetchAlerts={fetchBCAlerts}
          />
        </TabsContent>
        
        <TabsContent value="everbridge">
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
