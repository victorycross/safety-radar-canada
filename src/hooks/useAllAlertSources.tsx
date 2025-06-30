
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
        case 'security-rss':
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
            description: alert.summary || alert.title,
            link: alert.link,
            pubDate: alert.pub_date,
            category: alert.category,
            source: alert.source,
            location: alert.location,
            raw_data: alert.raw_data
          }, source.source_type));

        case 'weather':
        case 'weather-geocmet':
          // Fetch from weather_alerts_ingest table
          const { data: weatherData, error: weatherError } = await supabase
            .from('weather_alerts_ingest')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);
          
          if (weatherError) throw weatherError;
          
          return (weatherData || []).map(alert => normalizeAlert({
            id: alert.id,
            title: alert.description?.split('.')[0] || 'Weather Alert',
            description: alert.description,
            severity: alert.severity,
            event_type: alert.event_type,
            onset: alert.onset,
            expires: alert.expires,
            geometry_coordinates: alert.geometry_coordinates,
            raw_data: alert.raw_data
          }, source.source_type));

        default:
          console.log(`No specific handler for source type: ${source.source_type}`);
          return [];
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
      
      // Filter out test data and sort by published date
      const validAlerts = allAlerts.filter(alert => {
        const isValidAlert = alert.title !== 'Untitled Alert' && 
                            alert.description !== 'No description available' &&
                            !alert.title.toLowerCase().includes('test') &&
                            alert.title.trim().length > 0;
        return isValidAlert;
      });
      
      validAlerts.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
      
      setAlerts(validAlerts);
      
      console.log(`Filtered ${validAlerts.length} valid alerts from ${allAlerts.length} total`);
      
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
