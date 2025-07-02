
import { useEffect, useState } from 'react';
import { InternationalHub, HubIncident } from '@/types/dashboard';
import { AlertLevel } from '@/types';
import { logger } from '@/utils/logger';
import { 
  fetchInternationalHubs, 
  fetchHubIncidents, 
  getHubById, 
  getIncidentsByHub,
  addHubIncident,
  updateHubAlertLevel,
  syncHubIncidentCounts,
  validateHubDataConsistency
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
      
      // First sync the hub incident counts to ensure consistency
      await syncHubIncidentCounts();
      
      const [hubsData, incidentsData] = await Promise.all([
        fetchInternationalHubs(),
        fetchHubIncidents()
      ]);

      // Validate data consistency and log any issues
      const validation = await validateHubDataConsistency();
      if (!validation.isConsistent) {
        logger.warn('Hub data consistency issues detected', {
          discrepancies: validation.discrepancies
        });
        
        // Show a toast for admins about data inconsistencies
        toast({
          title: 'Data Sync Notice',
          description: `${validation.discrepancies.length} hub(s) have inconsistent incident counts. Data has been synchronized.`,
          variant: 'default'
        });
      }

      setState({
        hubs: hubsData,
        incidents: incidentsData,
        loading: false,
        error: null
      });

      logger.info('useHubData: Data refreshed successfully', {
        hubsCount: hubsData.length,
        incidentsCount: incidentsData.length,
        consistencyCheck: validation.isConsistent
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

  // Get hubs with alerts (based on actual incident counts, not stale database field)
  const alertHubs = state.hubs.filter(hub => {
    const hubIncidents = getIncidentsByHub(state.incidents, hub.id);
    const hasActiveIncidents = hubIncidents.some(incident => 
      incident.alertLevel === AlertLevel.SEVERE || incident.alertLevel === AlertLevel.WARNING
    );
    return hasActiveIncidents || hub.alertLevel === AlertLevel.SEVERE || hub.alertLevel === AlertLevel.WARNING;
  });

  // Aggregate metrics with real-time calculations
  const metrics = {
    totalHubs: state.hubs.length,
    alertHubsCount: alertHubs.length,
    hubEmployeesCount: state.hubs.reduce((sum, hub) => sum + hub.employeeCount, 0),
    totalIncidents: state.incidents.length,
    activeIncidentsByHub: state.hubs.reduce((acc, hub) => {
      acc[hub.id] = getIncidentsByHub(state.incidents, hub.id).length;
      return acc;
    }, {} as Record<string, number>)
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
    updateAlertLevel,
    // Expose validation for admin interfaces
    validateDataConsistency: validateHubDataConsistency,
    syncIncidentCounts: syncHubIncidentCounts
  };
};
