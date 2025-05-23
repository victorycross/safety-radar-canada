
import React from 'react';
import { AlertTriangle, Info, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EverbridgeAlert } from '@/hooks/useEverbridgeAlerts';

interface EverbridgeAlertsListProps {
  alerts: EverbridgeAlert[];
  loading: boolean;
  error: string | null;
  fetchAlerts: () => void;
}

const getSeverityClass = (severity: string) => {
  const normalizedSeverity = severity.toLowerCase();
  
  if (normalizedSeverity.includes('extreme') || normalizedSeverity.includes('severe')) {
    return 'bg-danger text-white';
  } else if (normalizedSeverity.includes('moderate') || normalizedSeverity.includes('warning')) {
    return 'bg-warning text-black';
  } else if (normalizedSeverity.includes('minor') || normalizedSeverity.includes('advisory')) {
    return 'bg-secondary text-secondary-foreground';
  } else {
    return 'bg-muted text-muted-foreground';
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const EverbridgeAlertCard = ({ alert }: { alert: EverbridgeAlert }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{alert.title}</CardTitle>
          <Badge className={getSeverityClass(alert.severity)}>{alert.severity}</Badge>
        </div>
        <CardDescription>{alert.location}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="whitespace-pre-wrap text-sm">{alert.description}</p>
        <div className="flex items-center mt-2 text-xs text-muted-foreground">
          <AlertTriangle className="h-3 w-3 mr-1" />
          <span>Updated: {formatDate(alert.updated)}</span>
        </div>
      </CardContent>
      {alert.url && (
        <CardFooter>
          <a href={alert.url} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </a>
        </CardFooter>
      )}
    </Card>
  );
};

const EverbridgeAlertsList = ({ alerts, loading, error, fetchAlerts }: EverbridgeAlertsListProps) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-2" />
        <p className="text-lg font-medium">Error loading Everbridge alerts</p>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchAlerts} className="mt-4">Try Again</Button>
      </div>
    );
  }
  
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <Info className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-lg font-medium">No active Everbridge alerts</p>
        <p className="text-muted-foreground">
          There are currently no active Everbridge emergency alerts
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <EverbridgeAlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
};

export default EverbridgeAlertsList;
