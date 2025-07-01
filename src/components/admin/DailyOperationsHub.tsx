
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Play, 
  RefreshCw, 
  Settings, 
  AlertTriangle, 
  ChevronDown,
  Zap,
  Shield,
  Database
} from 'lucide-react';
import { useCommandCenterOperations } from './command-center/useCommandCenterOperations';

const DailyOperationsHub = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
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
        <h2 className="text-2xl font-bold">Daily Operations Hub</h2>
        <p className="text-muted-foreground">
          Your command center for daily system operations and monitoring
        </p>
      </div>

      {/* Quick Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Activity className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Status</p>
              <p className="text-lg font-bold text-green-600">Operational</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Database className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data Pipeline</p>
              <Badge variant="default">Ready</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Shield className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Security</p>
              <Badge variant="secondary">All Clear</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
              <p className="text-lg font-bold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Essential Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Most commonly used operations for daily management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={testDataPipeline}
              disabled={operations.testPipeline.loading}
              className="h-20 flex-col gap-2"
            >
              {operations.testPipeline.loading ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                <Play className="h-6 w-6" />
              )}
              <div className="text-center">
                <div className="font-medium">Test Data Pipeline</div>
                <div className="text-xs opacity-75">Validate end-to-end flow</div>
              </div>
            </Button>

            <Button 
              onClick={processQueueNow}
              disabled={operations.processQueue.loading}
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              {operations.processQueue.loading ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                <Database className="h-6 w-6" />
              )}
              <div className="text-center">
                <div className="font-medium">Process Queue</div>
                <div className="text-xs opacity-75">Clear pending items</div>
              </div>
            </Button>

            <Button 
              onClick={reDiagnoseSystem}
              disabled={operations.reDiagnose.loading}
              variant="outline"
              className="h-20 flex-col gap-2"
            >
              {operations.reDiagnose.loading ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                <Activity className="h-6 w-6" />
              )}
              <div className="text-center">
                <div className="font-medium">System Check</div>
                <div className="text-xs opacity-75">Run diagnostics</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Operations - Collapsible */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Advanced Operations
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Operations</CardTitle>
              <CardDescription>Advanced system management functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={setupAutomation}
                  disabled={operations.setupAutomation.loading}
                  variant="outline"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Setup Automation
                </Button>

                <Button 
                  onClick={testAPIConnectivity}
                  disabled={operations.testAPI.loading}
                  variant="outline"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  Test API Connectivity
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Quick Tips */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Daily Routine:</strong> Start with "System Check" to validate system health, 
          then use "Test Data Pipeline" if you need to verify data flow. 
          Use "Process Queue" if you notice stuck items in monitoring.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DailyOperationsHub;
