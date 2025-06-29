
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Clock, AlertTriangle, Activity } from "lucide-react";
import { EnhancedSource } from "./EnhancedSourceCard";

interface SourceTestResultsProps {
  results: any;
  isLoading: boolean;
  source: EnhancedSource;
}

const SourceTestResults: React.FC<SourceTestResultsProps> = ({
  results,
  isLoading,
  source
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 animate-spin" />
              <div>
                <p className="font-medium">Testing connection...</p>
                <p className="text-sm text-muted-foreground">
                  Validating endpoint and authentication
                </p>
              </div>
            </div>
            <Progress value={75} className="mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">Ready to Test</p>
              <p className="text-muted-foreground">
                Click "Run Test" to validate the connection settings
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSuccess = results.connectionStatus === 'success';

  return (
    <div className="space-y-4">
      {/* Test Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isSuccess ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            Connection Test {isSuccess ? 'Successful' : 'Failed'}
          </CardTitle>
          <CardDescription>
            Test completed at {new Date(results.timestamp).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {results.responseTime}ms
              </div>
              <div className="text-sm text-muted-foreground">Response Time</div>
            </div>
            
            <div className="text-center">
              <Badge variant={isSuccess ? "default" : "destructive"}>
                {results.connectionStatus}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">Status</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold">
                {results.dataReceived ? '✓' : '✗'}
              </div>
              <div className="text-sm text-muted-foreground">Data Received</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {source.uptime}%
              </div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Details */}
      {results.lastError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {results.lastError}
          </AlertDescription>
        </Alert>
      )}

      {/* Test Details */}
      <Card>
        <CardHeader>
          <CardTitle>Test Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Endpoint</span>
              <span className="text-sm text-muted-foreground">{source.route || 'Not configured'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Source Type</span>
              <Badge variant="outline">{source.type}</Badge>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm font-medium">Health Status</span>
              <Badge variant={source.healthStatus === 'healthy' ? 'default' : 'destructive'}>
                {source.healthStatus}
              </Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium">Reliability Score</span>
              <span className="text-sm font-medium">{source.reliabilityScore}/100</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SourceTestResults;
