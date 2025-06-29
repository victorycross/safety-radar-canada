
import React from 'react';
import { AlertTriangle, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UniversalAlertCard from '@/components/alerts/UniversalAlertCard';
import { UniversalAlert } from '@/types/alerts';

interface BCAlertsListProps {
  alerts: UniversalAlert[];
  loading: boolean;
  error: string | null;
  fetchAlerts: () => void;
}

const BCAlertslist = ({ alerts, loading, error, fetchAlerts }: BCAlertsListProps) => {
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
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-2" />
        <p className="text-lg font-medium">Error loading BC alerts</p>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchAlerts} className="mt-4">Try Again</Button>
      </div>
    );
  }
  
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <Info className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-lg font-medium">No BC alerts found</p>
        <p className="text-muted-foreground">There are currently no active BC emergency alerts</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <UniversalAlertCard key={alert.id} alert={alert} />
      ))}
    </div>
  );
};

export default BCAlertslist;
