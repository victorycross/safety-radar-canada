import { useState, useEffect } from 'react';
import { AlertLevel, Incident, Province, IncidentSource, VerificationStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useSupabaseData() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProvinces = async () => {
    try {
      const { data, error } = await supabase
        .from('provinces')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        const mappedProvinces: Province[] = data.map(province => ({
          id: province.id,
          name: province.name,
          code: province.code,
          alertLevel: province.alert_level as AlertLevel,
          employeeCount: province.employee_count,
          incidents: [] // Will be populated separately
        }));
        
        setProvinces(mappedProvinces);
      }
    } catch (err) {
      console.error('Error fetching provinces:', err);
      setError('Failed to load province data');
      toast({
        title: 'Error',
        description: 'Failed to load province data',
        variant: 'destructive',
      });
    }
  };

  const fetchIncidents = async () => {
    try {
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
          timestamp: new Date(incident.timestamp),
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
        
        setIncidents(mappedIncidents);
      }
    } catch (err) {
      console.error('Error fetching incidents:', err);
      setError('Failed to load incident data');
      toast({
        title: 'Error',
        description: 'Failed to load incident data',
        variant: 'destructive',
      });
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([fetchProvinces(), fetchIncidents()]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    refreshData();
    
    // Set up realtime subscriptions for provinces and incidents
    const provincesSubscription = supabase
      .channel('public:provinces')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'provinces' }, refreshData)
      .subscribe();
      
    const incidentsSubscription = supabase
      .channel('public:incidents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, refreshData)
      .subscribe();
    
    return () => {
      supabase.removeChannel(provincesSubscription);
      supabase.removeChannel(incidentsSubscription);
    };
  }, []);

  // Helper methods that we need in various components
  const getProvinceById = (provinceId: string) => {
    return provinces.find(province => province.id === provinceId);
  };

  const getIncidentsByProvince = (provinceId: string) => {
    return incidents.filter(incident => incident.provinceId === provinceId);
  };

  // Add a new incident to the database
  const addIncident = async (incidentData: Omit<Incident, 'id' | 'timestamp'>) => {
    try {
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
      
      toast({
        title: 'Incident Added',
        description: 'A new security incident has been recorded.',
      });
      
      await refreshData();
      return data;
    } catch (err) {
      console.error('Error adding incident:', err);
      toast({
        title: 'Error',
        description: 'Failed to add incident. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Report a new incident (same as add but with different notification)
  const reportIncident = async (incidentData: Omit<Incident, 'id' | 'timestamp'>) => {
    try {
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
      
      toast({
        title: 'Report Submitted',
        description: 'Thank you for your report. It will be reviewed by our team.',
      });
      
      await refreshData();
      return data;
    } catch (err) {
      console.error('Error reporting incident:', err);
      toast({
        title: 'Error',
        description: 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Update a province's alert level directly (rarely needed due to trigger)
  const updateProvinceAlertLevel = async (provinceId: string, alertLevel: AlertLevel) => {
    try {
      const { data, error } = await supabase
        .from('provinces')
        .update({ alert_level: alertLevel })
        .eq('id', provinceId)
        .select();
      
      if (error) throw error;
      
      toast({
        title: 'Alert Level Updated',
        description: `Alert level for ${provinces.find(p => p.id === provinceId)?.name} has been updated.`,
      });
      
      await refreshData();
      return data;
    } catch (err) {
      console.error('Error updating province alert level:', err);
      toast({
        title: 'Error',
        description: 'Failed to update alert level. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Enhanced method to get incidents with correlation data
  const getCorrelatedIncidents = (incidentId: string) => {
    return incidents.filter(incident => 
      incident.correlations?.some(corr => 
        corr.related_incident_id === incidentId || 
        incident.id === incidentId
      )
    );
  };

  // Method to get incidents by confidence score range
  const getIncidentsByConfidence = (minConfidence: number = 0, maxConfidence: number = 1) => {
    return incidents.filter(incident => 
      (incident.confidenceScore || 0) >= minConfidence && 
      (incident.confidenceScore || 0) <= maxConfidence
    );
  };

  // Method to get incidents with geospatial data
  const getGeotaggedIncidents = () => {
    return incidents.filter(incident => incident.geospatialData);
  };

  // Method to trigger data ingestion manually
  const triggerDataIngestion = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('master-ingestion-orchestrator');
      
      if (error) throw error;
      
      toast({
        title: 'Data Ingestion Triggered',
        description: `Processing data from ${data?.processed_sources || 0} sources`,
      });
      
      // Refresh data after a delay to allow processing
      setTimeout(() => {
        refreshData();
      }, 5000);
      
      return data;
    } catch (err) {
      console.error('Error triggering data ingestion:', err);
      toast({
        title: 'Error',
        description: 'Failed to trigger data ingestion. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    provinces,
    incidents,
    loading,
    error,
    refreshData,
    getProvinceById,
    getIncidentsByProvince,
    addIncident,
    reportIncident,
    updateProvinceAlertLevel,
    getCorrelatedIncidents,
    getIncidentsByConfidence,
    getGeotaggedIncidents,
    triggerDataIngestion
  };
}
