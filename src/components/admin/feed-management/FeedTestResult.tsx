
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface FeedTestResultProps {
  testResult: any;
}

const FeedTestResult: React.FC<FeedTestResultProps> = ({ testResult }) => {
  if (!testResult) return null;

  return (
    <Alert variant={testResult.success ? "default" : "destructive"}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="text-sm">
        Last test: {testResult.success ? 'Success' : 'Failed'} - 
        {testResult.success && ` ${testResult.recordsFound} records in ${testResult.responseTime}ms`}
        <br />
        <span className="text-xs text-muted-foreground">
          {new Date(testResult.timestamp).toLocaleString()}
        </span>
      </AlertDescription>
    </Alert>
  );
};

export default FeedTestResult;
