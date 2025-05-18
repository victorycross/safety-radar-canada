
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
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
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
          source: incident.source as IncidentSource, // Cast to ensure type compatibility
          verificationStatus: incident.verification_status as VerificationStatus,
          recommendedAction: incident.recommended_action || undefined
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
    updateProvinceAlertLevel
  };
}
