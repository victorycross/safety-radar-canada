
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BulkOperationResult } from '@/types/bulkOperations';
import { logger } from '@/utils/logger';

export const useBulkHubActivation = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const bulkActivateHubs = async (hubIds: string[]): Promise<BulkOperationResult> => {
    setLoading(true);
    const result: BulkOperationResult = {
      success: true,
      processed: 0,
      errors: []
    };

    try {
      logger.debug('Starting bulk hub activation', { hubIds });

      for (const hubId of hubIds) {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 100));
          result.processed++;
          
          logger.debug('Activated hub', { hubId });
        } catch (error) {
          const errorMsg = `Failed to activate hub ${hubId}: ${error}`;
          result.errors.push(errorMsg);
          logger.error('Hub activation failed', { hubId, error });
        }
      }

      if (result.errors.length > 0) {
        result.success = false;
      }

      if (result.success) {
        toast({
          title: 'Hubs Activated',
          description: `Successfully activated ${result.processed} hubs`,
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `Activated ${result.processed} hubs, ${result.errors.length} failed`,
          variant: 'destructive',
        });
      }

      logger.info('Bulk hub activation completed', result);
      return result;
    } catch (error) {
      logger.error('Bulk hub activation failed', error);
      result.success = false;
      result.errors.push('Bulk activation failed');
      
      toast({
        title: 'Activation Failed',
        description: 'Failed to activate hubs',
        variant: 'destructive',
      });

      return result;
    } finally {
      setLoading(false);
    }
  };

  const bulkDeactivateHubs = async (hubIds: string[]): Promise<BulkOperationResult> => {
    setLoading(true);
    const result: BulkOperationResult = {
      success: true,
      processed: 0,
      errors: []
    };

    try {
      logger.debug('Starting bulk hub deactivation', { hubIds });

      for (const hubId of hubIds) {
        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 100));
          result.processed++;
          
          logger.debug('Deactivated hub', { hubId });
        } catch (error) {
          const errorMsg = `Failed to deactivate hub ${hubId}: ${error}`;
          result.errors.push(errorMsg);
          logger.error('Hub deactivation failed', { hubId, error });
        }
      }

      if (result.errors.length > 0) {
        result.success = false;
      }

      if (result.success) {
        toast({
          title: 'Hubs Deactivated',
          description: `Successfully deactivated ${result.processed} hubs`,
        });
      } else {
        toast({
          title: 'Partial Success',
          description: `Deactivated ${result.processed} hubs, ${result.errors.length} failed`,
          variant: 'destructive',
        });
      }

      logger.info('Bulk hub deactivation completed', result);
      return result;
    } catch (error) {
      logger.error('Bulk hub deactivation failed', error);
      result.success = false;
      result.errors.push('Bulk deactivation failed');
      
      toast({
        title: 'Deactivation Failed',
        description: 'Failed to deactivate hubs',
        variant: 'destructive',
      });

      return result;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    bulkActivateHubs,
    bulkDeactivateHubs
  };
};
