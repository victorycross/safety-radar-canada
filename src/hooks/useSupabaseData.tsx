
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseState } from './useSupabaseState';
import { useSupabaseActions } from './useSupabaseActions';
import { useSupabaseHelpers } from './useSupabaseHelpers';

export function useSupabaseData() {
  const {
    provinces,
    setProvinces,
    incidents,
    setIncidents,
    loading,
    setLoading,
    error,
    setError
  } = useSupabaseState();

  const {
    refreshData,
    handleAddIncident,
    handleReportIncident,
    handleUpdateProvinceAlertLevel,
    handleTriggerDataIngestion
  } = useSupabaseActions({
    setProvinces,
    setIncidents,
    setLoading,
    setError,
    provinces
  });

  const {
    getProvinceById,
    getIncidentsByProvince,
    getCorrelatedIncidents,
    getIncidentsByConfidence,
    getGeotaggedIncidents
  } = useSupabaseHelpers(provinces, incidents);

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

  return {
    provinces,
    incidents,
    loading,
    error,
    refreshData,
    getProvinceById,
    getIncidentsByProvince,
    addIncident: handleAddIncident,
    reportIncident: handleReportIncident,
    updateProvinceAlertLevel: handleUpdateProvinceAlertLevel,
    getCorrelatedIncidents,
    getIncidentsByConfidence,
    getGeotaggedIncidents,
    triggerDataIngestion: handleTriggerDataIngestion
  };
}
