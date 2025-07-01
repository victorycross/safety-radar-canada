
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TestTube, Activity, CheckCircle, Database } from 'lucide-react';

interface TestingValidationSectionProps {
  operations: any;
  onTestFeed: () => void;
  onTestAPI: () => void;
}

const TestingValidationSection: React.FC<TestingValidationSectionProps> = ({
  operations,
  onTestFeed,
  onTestAPI
}) => {
  return (
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
            onClick={onTestFeed}
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
            onClick={onTestAPI}
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
  );
};

export default TestingValidationSection;
