
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataPipelineDiagnostics from './DataPipelineDiagnostics';
import WeatherAlertsTab from './WeatherAlertsTab';
import AlertManagementTab from './AlertManagementTab';

const MonitoringTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('alerts');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Monitoring</h2>
        <p className="text-muted-foreground">Monitor alerts, pipelines, and system performance</p>
      </div>
      
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Alert Management</TabsTrigger>
          <TabsTrigger value="pipeline">Data Pipeline</TabsTrigger>
          <TabsTrigger value="weather">Weather Alerts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alerts" className="space-y-4">
          <AlertManagementTab />
        </TabsContent>
        
        <TabsContent value="pipeline" className="space-y-4">
          <DataPipelineDiagnostics />
        </TabsContent>
        
        <TabsContent value="weather" className="space-y-4">
          <WeatherAlertsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringTab;
