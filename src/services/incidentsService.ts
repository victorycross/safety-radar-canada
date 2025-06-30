import { supabase } from '@/integrations/supabase/client';
import { Incident, AlertLevel, IncidentSource, VerificationStatus } from '@/types';

export const fetchIncidents = async (): Promise<Incident[]> => {
  // Fetch incidents with enhanced data including correlations and geospatial info
  const { data, error } = await supabase
    .from('incidents')
    .select(`
      *,
      geospatial_data(*),
      alert_correlations:alert_correlations!primary_incident_id(
        related_incident_id,
        correlation_type,
        confidence_score
      )
    `)
    .order('timestamp', { ascending: false });
  
  if (error) throw error;
  
  if (data) {
    const mappedIncidents: Incident[] = data.map(incident => ({
      id: incident.id,
      title: incident.title,
      description: incident.description,
      provinceId: incident.province_id,
      timestamp: incident.timestamp, // Keep as string since it comes from database as ISO string
      alertLevel: incident.alert_level as AlertLevel,
      source: incident.source as IncidentSource,
      verificationStatus: incident.verification_status as VerificationStatus,
      recommendedAction: incident.recommended_action || undefined,
      // Enhanced fields from new schema
      confidenceScore: incident.confidence_score || 0.5,
      correlationId: incident.correlation_id || undefined,
      rawPayload: incident.raw_payload || undefined,
      dataSourceId: incident.data_source_id || undefined,
      geographicScope: incident.geographic_scope || undefined,
      severityNumeric: incident.severity_numeric || 1,
      geospatialData: incident.geospatial_data?.[0] || undefined,
      correlations: incident.alert_correlations || []
    }));
    
    return mappedIncidents;
  }
  
  return [];
};

export const addIncident = async (incidentData: Omit<Incident, 'id' | 'timestamp'>) => {
  const { data, error } = await supabase
    .from('incidents')
    .insert([
      {
        title: incidentData.title,
        description: incidentData.description,
        province_id: incidentData.provinceId,
        alert_level: incidentData.alertLevel,
        source: incidentData.source,
        verification_status: incidentData.verificationStatus,
        recommended_action: incidentData.recommendedAction
      }
    ])
    .select();
  
  if (error) throw error;
  return data;
};

export const reportIncident = async (incidentData: Omit<Incident, 'id' | 'timestamp'>) => {
  const { data, error } = await supabase
    .from('incidents')
    .insert([
      {
        title: incidentData.title,
        description: incidentData.description,
        province_id: incidentData.provinceId,
        alert_level: incidentData.alertLevel,
        source: incidentData.source,
        verification_status: incidentData.verificationStatus,
        recommended_action: incidentData.recommendedAction
      }
    ])
    .select();
  
  if (error) throw error;
  return data;
};
