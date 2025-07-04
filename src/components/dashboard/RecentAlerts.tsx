
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, ExternalLink, Loader2, AlertTriangle, MapPin } from 'lucide-react';
import { UniversalAlert } from '@/types/alerts';
import { unifiedDataProvider } from '@/services/unifiedDataProvider';
import { alertClassificationService, ClassifiedAlert } from '@/services/alertClassificationService';
import { useToast } from '@/hooks/use-toast';
import AlertDetailModal from '@/components/alerts/AlertDetailModal';
import DataFreshnessIndicator from '@/components/ui/DataFreshnessIndicator';

interface RecentAlertsProps {
  onAlertClick?: (alert: UniversalAlert) => void;
}

const RecentAlerts: React.FC<RecentAlertsProps> = ({ onAlertClick }) => {
  const [alerts, setAlerts] = useState<ClassifiedAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<ClassifiedAlert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bannerTitle, setBannerTitle] = useState('Recent Alerts');
  const [freshness, setFreshness] = useState<any>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const getAlerts = async () => {
      setLoading(true);
      try {
        const unifiedData = await unifiedDataProvider.getUnifiedAlerts();
        
        // Filter for critical/relevant alerts for dashboard display
        const relevantAlerts = unifiedData.alerts.filter(alert => 
          alert.classification.urgencyScore > 0.3 || // High urgency
          !alert.classification.isRoutine || // Non-routine
          alert.severity === 'Extreme' || alert.severity === 'Severe'
        ).slice(0, 3); // Limit to 3 alerts
        
        setAlerts(relevantAlerts);
        setFreshness(unifiedData.freshness);
        setBannerTitle(alertClassificationService.getContextualBannerTitle(relevantAlerts));
        
      } catch (err) {
        console.error('Error fetching alerts for homepage:', err);
        toast({
          title: 'Error',
          description: 'Failed to load alerts',
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

  const handleAlertClick = (alert: ClassifiedAlert) => {
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
            Loading Alerts
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
            {bannerTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4 text-muted-foreground">No relevant alerts at this time</p>
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
          <CardTitle className="flex items-center gap-2">
            <Bell className="mr-2 h-5 w-5 text-warning" />
            {bannerTitle}
            {freshness && (
              <DataFreshnessIndicator 
                lastUpdated={freshness.lastUpdated}
                isProcessing={loading}
                hasErrors={freshness.source === 'database' && freshness.isStale}
              />
            )}
          </CardTitle>
          <CardDescription>Recent alerts - click to view details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.map((alert, index) => (
            <div 
              key={`${alert.id}-${index}`} 
              className={`border-l-4 pl-3 py-2 space-y-2 cursor-pointer hover:bg-gray-50 transition-colors rounded-r-md ${
                alert.classification.isRoutine ? 'border-blue-400' : 'border-red-500'
              }`}
              onClick={() => handleAlertClick(alert)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{alert.classification.icon}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-700">
                      {alert.classification.subtype}
                    </span>
                  </div>
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
