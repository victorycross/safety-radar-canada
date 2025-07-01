
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, ExternalLink, Loader2, AlertTriangle, MapPin } from 'lucide-react';
import { UniversalAlert } from '@/types/alerts';
import { fetchAlertReadyData } from '@/utils/alertReadyUtils';
import { useToast } from '@/hooks/use-toast';
import AlertDetailModal from '@/components/alerts/AlertDetailModal';

interface RecentAlertsProps {
  onAlertClick?: (alert: UniversalAlert) => void;
}

const RecentAlerts: React.FC<RecentAlertsProps> = ({ onAlertClick }) => {
  const [alerts, setAlerts] = useState<UniversalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<UniversalAlert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const formatAlertDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Extreme':
        return 'bg-red-600 text-white';
      case 'Severe':
        return 'bg-red-500 text-white';  
      case 'Moderate':
        return 'bg-orange-500 text-white';
      case 'Minor':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleAlertClick = (alert: UniversalAlert) => {
    if (onAlertClick) {
      onAlertClick(alert);
    } else {
      setSelectedAlert(alert);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setSelectedAlert(null);
    setIsModalOpen(false);
  };

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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5 text-warning" />
            Critical Emergency Alerts
          </CardTitle>
          <CardDescription>Recent critical alerts - click to view details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.map((alert) => (
            <div 
              key={alert.id} 
              className="border-l-4 border-red-500 pl-3 py-2 space-y-2 cursor-pointer hover:bg-gray-50 transition-colors rounded-r-md"
              onClick={() => handleAlertClick(alert)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium leading-tight hover:underline">{alert.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span>{formatAlertDate(alert.published)}</span>
                    {alert.area && alert.area !== 'Area not specified' && (
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
                <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
              </div>
              
              <p className="text-sm line-clamp-2">{alert.description}</p>
              
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
                  onClick={(e) => e.stopPropagation()}
                >
                  Details <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              )}
            </div>
          ))}
          <Link to="/alert-ready">
            <Button variant="outline" size="sm" className="w-full mt-2">View All Alerts</Button>
          </Link>
        </CardContent>
      </Card>

      <AlertDetailModal
        alert={selectedAlert}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default RecentAlerts;
