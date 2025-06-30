
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UniversalAlert } from '@/types/alerts';
import { supabase } from '@/integrations/supabase/client';
import { normalizeAlert } from '@/utils/sourceNormalizers';

interface AlertSource {
  id: string;
  name: string;
  source_type: string;
  is_active: boolean;
  health_status: string;
}

export const useAllAlertSources = () => {
  const [alerts, setAlerts] = useState<UniversalAlert[]>([]);
  const [sources, setSources] = useState<AlertSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const fetchSources = async () => {
    try {
      const { data, error } = await supabase
        .from('alert_sources')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setSources(data || []);
      return data || [];
    } catch (err) {
      console.error('Error fetching alert sources:', err);
      throw err;
    }
  };

  const fetchAlertsFromSource = async (source: AlertSource): Promise<UniversalAlert[]> => {
    try {
      let result;
      
      switch (source.source_type) {
        case 'rss':
          // Fetch from security_alerts_ingest table for RSS feeds
          const { data: rssData, error: rssError } = await supabase
            .from('security_alerts_ingest')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
          
          if (rssError) throw rssError;
          
          return (rssData || []).map(alert => normalizeAlert({
            id: alert.id,
            title: alert.title,
            summary: alert.summary,
            description: alert.summary || 'No description available',
            link: alert.link,
            pubDate: alert.pub_date,
            category: alert.category,
            source: alert.source,
            location: alert.location
          }, 'rss'));

        case 'weather':
          // Fetch from weather_alerts_ingest table
          const { data: weatherData, error: weatherError } = await supabase
            .from('weather_alerts_ingest')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
          
          if (weatherError) throw weatherError;
          
          return (weatherData || []).map(alert => normalizeAlert({
            id: alert.id,
            description: alert.description,
            severity: alert.severity,
            event_type: alert.event_type,
            onset: alert.onset,
            expires: alert.expires,
            geometry_coordinates: alert.geometry_coordinates
          }, 'weather'));

        default:
          // For other sources, try to fetch via edge functions
          result = await supabase.functions.invoke('master-ingestion-orchestrator', {
            body: { source: source.source_type, test_mode: true }
          });
          
          if (result.error) throw new Error(result.error.message);
          
          const alerts = result.data?.alerts || result.data?.results || [];
          return alerts.map((alert: any) => normalizeAlert(alert, source.source_type));
      }
    } catch (err) {
      console.error(`Error fetching alerts from ${source.name}:`, err);
      return [];
    }
  };
  
  const fetchAllAlerts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const activeSources = await fetchSources();
      const allAlerts: UniversalAlert[] = [];
      
      // Fetch alerts from each active source
      for (const source of activeSources) {
        const sourceAlerts = await fetchAlertsFromSource(source);
        allAlerts.push(...sourceAlerts);
      }
      
      // Sort alerts by published date (most recent first)
      allAlerts.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
      
      setAlerts(allAlerts);
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
    fetchAllAlerts();
  }, []);
  
  const filterAlerts = (activeView: string, sourceFilter?: string) => {
    let filtered = alerts;
    
    // Filter by source if specified
    if (sourceFilter && sourceFilter !== 'all') {
      filtered = filtered.filter(alert => alert.source.toLowerCase().includes(sourceFilter.toLowerCase()));
    }
    
    // Filter by severity/urgency
    if (activeView === 'severe') {
      filtered = filtered.filter(alert => 
        alert.severity === 'Extreme' || alert.severity === 'Severe'
      );
    } else if (activeView === 'immediate') {
      filtered = filtered.filter(alert => alert.urgency === 'Immediate');
    }
    
    return filtered;
  };
  
  return {
    alerts,
    sources,
    loading,
    error,
    fetchAlerts: fetchAllAlerts,
    filterAlerts
  };
};
