
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchProvinces, updateProvinceAlertLevel, syncProvinceAlertLevels } from '@/services/provincesService';
import { fetchIncidents, addIncident, reportIncident } from '@/services/incidentsService';
import { Province, Incident, AlertLevel } from '@/types';

interface UseSupabaseActionsProps {
  setProvinces: (provinces: Province[]) => void;
  setIncidents: (incidents: Incident[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  provinces: Province[];
}

export const useSupabaseActions = ({
  setProvinces,
  setIncidents,
  setLoading,
  setError,
  provinces
}: UseSupabaseActionsProps) => {
  const { toast } = useToast();

  const loadProvinces = async () => {
    try {
      const provincesData = await fetchProvinces();
      setProvinces(provincesData);
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

  const loadIncidents = async () => {
    try {
      const incidentsData = await fetchIncidents();
      setIncidents(incidentsData);
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
      // First sync province alert levels to ensure consistency
      await syncProvinceAlertLevels();
      await Promise.all([loadProvinces(), loadIncidents()]);
    } catch (err) {
      console.error('Error during data refresh:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncident = async (incidentData: Omit<Incident, 'id' | 'timestamp'>) => {
    try {
      await addIncident(incidentData);
      
      toast({
        title: 'Incident Added',
        description: 'A new security incident has been recorded.',
      });
      
      await refreshData();
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

  const handleReportIncident = async (incidentData: Omit<Incident, 'id' | 'timestamp'>) => {
    try {
      await reportIncident(incidentData);
      
      toast({
        title: 'Report Submitted',
        description: 'Thank you for your report. It will be reviewed by our team.',
      });
      
      await refreshData();
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

  const handleUpdateProvinceAlertLevel = async (provinceId: string, alertLevel: AlertLevel) => {
    try {
      await updateProvinceAlertLevel(provinceId, alertLevel);
      
      toast({
        title: 'Alert Level Updated',
        description: `Alert level for ${provinces.find(p => p.id === provinceId)?.name} has been updated.`,
      });
      
      await refreshData();
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

  const handleTriggerDataIngestion = async () => {
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
    loadProvinces,
    loadIncidents,
    refreshData,
    handleAddIncident,
    handleReportIncident,
    handleUpdateProvinceAlertLevel,
    handleTriggerDataIngestion,
    // Expose synchronization for admin interfaces
    syncProvinceAlertLevels
  };
};
