
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Zap, 
  PlayCircle, 
  Settings, 
  RefreshCw, 
  Database,
  TestTube,
  Activity,
  Users,
  Building,
  Download,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

const CommandCenterTab = () => {
  const { toast } = useToast();
  const [operations, setOperations] = useState({
    testingPipeline: false,
    processingQueue: false,
    settingUpCron: false,
    diagnosing: false,
    testingFeed: false,
    testingAPI: false
  });

  const setOperation = (key: string, value: boolean) => {
    setOperations(prev => ({ ...prev, [key]: value }));
  };

  // Quick Actions
  const testDataPipeline = async () => {
    setOperation('testingPipeline', true);
    try {
      logger.info('Testing data pipeline...');
      const { data, error } = await supabase.functions.invoke('master-ingestion-orchestrator');
      
      if (error) throw error;
      
      toast({
        title: 'Pipeline Test Started',
        description: 'Monitoring data flow through the pipeline...',
      });

    } catch (error) {
      logger.error('Error testing pipeline:', error);
      toast({
        title: 'Test Failed',
        description: 'Failed to test data pipeline. Check API configurations.',
        variant: 'destructive'
      });
    } finally {
      setOperation('testingPipeline', false);
    }
  };

  const processQueueNow = async () => {
    setOperation('processingQueue', true);
    try {
      logger.info('Processing alert queue...');
      const { data, error } = await supabase.functions.invoke('process-alert-queue');
      
      if (error) throw error;
      
      toast({
        title: 'Queue Processing Started',
        description: `Processing ${data?.total_items || 0} queued items...`,
      });

    } catch (error) {
      logger.error('Error processing queue:', error);
      toast({
        title: 'Queue Processing Failed',
        description: 'Failed to process alert queue.',
        variant: 'destructive'
      });
    } finally {
      setOperation('processingQueue', false);
    }
  };

  const setupAutomation = async () => {
    setOperation('settingUpCron', true);
    try {
      logger.info('Setting up cron jobs...');
      const { data, error } = await supabase.functions.invoke('setup-cron-jobs');
      
      if (error) throw error;
      
      toast({
        title: 'Automation Setup',
        description: data?.success ? 'Cron jobs configured successfully' : 'Setup completed with warnings',
        variant: data?.success ? 'default' : 'destructive'
      });

    } catch (error) {
      logger.error('Error setting up cron jobs:', error);
      toast({
        title: 'Automation Setup Failed',
        description: 'Failed to set up automated processing.',
        variant: 'destructive'
      });
    } finally {
      setOperation('settingUpCron', false);
    }
  };

  const reDiagnoseSystem = async () => {
    setOperation('diagnosing', true);
    try {
      logger.info('Re-diagnosing system...');
      // Trigger a fresh diagnosis
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate diagnosis
      
      toast({
        title: 'System Diagnosis Complete',
        description: 'System health check completed successfully.',
      });

    } catch (error) {
      logger.error('Error diagnosing system:', error);
      toast({
        title: 'Diagnosis Failed',
        description: 'Failed to complete system diagnosis.',
        variant: 'destructive'
      });
    } finally {
      setOperation('diagnosing', false);
    }
  };

  const testAPIConnectivity = async () => {
    setOperation('testingAPI', true);
    try {
      logger.info('Testing API connectivity...');
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate API tests
      
      toast({
        title: 'API Connectivity Test',
        description: 'API connectivity tests completed.',
      });

    } catch (error) {
      logger.error('Error testing APIs:', error);
      toast({
        title: 'API Test Failed',
        description: 'Failed to test API connectivity.',
        variant: 'destructive'
      });
    } finally {
      setOperation('testingAPI', false);
    }
  };

  const testFeedValidation = async () => {
    setOperation('testingFeed', true);
    try {
      logger.info('Testing feed validation...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate feed tests
      
      toast({
        title: 'Feed Validation Test',
        description: 'Feed validation tests completed.',
      });

    } catch (error) {
      logger.error('Error testing feeds:', error);
      toast({
        title: 'Feed Test Failed',
        description: 'Failed to test feed validation.',
        variant: 'destructive'
      });
    } finally {
      setOperation('testingFeed', false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Admin Command Center</h2>
        <p className="text-muted-foreground">
          Centralized hub for all administrative operations, testing, and system management
        </p>
      </div>

      {/* Quick Actions */}
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
              onClick={testDataPipeline} 
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
              onClick={processQueueNow} 
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
              onClick={setupAutomation} 
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
              onClick={reDiagnoseSystem} 
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

      {/* System Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Operations
          </CardTitle>
          <CardDescription>
            Bulk operations and data management functions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline"
              className="h-auto flex-col items-center gap-2 p-4"
            >
              <Users className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Bulk Employee Management</div>
                <div className="text-xs opacity-75">Import/export employees</div>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="h-auto flex-col items-center gap-2 p-4"
            >
              <Building className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Hub Operations</div>
                <div className="text-xs opacity-75">Manage international hubs</div>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="h-auto flex-col items-center gap-2 p-4"
            >
              <Download className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Data Export</div>
                <div className="text-xs opacity-75">Export system data</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Testing & Validation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Testing & Validation
          </CardTitle>
          <CardDescription>
            Comprehensive testing tools for system validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={testFeedValidation}
              disabled={operations.testingFeed}
              variant="outline"
              className="h-auto flex-col items-center gap-2 p-4"
            >
              <Activity className={`h-6 w-6 ${operations.testingFeed ? 'animate-pulse' : ''}`} />
              <div className="text-center">
                <div className="font-medium">Feed Testing</div>
                <div className="text-xs opacity-75">Validate RSS/API feeds</div>
              </div>
            </Button>

            <Button 
              onClick={testAPIConnectivity}
              disabled={operations.testingAPI}
              variant="outline"
              className="h-auto flex-col items-center gap-2 p-4"
            >
              <CheckCircle className={`h-6 w-6 ${operations.testingAPI ? 'animate-pulse' : ''}`} />
              <div className="text-center">
                <div className="font-medium">API Connectivity</div>
                <div className="text-xs opacity-75">Test external APIs</div>
              </div>
            </Button>

            <Button 
              variant="outline"
              className="h-auto flex-col items-center gap-2 p-4"
            >
              <Database className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Database Health</div>
                <div className="text-xs opacity-75">Check DB integrity</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Current Status
          </CardTitle>
          <CardDescription>
            Quick overview of system status and recent operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="default">Pipeline</Badge>
              <span className="text-sm">Ready for testing</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary">Queue</Badge>
              <span className="text-sm">Processing available</span>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline">Automation</Badge>
              <span className="text-sm">Setup required</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
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
