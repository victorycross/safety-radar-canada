
import { useEffect, useState } from 'react';
import { InternationalHub, HubIncident, AlertLevel } from '@/types';
import { logger } from '@/utils/logger';
import { 
  fetchInternationalHubs, 
  fetchHubIncidents, 
  getHubById, 
  getIncidentsByHub,
  addHubIncident,
  updateHubAlertLevel
} from '@/services/hubService';
import { useToast } from '@/hooks/use-toast';

interface HubDataState {
  hubs: InternationalHub[];
  incidents: HubIncident[];
  loading: boolean;
  error: string | null;
}

export const useHubData = () => {
  const [state, setState] = useState<HubDataState>({
    hubs: [],
    incidents: [],
    loading: true,
    error: null
  });
  const { toast } = useToast();

  const refreshData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.debug('useHubData: Refreshing hub data');
      
      const [hubsData, incidentsData] = await Promise.all([
        fetchInternationalHubs(),
        fetchHubIncidents()
      ]);

      setState({
        hubs: hubsData,
        incidents: incidentsData,
        loading: false,
        error: null
      });

      logger.info('useHubData: Data refreshed successfully', {
        hubsCount: hubsData.length,
        incidentsCount: incidentsData.length
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load hub data';
      logger.error('useHubData: Error refreshing data:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  };

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);

  // Helper functions
  const getHub = (hubId: string) => getHubById(state.hubs, hubId);
  
  const getHubIncidents = (hubId: string) => getIncidentsByHub(state.incidents, hubId);
  
  const addIncident = async (incidentData: Omit<HubIncident, 'id' | 'timestamp' | 'created_at' | 'updated_at'>) => {
    try {
      await addHubIncident(incidentData);
      toast({
        title: 'Incident Added',
        description: 'Hub incident has been recorded successfully.',
      });
      await refreshData();
    } catch (error) {
      logger.error('useHubData: Error adding incident:', error);
      toast({
        title: 'Error',
        description: 'Failed to add incident. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateAlertLevel = async (hubId: string, alertLevel: AlertLevel) => {
    try {
      await updateHubAlertLevel(hubId, alertLevel);
      const hub = getHub(hubId);
      toast({
        title: 'Alert Level Updated',
        description: `Alert level for ${hub?.name} has been updated.`,
      });
      await refreshData();
    } catch (error) {
      logger.error('useHubData: Error updating alert level:', error);
      toast({
        title: 'Error',
        description: 'Failed to update alert level. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Get hubs with alerts
  const alertHubs = state.hubs.filter(hub => 
    hub.alertLevel === AlertLevel.SEVERE || hub.alertLevel === AlertLevel.WARNING
  );

  // Aggregate metrics
  const metrics = {
    totalHubs: state.hubs.length,
    alertHubsCount: alertHubs.length,
    hubEmployeesCount: state.hubs.reduce((sum, hub) => sum + hub.employeeCount, 0),
    totalIncidents: state.incidents.length
  };

  return {
    hubs: state.hubs,
    incidents: state.incidents,
    alertHubs,
    loading: state.loading,
    error: state.error,
    metrics,
    refreshData,
    getHub,
    getHubIncidents,
    addIncident,
    updateAlertLevel
  };
};
