
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InternationalHub } from '@/types/dashboard';
import HubSelectionHeader from './bulk-operations/HubSelectionHeader';
import HubList from './bulk-operations/HubList';
import { useBulkOperationsLogic } from './bulk-operations/useBulkOperationsLogic';

interface BulkHubOperationsProps {
  hubs: InternationalHub[];
  onBulkUpdate: (hubIds: string[], updates: Partial<InternationalHub>) => Promise<void>;
  onRefresh: () => void;
}

const BulkHubOperations: React.FC<BulkHubOperationsProps> = ({
  hubs,
  onBulkUpdate,
  onRefresh
}) => {
  const {
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
  } = useBulkOperationsLogic({ hubs, onBulkUpdate, onRefresh });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Hub Operations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <HubSelectionHeader
          selectedCount={selectedHubs.size}
          totalCount={hubs.length}
          allSelected={allSelected}
          someSelected={someSelected}
          bulkAction={bulkAction}
          bulkAlertLevel={bulkAlertLevel}
          loading={loading}
          onSelectAll={handleSelectAll}
          onBulkActionChange={setBulkAction}
          onAlertLevelChange={setBulkAlertLevel}
          onApplyAction={handleBulkAction}
        />

        <HubList
          hubs={hubs}
          selectedHubs={selectedHubs}
          onToggleHub={handleSelectHub}
        />
      </CardContent>
    </Card>
  );
};

export default BulkHubOperations;
