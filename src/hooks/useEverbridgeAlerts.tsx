
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface EverbridgeAlert {
  id: string;
  title: string;
  type: string;
  status: string;
  severity: string;
  location: string;
  description: string;
  updated: string;
  url?: string;
}

export const useEverbridgeAlerts = () => {
  const [alerts, setAlerts] = useState<EverbridgeAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('fetch-everbridge-alerts', {
        body: { source: 'everbridge' }
      });
      
      if (error) throw new Error(error.message);
      
      if (data && Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
      } else {
        setAlerts([]);
      }
    } catch (err) {
      console.error('Error fetching Everbridge alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch Everbridge alerts');
      toast({
        title: 'Error',
        description: 'Failed to fetch Everbridge alerts. Please try again later.',
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
