
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TestTube, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Database,
  Activity
} from 'lucide-react';

interface FeedTesterProps {
  feedConfig: any;
  testResults: any;
  testing: boolean;
  onTest: () => void;
}

const FeedTester: React.FC<FeedTesterProps> = ({
  feedConfig,
  testResults,
  testing,
  onTest
}) => {
  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {getStatusIcon(success)}
        <span className="ml-1">{success ? 'Success' : 'Failed'}</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <TestTube className="h-5 w-5 mr-2" />
          Feed Testing & Validation
        </h3>
        <p className="text-sm text-muted-foreground">
          Test your feed configuration and validate the data normalization before saving.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connection Test</CardTitle>
          <CardDescription>
            Verify that the feed endpoint is accessible and returns valid data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Feed Endpoint</p>
              <p className="text-sm text-muted-foreground break-all">
                {feedConfig.apiEndpoint || 'No endpoint configured'}
              </p>
            </div>
            <Button 
              onClick={onTest} 
              disabled={testing || !feedConfig.apiEndpoint}
              size="sm"
            >
              {testing ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>
          </div>

          {!feedConfig.apiEndpoint && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please configure an API endpoint in the Basic Info tab before testing.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              Test Results
              {getStatusBadge(testResults.success)}
            </CardTitle>
            <CardDescription>
              Connection test completed on {new Date().toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Response Time</p>
                  <p className="text-sm text-muted-foreground">{testResults.responseTime}ms</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Records Found</p>
                  <p className="text-sm text-muted-foreground">{testResults.recordsFound}</p>
                </div>
              </div>
            </div>

            {testResults.success && testResults.sampleData && (
              <div>
                <h4 className="font-medium mb-2">Sample Data Preview</h4>
                <Card className="bg-muted">
                  <CardContent className="p-4">
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Title:</strong> {testResults.sampleData.title}
                      </div>
                      <div>
                        <strong>Description:</strong> {testResults.sampleData.description}
                      </div>
                      <div>
                        <strong>Severity:</strong> 
                        <Badge variant="outline" className="ml-2">
                          {testResults.sampleData.severity}
                        </Badge>
                      </div>
                      <div>
                        <strong>Published:</strong> {new Date(testResults.sampleData.published).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {!testResults.success && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Connection test failed. Please check your endpoint URL and ensure the service is accessible.
                  Common issues include incorrect URLs, authentication requirements, or network connectivity problems.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Normalization Preview</CardTitle>
          <CardDescription>
            Preview how the data will be normalized to UniversalAlert format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Title Field:</strong>
                <code className="ml-2 bg-muted px-1 rounded">
                  {feedConfig.normalization.titleField || 'Not mapped'}
                </code>
              </div>
              <div>
                <strong>Description Field:</strong>
                <code className="ml-2 bg-muted px-1 rounded">
                  {feedConfig.normalization.descriptionField || 'Not mapped'}
                </code>
              </div>
              <div>
                <strong>Severity Field:</strong>
                <code className="ml-2 bg-muted px-1 rounded">
                  {feedConfig.normalization.severityField || 'Not mapped'}
                </code>
              </div>
              <div>
                <strong>Published Field:</strong>
                <code className="ml-2 bg-muted px-1 rounded">
                  {feedConfig.normalization.publishedField || 'Not mapped'}
                </code>
              </div>
            </div>

            {(!feedConfig.normalization.titleField || 
              !feedConfig.normalization.descriptionField || 
              !feedConfig.normalization.severityField || 
              !feedConfig.normalization.publishedField) && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Some required fields are not mapped. Please configure field mappings 
                  in the Field Mapping tab to ensure proper normalization.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedTester;
