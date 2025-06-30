
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle } from 'lucide-react';
import { useAllAlertSources } from '@/hooks/useAllAlertSources';
import EnhancedAlertsList from '@/components/alert-ready/EnhancedAlertsList';

const AlertReadyPage = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const {
    alerts,
    sources,
    loading,
    error,
    fetchAlerts,
    filterAlerts
  } = useAllAlertSources();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const filteredAlerts = filterAlerts(activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <AlertTriangle className="mr-2 text-warning" />
          Emergency Alerts
        </h1>
        <p className="text-muted-foreground">
          Current emergency alerts from all configured sources ({sources.length} active sources)
        </p>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="all">All Alerts ({alerts.length})</TabsTrigger>
          <TabsTrigger value="severe">
            Severe Only ({filterAlerts('severe').length})
          </TabsTrigger>
          <TabsTrigger value="immediate">
            Immediate Action ({filterAlerts('immediate').length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <EnhancedAlertsList 
            alerts={filteredAlerts}
            sources={sources}
            loading={loading}
            error={error}
            fetchAlerts={fetchAlerts}
            activeView={activeTab}
          />
        </TabsContent>
        
        <TabsContent value="severe" className="mt-6">
          <EnhancedAlertsList 
            alerts={filteredAlerts}
            sources={sources}
            loading={loading}
            error={error}
            fetchAlerts={fetchAlerts}
            activeView={activeTab}
          />
        </TabsContent>
        
        <TabsContent value="immediate" className="mt-6">
          <EnhancedAlertsList 
            alerts={filteredAlerts}
            sources={sources}
            loading={loading}
            error={error}
            fetchAlerts={fetchAlerts}
            activeView={activeTab}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AlertReadyPage;
