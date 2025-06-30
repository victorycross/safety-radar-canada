
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { InternationalHub } from '@/types/dashboard';
import { AlertLevel } from '@/types';

interface UseBulkOperationsLogicProps {
  hubs: InternationalHub[];
  onBulkUpdate: (hubIds: string[], updates: Partial<InternationalHub>) => Promise<void>;
  onRefresh: () => void;
}

export const useBulkOperationsLogic = ({
  hubs,
  onBulkUpdate,
  onRefresh
}: UseBulkOperationsLogicProps) => {
  const [selectedHubs, setSelectedHubs] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkAlertLevel, setBulkAlertLevel] = useState<AlertLevel>(AlertLevel.NORMAL);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSelectAll = () => {
    if (selectedHubs.size === hubs.length) {
      setSelectedHubs(new Set());
    } else {
      setSelectedHubs(new Set(hubs.map(h => h.id)));
    }
  };

  const handleSelectHub = (hubId: string) => {
    const newSelected = new Set(selectedHubs);
    if (newSelected.has(hubId)) {
      newSelected.delete(hubId);
    } else {
      newSelected.add(hubId);
    }
    setSelectedHubs(newSelected);
  };

  const handleExportData = () => {
    const selectedHubData = hubs.filter(h => selectedHubs.has(h.id));
    const csvContent = [
      'Name,Country,Code,Alert Level,Employee Count,Active Status',
      ...selectedHubData.map(h => 
        `"${h.name}","${h.country}","${h.code}","${h.alertLevel}",${h.employeeCount},${h.isActive}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hub_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `Exported data for ${selectedHubs.size} hubs`,
    });
  };

  const handleBulkAction = async () => {
    if (selectedHubs.size === 0 || !bulkAction) return;

    setLoading(true);
    try {
      const hubIds = Array.from(selectedHubs);
      
      switch (bulkAction) {
        case 'activate':
          await onBulkUpdate(hubIds, { isActive: true });
          toast({
            title: 'Hubs Activated',
            description: `Successfully activated ${hubIds.length} hubs`,
          });
          break;
        case 'deactivate':
          await onBulkUpdate(hubIds, { isActive: false });
          toast({
            title: 'Hubs Deactivated',
            description: `Successfully deactivated ${hubIds.length} hubs`,
          });
          break;
        case 'update_alert':
          await onBulkUpdate(hubIds, { alertLevel: bulkAlertLevel });
          toast({
            title: 'Alert Levels Updated',
            description: `Updated alert level for ${hubIds.length} hubs`,
          });
          break;
        case 'export':
          handleExportData();
          break;
      }
      
      setSelectedHubs(new Set());
      setBulkAction('');
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform bulk operation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const allSelected = selectedHubs.size === hubs.length && hubs.length > 0;
  const someSelected = selectedHubs.size > 0 && selectedHubs.size < hubs.length;

  return {
    selectedHubs,
    bulkAction,
    bulkAlertLevel,
    loading,
    allSelected,
    someSelected,
    handleSelectAll,
    handleSelectHub,
    handleBulkAction,
    setBulkAction,
    setBulkAlertLevel
  };
};
