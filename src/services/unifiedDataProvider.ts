import { supabase } from '@/integrations/supabase/client';
import { UniversalAlert } from '@/types/alerts';
import { fetchAlertReadyData } from '@/utils/alertReadyUtils';
import { alertClassificationService, ClassifiedAlert } from './alertClassificationService';

export interface DataFreshnessInfo {
  lastUpdated: Date;
  stalenessMinutes: number;
  isStale: boolean;
  source: 'database' | 'external_api' | 'mixed';
}

export interface UnifiedAlertData {
  alerts: ClassifiedAlert[];
  freshness: DataFreshnessInfo;
  sources: string[];
  statistics: {
    total: number;
    byType: Record<string, number>;
    routine: number;
    critical: number;
  };
}

class UnifiedDataProvider {
  private readonly STALENESS_THRESHOLD_MINUTES = 30;
  private cache: UnifiedAlertData | null = null;
  private lastFetch: Date | null = null;
  private readonly CACHE_DURATION_MINUTES = 5;

  /**
   * Get unified alert data with intelligent source selection
   */
  async getUnifiedAlerts(): Promise<UnifiedAlertData> {
    // Return cached data if still fresh
    if (this.cache && this.lastFetch && this.isCacheFresh()) {
      return this.cache;
    }

    try {
      // Try database first
      const databaseAlerts = await this.fetchFromDatabase();
      const databaseFreshness = await this.assessDatabaseFreshness();
      
      let alerts: UniversalAlert[] = [];
      let source: 'database' | 'external_api' | 'mixed' = 'database';
      
      if (databaseFreshness.isStale || databaseAlerts.length === 0) {
        console.log('Database is stale or empty, fetching from external APIs...');
        
        // Fallback to external APIs
        const externalAlerts = await this.fetchFromExternalAPIs();
        
        if (externalAlerts.length > 0) {
          alerts = externalAlerts;
          source = databaseAlerts.length > 0 ? 'mixed' : 'external_api';
          
          // Trigger background ingestion to update database
          this.triggerBackgroundIngestion();
        } else {
          // Use database even if stale
          alerts = databaseAlerts;
        }
      } else {
        alerts = databaseAlerts;
      }
      
      // Classify all alerts
      const classifiedAlerts = alertClassificationService.classifyAlerts(alerts);
      
      // Filter out expired alerts
      const activeAlerts = this.filterExpiredAlerts(classifiedAlerts);
      
      // Build unified data structure
      const unifiedData: UnifiedAlertData = {
        alerts: activeAlerts,
        freshness: {
          lastUpdated: databaseFreshness.lastUpdated,
          stalenessMinutes: databaseFreshness.stalenessMinutes,
          isStale: databaseFreshness.isStale,
          source
        },
        sources: this.extractUniqueSources(activeAlerts),
        statistics: this.calculateStatistics(activeAlerts)
      };
      
      // Cache the result
      this.cache = unifiedData;
      this.lastFetch = new Date();
      
      return unifiedData;
      
    } catch (error) {
      console.error('Error in unified data provider:', error);
      
      // Return cached data if available, otherwise empty structure
      if (this.cache) {
        return this.cache;
      }
      
      return this.getEmptyUnifiedData();
    }
  }

  /**
   * Force refresh from external sources
   */
  async forceRefresh(): Promise<UnifiedAlertData> {
    this.cache = null;
    this.lastFetch = null;
    return this.getUnifiedAlerts();
  }

  /**
   * Trigger manual data ingestion
   */
  async triggerIngestion(): Promise<void> {
    try {
      const { error } = await supabase.functions.invoke('master-ingestion-orchestrator', {
        body: { source: 'manual_trigger' }
      });
      
      if (error) {
        console.error('Error triggering ingestion:', error);
        throw error;
      }
      
      console.log('Data ingestion triggered successfully');
      
      // Clear cache to force fresh data on next request
      this.cache = null;
      this.lastFetch = null;
      
    } catch (error) {
      console.error('Failed to trigger ingestion:', error);
      throw error;
    }
  }

  private async fetchFromDatabase(): Promise<UniversalAlert[]> {
    const alerts: UniversalAlert[] = [];
    
    try {
      // Fetch weather alerts
      const { data: weatherAlerts } = await supabase
        .from('weather_alerts_ingest')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (weatherAlerts) {
        alerts.push(...this.normalizeWeatherAlerts(weatherAlerts));
      }
      
      // Fetch security alerts
      const { data: securityAlerts } = await supabase
        .from('security_alerts_ingest')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (securityAlerts) {
        alerts.push(...this.normalizeSecurityAlerts(securityAlerts));
      }
      
      // Fetch immigration alerts
      const { data: immigrationAlerts } = await supabase
        .from('immigration_travel_announcements')
        .select('*')
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (immigrationAlerts) {
        alerts.push(...this.normalizeImmigrationAlerts(immigrationAlerts));
      }
      
    } catch (error) {
      console.error('Error fetching from database:', error);
    }
    
    return alerts;
  }

  private async fetchFromExternalAPIs(): Promise<UniversalAlert[]> {
    try {
      // Use existing external API fetcher
      return await fetchAlertReadyData();
    } catch (error) {
      console.error('Error fetching from external APIs:', error);
      return [];
    }
  }

