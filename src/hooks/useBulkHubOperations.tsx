
import { useState } from 'react';
import { InternationalHub } from '@/types/dashboard';
import { BulkOperationResult } from '@/types/bulkOperations';
import { useBulkHubActivation } from './useBulkHubActivation';
import { useBulkEmployeeUpdates } from './useBulkEmployeeUpdates';
import { useHubDataExport } from './useHubDataExport';
import { performBulkUpdate } from '@/utils/bulkOperationUtils';

export const useBulkHubOperations = () => {
  const [loading, setLoading] = useState(false);
  
  const { bulkActivateHubs, bulkDeactivateHubs } = useBulkHubActivation();
  const { bulkUpdateEmployeeCounts } = useBulkEmployeeUpdates();
  const { exportHubData } = useHubDataExport();

  const performBulkUpdateWrapper = async (
    hubIds: string[],
    updates: Partial<InternationalHub>
  ): Promise<BulkOperationResult> => {
    setLoading(true);
    try {
      return await performBulkUpdate(hubIds, updates);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    performBulkUpdate: performBulkUpdateWrapper,
    bulkActivateHubs,
    bulkDeactivateHubs,
    bulkUpdateEmployeeCounts,
    exportHubData
  };
};
