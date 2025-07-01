
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { useCommandCenterOperations } from './command-center/useCommandCenterOperations';
import QuickActionsSection from './command-center/QuickActionsSection';
import SystemOperationsSection from './command-center/SystemOperationsSection';
import TestingValidationSection from './command-center/TestingValidationSection';
import StatusOverviewSection from './command-center/StatusOverviewSection';

const CommandCenterTab = () => {
  const {
    operations,
    testDataPipeline,
    processQueueNow,
    setupAutomation,
    reDiagnoseSystem,
    testAPIConnectivity,
    testFeedValidation
  } = useCommandCenterOperations();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Command Center</h2>
        <p className="text-muted-foreground">
          Centralized hub for all administrative operations, testing, and system management
        </p>
      </div>

      <QuickActionsSection
        operations={operations}
        onTestPipeline={testDataPipeline}
        onProcessQueue={processQueueNow}
        onSetupAutomation={setupAutomation}
        onReDiagnose={reDiagnoseSystem}
      />

      <SystemOperationsSection />

      <TestingValidationSection
        operations={operations}
        onTestFeed={testFeedValidation}
        onTestAPI={testAPIConnectivity}
      />

      <StatusOverviewSection />

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Quick Tips:</strong> Start with "Test Data Pipeline" to validate end-to-end functionality. 
          Use "Process Queue Now" if you see stuck items in diagnostics. 
          Set up automation last to ensure everything works manually first.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default CommandCenterTab;
