
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UniversalAlert } from '@/types/alerts';
import { fetchAlertReadyData } from '@/utils/alertReadyUtils';

export const useAlertReady = () => {
  const [alerts, setAlerts] = useState<UniversalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
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

  useEffect(() => {
    fetchAlerts();
  }, []);
  
  const filterAlerts = (activeView: string) => {
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
  
  return {
    alerts,
    loading,
    error,
    fetchAlerts,
    filterAlerts
  };
};