  private async assessDatabaseFreshness(): Promise<DataFreshnessInfo> {
    try {
      // Check the most recent weather alert
      const { data: latestWeather } = await supabase
        .from('weather_alerts_ingest')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      const lastUpdated = latestWeather ? new Date(latestWeather.created_at) : new Date(0);
      const now = new Date();
      const stalenessMinutes = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60));
      
      return {
        lastUpdated,
        stalenessMinutes,
        isStale: stalenessMinutes > this.STALENESS_THRESHOLD_MINUTES,
        source: 'database'
      };
      
    } catch (error) {
      console.error('Error assessing database freshness:', error);
      return {
        lastUpdated: new Date(0),
        stalenessMinutes: Infinity,
        isStale: true,
        source: 'database'
      };
    }
  }

  private async triggerBackgroundIngestion(): Promise<void> {
    // Don't await this - let it run in background
    setTimeout(async () => {
      try {
        await this.triggerIngestion();
      } catch (error) {
        console.error('Background ingestion failed:', error);
      }
    }, 1000);
  }

  private filterExpiredAlerts(alerts: ClassifiedAlert[]): ClassifiedAlert[] {
    const now = new Date();
    
    return alerts.filter(alert => {
      // If no expiry time, keep the alert
      if (!alert.expires) return true;
      
      const expiry = new Date(alert.expires);
      const graceHours = alert.classification.type === 'weather' ? 2 : 24; // Shorter grace for weather
      const graceTime = new Date(expiry.getTime() + (graceHours * 60 * 60 * 1000));
      
      return now <= graceTime;
    });
  }

  private isCacheFresh(): boolean {
    if (!this.lastFetch) return false;
    const now = new Date();
    const cacheAge = (now.getTime() - this.lastFetch.getTime()) / (1000 * 60);
    return cacheAge < this.CACHE_DURATION_MINUTES;
  }

  private extractUniqueSources(alerts: ClassifiedAlert[]): string[] {
    const sources = new Set(alerts.map(alert => alert.source));
    return Array.from(sources);
  }

  private calculateStatistics(alerts: ClassifiedAlert[]) {
    const byType = alerts.reduce((acc, alert) => {
      acc[alert.classification.type] = (acc[alert.classification.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const routine = alerts.filter(a => a.classification.isRoutine).length;
    const critical = alerts.length - routine;
    
    return {
      total: alerts.length,
      byType,
      routine,
      critical
    };
  }

  private getEmptyUnifiedData(): UnifiedAlertData {
    return {
      alerts: [],
      freshness: {
        lastUpdated: new Date(0),
        stalenessMinutes: Infinity,
        isStale: true,
        source: 'database'
      },
      sources: [],
      statistics: {
        total: 0,
        byType: {},
        routine: 0,
        critical: 0
      }
    };
  }

  // Normalization methods for database records
  private normalizeWeatherAlerts(alerts: any[]): UniversalAlert[] {
    return alerts.map(alert => ({
      id: alert.id,
      title: alert.event_type || 'Weather Alert',
      description: alert.description || 'No description available',
      severity: this.mapSeverity(alert.severity),
      urgency: 'Expected' as const,
      category: 'Weather',
      status: 'Actual' as const,
      area: 'Unknown',
      published: alert.created_at,
      expires: alert.expires,
      source: 'Environment Canada Weather' as const,
      coordinates: alert.geometry_coordinates ? this.extractCoordinates(alert.geometry_coordinates) : undefined
    }));
  }

  private normalizeSecurityAlerts(alerts: any[]): UniversalAlert[] {
    return alerts.map(alert => ({
      id: alert.id,
      title: alert.title,
      description: alert.summary || 'No description available',
      severity: 'Moderate' as const,
      urgency: 'Expected' as const,
      category: alert.category || 'Security',
      status: 'Actual' as const,
      area: alert.location || 'Global',
      published: alert.pub_date || alert.created_at,
      source: 'Canadian Centre for Cyber Security' as const,
      url: alert.link
    }));
  }

  private normalizeImmigrationAlerts(alerts: any[]): UniversalAlert[] {
    return alerts.map(alert => ({
      id: alert.id,
      title: alert.title,
      description: alert.content || alert.summary || 'No description available',
      severity: 'Minor' as const,
      urgency: 'Future' as const,
      category: alert.category || 'Immigration',
      status: 'Actual' as const,
      area: alert.location || 'Canada',
      published: alert.pub_date || alert.created_at,
      source: 'Immigration Canada RSS' as const,
      url: alert.link
    }));
  }

  private mapSeverity(severity: string | null): UniversalAlert['severity'] {
    if (!severity) return 'Unknown';
    const normalized = severity.toLowerCase();
    if (normalized.includes('extreme')) return 'Extreme';
    if (normalized.includes('severe')) return 'Severe';
    if (normalized.includes('moderate')) return 'Moderate';
    if (normalized.includes('minor')) return 'Minor';
    return 'Unknown';
  }

  private extractCoordinates(geometryData: any): { latitude: number; longitude: number } | undefined {
    if (!geometryData) return undefined;
    
    try {
      if (Array.isArray(geometryData) && geometryData.length >= 2) {
        return {
          longitude: geometryData[0],
          latitude: geometryData[1]
        };
      }
    } catch (error) {
      console.error('Error extracting coordinates:', error);
    }
    
    return undefined;
  }
}

export const unifiedDataProvider = new UnifiedDataProvider();
