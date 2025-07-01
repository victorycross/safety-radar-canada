
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UniversalAlert } from '@/types/alerts';
import { useAlertSourcesFetch } from './useAlertSourcesFetch';
import { useAlertFiltering } from './useAlertFiltering';

interface AlertSource {
  id: string;
  name: string;
  source_type: string;
  is_active: boolean;
  health_status: string;
}

export const useAllAlertSources = () => {
  const [alerts, setAlerts] = useState<UniversalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { sources, fetchSources, fetchAlertsFromSource } = useAlertSourcesFetch();
  const { filterAlerts, validateAndSortAlerts } = useAlertFiltering();
  
  const fetchAllAlerts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting to fetch all alerts...');
      const activeSources = await fetchSources();
      const allAlerts: UniversalAlert[] = [];
      
      // Fetch alerts from each active source
      for (const source of activeSources) {
        console.log(`Processing source: ${source.name}`);
        const sourceAlerts = await fetchAlertsFromSource(source);
        console.log(`Got ${sourceAlerts.length} alerts from ${source.name}`);
        allAlerts.push(...sourceAlerts);
      }
      
      console.log(`Total alerts fetched: ${allAlerts.length}`);
      
      const validAlerts = validateAndSortAlerts(allAlerts);
      
      console.log(`Filtered to ${validAlerts.length} valid alerts from ${allAlerts.length} total`);
      
      setAlerts(validAlerts);
      
      if (validAlerts.length === 0) {
        console.warn('No valid alerts found. This might indicate a data ingestion issue.');
      }
      
    } catch (err) {
      console.error('Error fetching all alerts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts');
      toast({
        title: 'Error',
        description: 'Failed to fetch alerts from all sources. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useAllAlertSources hook initialized');
    fetchAllAlerts();
  }, []);
  
  return {
    alerts,
    sources,
    loading,
    error,
    fetchAlerts: fetchAllAlerts,
    filterAlerts: (activeView: string, sourceFilter?: string) => 
      filterAlerts(alerts, activeView, sourceFilter)
  };
};
