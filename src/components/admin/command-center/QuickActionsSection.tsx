
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, PlayCircle, Settings, RefreshCw } from 'lucide-react';

interface QuickActionsSectionProps {
  operations: any;
  onTestPipeline: () => void;
  onProcessQueue: () => void;
  onSetupAutomation: () => void;
  onReDiagnose: () => void;
}

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  operations,
  onTestPipeline,
  onProcessQueue,
  onSetupAutomation,
  onReDiagnose
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Immediate actions for testing and managing the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={onTestPipeline} 
            disabled={operations.testingPipeline}
            className="h-auto flex-col items-center gap-2 p-4"
          >
            <Zap className={`h-6 w-6 ${operations.testingPipeline ? 'animate-pulse' : ''}`} />
            <div className="text-center">
              <div className="font-medium">Test Data Pipeline</div>
              <div className="text-xs opacity-75">End-to-end test</div>
            </div>
          </Button>

          <Button 
            onClick={onProcessQueue} 
            disabled={operations.processingQueue}
            variant="outline"
            className="h-auto flex-col items-center gap-2 p-4"
          >
            <PlayCircle className={`h-6 w-6 ${operations.processingQueue ? 'animate-pulse' : ''}`} />
            <div className="text-center">
              <div className="font-medium">Process Queue Now</div>
              <div className="text-xs opacity-75">Clear backlog</div>
            </div>
          </Button>

          <Button 
            onClick={onSetupAutomation} 
            disabled={operations.settingUpCron}
            variant="outline"
            className="h-auto flex-col items-center gap-2 p-4"
          >
            <Settings className={`h-6 w-6 ${operations.settingUpCron ? 'animate-pulse' : ''}`} />
            <div className="text-center">
              <div className="font-medium">Setup Automation</div>
              <div className="text-xs opacity-75">Configure cron jobs</div>
            </div>
          </Button>

          <Button 
            onClick={onReDiagnose} 
            disabled={operations.diagnosing}
            variant="outline"
            className="h-auto flex-col items-center gap-2 p-4"
          >
            <RefreshCw className={`h-6 w-6 ${operations.diagnosing ? 'animate-spin' : ''}`} />
            <div className="text-center">
              <div className="font-medium">Re-diagnose System</div>
              <div className="text-xs opacity-75">Full health check</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsSection;
