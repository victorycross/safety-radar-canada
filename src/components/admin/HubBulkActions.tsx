
import React from 'react';
import FileImportSection from './bulk-actions/FileImportSection';
import BulkEmployeeUpdateSection from './bulk-actions/BulkEmployeeUpdateSection';
import QuickActionsSection from './bulk-actions/QuickActionsSection';

interface HubBulkActionsProps {
  onImportComplete: () => void;
}

const HubBulkActions: React.FC<HubBulkActionsProps> = ({ onImportComplete }) => {
  return (
    <div className="space-y-6">
      <FileImportSection onImportComplete={onImportComplete} />
      <BulkEmployeeUpdateSection onUpdateComplete={onImportComplete} />
      <QuickActionsSection />
    </div>
  );
};

export default HubBulkActions;
