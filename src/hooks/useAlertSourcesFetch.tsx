
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UniversalAlert } from '@/types/alerts';
import { normalizeAlert } from '@/utils/sourceNormalizers';
import { logger } from '@/utils/logger';

interface AlertSource {
  id: string;
  name: string;
  source_type: string;
  is_active: boolean;
  health_status: string;
}

export const useAlertSourcesFetch = () => {
  const [sources, setSources] = useState<AlertSource[]>([]);

  const fetchSources = async () => {
    try {
      logger.info('Fetching alert sources...');
      const { data, error } = await supabase
        .from('alert_sources')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      logger.info('Fetched sources:', data);
      setSources(data || []);
      return data || [];
    } catch (err) {
      logger.error('Error fetching alert sources:', err);
      throw err;
    }
  };

  const fetchAlertsFromSource = async (source: AlertSource): Promise<UniversalAlert[]> => {
    try {
      logger.info(`Fetching alerts from source: ${source.name} (${source.source_type})`);
      
      switch (source.source_type) {
        case 'rss':
        case 'security-rss':
          return await fetchRSSAlerts(source);

        case 'weather':
        case 'weather-geocmet':
          return await fetchWeatherAlerts(source);

        default:
          logger.info(`No specific handler for source type: ${source.source_type}`);
          return [];
      }
    } catch (err) {
      logger.error(`Error fetching alerts from ${source.name}:`, err);
      return [];
    }
  };

  const fetchRSSAlerts = async (source: AlertSource): Promise<UniversalAlert[]> => {
    const { data: rssData, error: rssError } = await supabase
      .from('security_alerts_ingest')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (rssError) {
      logger.error('RSS data fetch error:', rssError);
      throw rssError;
    }
    
    logger.info(`Fetched ${rssData?.length || 0} RSS alerts`);
    
    return (rssData || []).map(alert => {
      const normalized = normalizeAlert({
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
      }, source.source_type);
      
      logger.debug('Normalized RSS alert:', {
        id: normalized.id,
        title: normalized.title,
        source: normalized.source
      });
      
      return normalized;
    });
  };

  const fetchWeatherAlerts = async (source: AlertSource): Promise<UniversalAlert[]> => {
    const { data: weatherData, error: weatherError } = await supabase
      .from('weather_alerts_ingest')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (weatherError) {
      logger.error('Weather data fetch error:', weatherError);
      throw weatherError;
    }
    
    logger.info(`Fetched ${weatherData?.length || 0} weather alerts`);
    
    return (weatherData || []).map(alert => {
      const normalized = normalizeAlert({
        id: alert.id,
        title: alert.description?.split('.')[0] || 'Weather Alert',
        description: alert.description,
        severity: alert.severity,
        event_type: alert.event_type,
        onset: alert.onset,
        expires: alert.expires,
        geometry_coordinates: alert.geometry_coordinates,
        raw_data: alert.raw_data
      }, source.source_type);
      
      logger.debug('Normalized weather alert:', {
        id: normalized.id,
        title: normalized.title,
        source: normalized.source
      });
      
      return normalized;
    });
  };

  return {
    sources,
    fetchSources,
    fetchAlertsFromSource
  };
};
