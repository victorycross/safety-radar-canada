
import { useState, useCallback, useMemo } from 'react';
import { UniversalAlert } from '@/types/alerts';
import { useToast } from '@/hooks/use-toast';

interface AlertFilters {
  source?: string;
  severity?: string;
  area?: string;
  provinceId?: string;
  hubId?: string;
}

export const useAlertManagement = (alerts: UniversalAlert[]) => {
  const [filters, setFilters] = useState<AlertFilters>({});
  const [selectedAlert, setSelectedAlert] = useState<UniversalAlert | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { toast } = useToast();

  // Filter alerts based on current filters
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (filters.source && !alert.source.toLowerCase().includes(filters.source.toLowerCase())) {
        return false;
      }
      if (filters.severity && alert.severity !== filters.severity) {
        return false;
      }
      if (filters.area && filters.area !== 'all' && alert.area !== filters.area) {
        return false;
      }
      return true;
    });
  }, [alerts, filters]);

  // Open alert detail modal
  const openAlertDetail = useCallback((alert: UniversalAlert) => {
    setSelectedAlert(alert);
    setIsDetailModalOpen(true);
  }, []);

  // Close alert detail modal
  const closeAlertDetail = useCallback(() => {
    setSelectedAlert(null);
    setIsDetailModalOpen(false);
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters: Partial<AlertFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Archive alert (placeholder - would need backend implementation)
  const archiveAlert = useCallback(async (alertId: string, reason: string) => {
    try {
      // TODO: Implement actual archive API call
      console.log('Archiving alert:', alertId, 'Reason:', reason);
      
      toast({
        title: 'Alert Archived',
        description: 'The alert has been successfully archived.',
      });
    } catch (error) {
      console.error('Error archiving alert:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive the alert. Please try again.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Get alerts for specific location
  const getAlertsForLocation = useCallback((type: 'province' | 'hub', locationId: string) => {
    return alerts.filter(alert => {
      // This would need to be enhanced based on how location data is stored in alerts
      if (type === 'province') {
        return alert.area && alert.area.toLowerCase().includes(locationId.toLowerCase());
      }
      return false; // Hub filtering would need location mapping
    });
  }, [alerts]);

  return {
    filteredAlerts,
    selectedAlert,
    isDetailModalOpen,
    filters,
    openAlertDetail,
    closeAlertDetail,
    updateFilters,
    clearFilters,
    archiveAlert,
    getAlertsForLocation
  };
};
