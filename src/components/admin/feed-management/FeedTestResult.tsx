
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface TestResult {
  success: boolean;
  responseTime: number;
  recordsFound: number;
  timestamp: string;
  statusCode?: number;
  error?: string | null;
}

interface FeedTestResultProps {
  testResult: TestResult | null;
}

const FeedTestResult: React.FC<FeedTestResultProps> = ({ testResult }) => {
  if (!testResult) return null;

  const getStatusIcon = () => {
    if (testResult.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Alert variant={testResult.success ? 'default' : 'destructive'}>
      <div className="flex items-start space-x-2">
        {getStatusIcon()}
        <div className="flex-1 space-y-2">
          <AlertDescription>
            <div className="font-medium">
              Test {testResult.success ? 'Successful' : 'Failed'}
            </div>
            <div className="text-sm space-y-1 mt-2">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{testResult.responseTime}ms</span>
                </div>
                {testResult.statusCode && (
                  <Badge variant="outline" className="text-xs">
                    HTTP {testResult.statusCode}
                  </Badge>
                )}
                <Badge variant={testResult.recordsFound > 0 ? 'default' : 'secondary'} className="text-xs">
                  {testResult.recordsFound} records
                </Badge>
              </div>
              {testResult.error && (
                <div className="text-red-600 text-xs mt-1">
                  {testResult.error}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Tested at {formatTimestamp(testResult.timestamp)}
              </div>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default FeedTestResult;
