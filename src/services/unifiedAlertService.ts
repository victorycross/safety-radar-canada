
import { supabase } from '@/integrations/supabase/client';
import { UniversalAlert } from '@/types/alerts';
import { AlertLevel, IncidentSource, VerificationStatus } from '@/types';

export interface AlertIntegrationConfig {
  autoCreateIncidents: boolean;
  severityMapping: {
    extreme: AlertLevel;
    severe: AlertLevel;
    moderate: AlertLevel;
    minor: AlertLevel;
  };
  defaultProvinceId?: string;
}

const DEFAULT_CONFIG: AlertIntegrationConfig = {
  autoCreateIncidents: true,
  severityMapping: {
    extreme: AlertLevel.SEVERE,
    severe: AlertLevel.SEVERE,
    moderate: AlertLevel.WARNING,
    minor: AlertLevel.NORMAL,
  }
};

export class UnifiedAlertService {
  private config: AlertIntegrationConfig;

  constructor(config: Partial<AlertIntegrationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async processExternalAlert(alert: UniversalAlert): Promise<string | null> {
    if (!this.config.autoCreateIncidents) {
      return null;
    }

    try {
      // Map external alert to internal incident
      const incident = await this.mapAlertToIncident(alert);
      
      // Check for duplicates
      const existingIncident = await this.findExistingIncident(alert);
      if (existingIncident) {
        console.log(`Skipping duplicate alert: ${alert.id}`);
        return existingIncident.id;
      }

      // Create incident
      const { data, error } = await supabase
        .from('incidents')
        .insert(incident)
        .select()
        .single();

      if (error) throw error;

      console.log(`Created incident from external alert: ${data.id}`);
      return data.id;

    } catch (error) {
      console.error('Error processing external alert:', error);
      return null;
    }
  }

  private async mapAlertToIncident(alert: UniversalAlert) {
    // Get default province (Ontario) if not specified
    const provinceId = this.config.defaultProvinceId || await this.getDefaultProvinceId();

    // Properly serialize the raw payload to ensure JSON compatibility
    const rawPayload = {
      original_alert: {
        id: alert.id,
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        urgency: alert.urgency,
        area: alert.area,
        published: alert.published,
        source: alert.source
      },
      integration_source: 'unified_feed',
      processed_at: new Date().toISOString()
    };

    return {
      title: alert.title,
      description: alert.description,
      province_id: provinceId,
      timestamp: alert.published,
      alert_level: this.mapSeverityToAlertLevel(alert.severity),
      source: this.mapSourceToIncidentSource(alert.source),
      verification_status: VerificationStatus.UNVERIFIED,
      confidence_score: 0.7, // External alerts get medium confidence
      raw_payload: rawPayload,
      geographic_scope: alert.area,
      severity_numeric: this.getSeverityNumeric(alert.severity)
    };
  }

  private async findExistingIncident(alert: UniversalAlert) {
    const { data } = await supabase
      .from('incidents')
      .select('id, title')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .ilike('title', `%${alert.title.substring(0, 30)}%`)
      .limit(1)
      .maybeSingle();

    return data;
  }

  private async getDefaultProvinceId(): Promise<string> {
    const { data } = await supabase
      .from('provinces')
      .select('id')
      .eq('code', 'ON')
      .maybeSingle();

    return data?.id || '';
  }

  private mapSeverityToAlertLevel(severity: string): AlertLevel {
    const normalizedSeverity = severity.toLowerCase() as keyof typeof this.config.severityMapping;
    return this.config.severityMapping[normalizedSeverity] || AlertLevel.NORMAL;
  }

  private mapSourceToIncidentSource(source: string): IncidentSource {
    switch (source) {
      case 'Alert Ready': return IncidentSource.GOVERNMENT;
      case 'BC Emergency': return IncidentSource.BC_ALERTS;
      case 'Everbridge': return IncidentSource.EVERBRIDGE;
      default: return IncidentSource.MANUAL;
    }
  }

  private getSeverityNumeric(severity: string): number {
    switch (severity.toLowerCase()) {
      case 'extreme': return 4;
      case 'severe': return 3;
      case 'moderate': return 2;
      case 'minor': return 1;
      default: return 1;
    }
  }

  async batchProcessAlerts(alerts: UniversalAlert[]): Promise<string[]> {
    const processedIds: string[] = [];
    
    for (const alert of alerts) {
      const incidentId = await this.processExternalAlert(alert);
      if (incidentId) {
        processedIds.push(incidentId);
      }
    }

    return processedIds;
  }
}

export const unifiedAlertService = new UnifiedAlertService();
