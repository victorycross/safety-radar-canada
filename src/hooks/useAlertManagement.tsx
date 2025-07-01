
import { useState, useMemo } from 'react';
import { UniversalAlert } from '@/types/alerts';
import { useToast } from '@/hooks/use-toast';

export const useAlertManagement = (alerts: UniversalAlert[]) => {
  const [selectedAlert, setSelectedAlert] = useState<UniversalAlert | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [filters, setFilters] = useState<{
    severity?: string;
    source?: string;
    area?: string;
    provinceId?: string;
    hubId?: string;
  }>({});
  const { toast } = useToast();

  // Filter alerts based on current filters
  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (filters.severity && alert.severity !== filters.severity) return false;
      if (filters.source && alert.source !== filters.source) return false;
      if (filters.area && alert.area !== filters.area) return false;
      // Additional province/hub filtering could be added here if needed
      return true;
    });
  }, [alerts, filters]);

  const openAlertDetail = (alert: UniversalAlert) => {
    setSelectedAlert(alert);
    setIsDetailModalOpen(true);
  };

  const closeAlertDetail = () => {
    setSelectedAlert(null);
    setIsDetailModalOpen(false);
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const archiveAlert = async (alertId: string, reason: string) => {
    try {
      // Find the alert by ID for display purposes
      const alert = alerts.find(a => a.id === alertId);
      const alertTitle = alert?.title || 'Alert';
      
      // Implementation would depend on the alert source and archiving mechanism
      toast({
        title: 'Alert Archived',
        description: `Alert "${alertTitle}" has been archived.`,
      });
      closeAlertDetail();
    } catch (error) {
      toast({
        title: 'Archive Failed',
        description: 'Failed to archive the alert. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return {
    filteredAlerts,
    selectedAlert,
    isDetailModalOpen,
    filters,
    openAlertDetail,
    closeAlertDetail,
    updateFilters,
    clearFilters,
    archiveAlert
  };
};
