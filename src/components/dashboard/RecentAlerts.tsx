
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, ExternalLink, Loader2, AlertTriangle, MapPin } from 'lucide-react';
import { AlertItem, fetchAlertReadyData, getSeverityBadge, formatAlertDate } from '@/utils/alertReadyUtils';
import { useToast } from '@/hooks/use-toast';

const RecentAlerts = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const getAlerts = async () => {
      setLoading(true);
      try {
        const alertData = await fetchAlertReadyData();
        // Get only severe or extreme alerts
        const criticalAlerts = alertData.filter(
          alert => alert.severity === 'Extreme' || alert.severity === 'Severe' || alert.urgency === 'Immediate'
        ).slice(0, 3); // Limit to 3 alerts
        
        setAlerts(criticalAlerts);
      } catch (err) {
        console.error('Error fetching alerts for homepage:', err);
        toast({
          title: 'Error',
          description: 'Failed to load emergency alerts',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    getAlerts();
  }, [toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5 text-warning" />
            Emergency Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5 text-warning" />
            Emergency Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-muted-foreground">No critical alerts at this time</p>
          <Link to="/alert-ready">
            <Button variant="outline" size="sm" className="w-full">View All Alerts</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5 text-warning" />
          Critical Emergency Alerts
        </CardTitle>
        <CardDescription>Recent critical alerts with enhanced formatting</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => {
          const severityInfo = getSeverityBadge(alert.severity);
          return (
            <div key={alert.id} className="border-l-4 border-red-500 pl-3 py-2 space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium leading-tight">{alert.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{formatAlertDate(alert.published)}</span>
                    {alert.area && alert.area !== 'Unknown' && alert.area !== 'Area not specified' && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{alert.area}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <Badge className={severityInfo.color}>{severityInfo.text}</Badge>
              </div>
              
              <p className="text-sm line-clamp-2">{alert.summary}</p>
              
              {alert.instructions && (
                <Alert className="border-orange-200 bg-orange-50 py-2">
                  <AlertTriangle className="h-3 w-3 text-orange-600" />
                  <AlertDescription className="text-orange-800 text-xs">
                    <span className="font-medium">Action:</span> {alert.instructions}
                  </AlertDescription>
                </Alert>
              )}
              
              {alert.url && (
                <a 
                  href={alert.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-primary hover:underline flex items-center"
                >
                  Details <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              )}
            </div>
          );
        })}
        <Link to="/alert-ready">
          <Button variant="outline" size="sm" className="w-full mt-2">View All Alerts</Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default RecentAlerts;
