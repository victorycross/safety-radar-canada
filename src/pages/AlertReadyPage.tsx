
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, AlertTriangle, Bell, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  AlertItem, 
  fetchAlertReadyData, 
  getSeverityBadge,
  getUrgencyBadge,
  formatAlertDate 
} from '@/utils/alertReadyUtils';

const AlertReadyPage = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState('all');
  const { toast } = useToast();
  
  useEffect(() => {
    fetchAlerts();
  }, []);
  
  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchAlertReadyData();
      setAlerts(data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      toast({
        title: 'Error',
        description: 'Failed to fetch emergency alerts. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const renderSeverityBadge = (severity: string) => {
    const badgeInfo = getSeverityBadge(severity);
    return <Badge className={badgeInfo.color}>{badgeInfo.text}</Badge>;
  };
  
  const renderUrgencyBadge = (urgency: string) => {
    const badgeInfo = getUrgencyBadge(urgency);
    return <Badge className={badgeInfo.color}>{badgeInfo.text}</Badge>;
  };
  
  const filterAlerts = (alerts: AlertItem[]) => {
    if (activeView === 'all') return alerts;
    
    if (activeView === 'severe') {
      return alerts.filter(alert => 
        alert.severity === 'Extreme' || alert.severity === 'Severe'
      );
    }
    
    if (activeView === 'immediate') {
      return alerts.filter(alert => alert.urgency === 'Immediate');
    }
    
    return alerts;
  };
  
  const filteredAlerts = filterAlerts(alerts);

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
          
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-2" />
              <p className="text-lg font-medium">Error loading alerts</p>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={fetchAlerts} className="mt-4">Try Again</Button>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Info className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-lg font-medium">No alerts found</p>
              <p className="text-muted-foreground">
                {activeView !== 'all' 
                  ? 'Try changing your filter or refreshing the page' 
                  : 'There are currently no active alerts in the system'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <Card key={alert.id + Math.random()} className="overflow-hidden">
                  <div className={`h-2 ${alert.severity === 'Extreme' || alert.severity === 'Severe' ? 'bg-danger' : alert.urgency === 'Immediate' ? 'bg-warning' : 'bg-muted'}`}></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{alert.title}</CardTitle>
                      <div className="flex space-x-2">
                        {renderSeverityBadge(alert.severity)}
                        {renderUrgencyBadge(alert.urgency)}
                      </div>
                    </div>
                    <CardDescription>
                      Published: {formatAlertDate(alert.published)}
                      {alert.updated && ` • Updated: ${formatAlertDate(alert.updated)}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{alert.summary}</p>
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="font-medium">Category:</span> {alert.category}
                        <span className="mx-2">•</span>
                        <span className="font-medium">Status:</span> {alert.status}
                      </div>
                      <div>
                        <span className="font-medium">Area:</span> {alert.area}
                      </div>
                    </div>
                    {alert.url && (
                      <div className="mt-4">
                        <a 
                          href={alert.url} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          More details <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertReadyPage;
