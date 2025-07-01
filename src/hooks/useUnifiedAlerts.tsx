
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { unifiedAlertService } from '@/services/unifiedAlertService';
import { UniversalAlert } from '@/types/alerts';

export const useUnifiedAlerts = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [integrationEnabled, setIntegrationEnabled] = useState(true);
  const { toast } = useToast();

  const processAlertsToIncidents = useCallback(async (alerts: UniversalAlert[]) => {
    if (!integrationEnabled) return [];

    setIsProcessing(true);
    try {
      const processedIds = await unifiedAlertService.batchProcessAlerts(alerts);
      
      if (processedIds.length > 0) {
        toast({
          title: 'Alerts Integrated',
          description: `Successfully converted ${processedIds.length} external alerts to internal incidents`,
        });
      }

      return processedIds;
    } catch (error) {
      console.error('Error processing alerts:', error);
      toast({
        title: 'Integration Error',
        description: 'Failed to process some external alerts',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsProcessing(false);
    }
  }, [integrationEnabled, toast]);

  const toggleIntegration = useCallback(() => {
    setIntegrationEnabled(prev => !prev);
    toast({
      title: integrationEnabled ? 'Integration Disabled' : 'Integration Enabled',
      description: integrationEnabled 
        ? 'External alerts will no longer create internal incidents'
        : 'External alerts will now create internal incidents',
    });
  }, [integrationEnabled, toast]);

  return {
    isProcessing,
    integrationEnabled,
    processAlertsToIncidents,
    toggleIntegration
  };
};
