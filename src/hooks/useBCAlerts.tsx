
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BCAlertsItem, fetchBCAlertsData } from '@/utils/bcAlertsUtils';

export const useBCAlerts = () => {
  const [alerts, setAlerts] = useState<BCAlertsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchBCAlertsData();
      setAlerts(data);
    } catch (err) {
      console.error('Error fetching BC alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch BC alerts');
      toast({
        title: 'Error',
        description: 'Failed to fetch BC emergency alerts. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);
  
  return {
    alerts,
    loading,
    error,
    fetchAlerts
  };
};
