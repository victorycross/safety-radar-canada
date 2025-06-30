
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, RefreshCw, Database, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAllAlertSources } from '@/hooks/useAllAlertSources';
import { supabase } from '@/integrations/supabase/client';
import EnhancedAlertsList from '@/components/alert-ready/EnhancedAlertsList';

const AlertReadyPage = () => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [lastIngestion, setLastIngestion] = useState<string>('Never');
  const [ingestionRunning, setIngestionRunning] = useState(false);
  
  const {
    alerts,
    sources,
    loading,
    error,
    fetchAlerts,
    filterAlerts
  } = useAllAlertSources();

  // Check last ingestion time
  useEffect(() => {
    const checkLastIngestion = async () => {
      try {
        const { data, error } = await supabase
          .from('source_health_metrics')
          .select('timestamp, success')
          .order('timestamp', { ascending: false })
          .limit(1);
        
        if (data && data.length > 0) {
          setLastIngestion(new Date(data[0].timestamp).toLocaleString());
        }
      } catch (err) {
        console.error('Error checking last ingestion:', err);
      }
    };
    
    checkLastIngestion();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const triggerIngestion = async () => {
    try {
      setIngestionRunning(true);
      console.log('Triggering master ingestion orchestrator...');
      
      const { data, error } = await supabase.functions.invoke('master-ingestion-orchestrator');
      
      if (error) {
        console.error('Ingestion error:', error);
        throw error;
      }
      
      console.log('Ingestion result:', data);
      
      // Wait a moment then refresh alerts
      setTimeout(() => {
        fetchAlerts();
        setLastIngestion(new Date().toLocaleString());
      }, 2000);
      
    } catch (err) {
      console.error('Error triggering ingestion:', err);
    } finally {
      setIngestionRunning(false);
    }
  };

  const filteredAlerts = filterAlerts(activeTab);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <AlertTriangle className="mr-2 text-warning" />
            Emergency Alerts
          </h1>
          <p className="text-muted-foreground">
            Current emergency alerts from all configured sources ({sources.length} active sources)
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={triggerIngestion}
            disabled={ingestionRunning}
            variant="outline"
            size="sm"
          >
            {ingestionRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            {ingestionRunning ? 'Running...' : 'Run Ingestion'}
          </Button>
          
          <Button
            onClick={fetchAlerts}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sources.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Severe Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {filterAlerts('severe').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Ingestion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">{lastIngestion}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sources Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Source Status
          </CardTitle>
          <CardDescription>
            Status of all configured alert sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sources.map((source) => (
              <Badge
                key={source.id}
                variant={source.health_status === 'healthy' ? 'default' : 'destructive'}
                className="flex items-center gap-1"
              >
                <div className={`w-2 h-2 rounded-full ${
                  source.health_status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                {source.name} ({source.source_type})
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
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
