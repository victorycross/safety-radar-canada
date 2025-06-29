
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface FeedTest {
  sourceId: string;
  sourceName: string;
  status: 'idle' | 'testing' | 'success' | 'error';
  lastTest?: Date;
  records?: number;
  error?: string;
  rawData?: any;
  details?: string;
}

interface FeedDetailsViewProps {
  selectedFeedData: FeedTest | undefined;
}

const FeedDetailsView: React.FC<FeedDetailsViewProps> = ({ selectedFeedData }) => {
  if (!selectedFeedData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Select a feed from the testing tab to view details
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{selectedFeedData.sourceName} - Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Source ID:</span>
              <p className="text-sm text-muted-foreground">{selectedFeedData.sourceId}</p>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <p className="text-sm">{selectedFeedData.status}</p>
            </div>
            <div>
              <span className="font-medium">Records Processed:</span>
              <p className="text-sm">{selectedFeedData.records || 0}</p>
            </div>
            {selectedFeedData.lastTest && (
              <div>
                <span className="font-medium">Last Test:</span>
                <p className="text-sm">{selectedFeedData.lastTest.toLocaleString()}</p>
              </div>
            )}
          </div>

          {selectedFeedData.details && (
            <div>
              <span className="font-medium">Details:</span>
              <p className="text-sm text-muted-foreground mt-1">{selectedFeedData.details}</p>
            </div>
          )}

          {selectedFeedData.error && (
            <div>
              <span className="font-medium">Error:</span>
              <p className="text-sm text-red-600 mt-1">{selectedFeedData.error}</p>
            </div>
          )}
          
          {selectedFeedData.rawData && (
            <div>
              <span className="font-medium">Raw Response:</span>
              <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(selectedFeedData.rawData, null, 2)}
              </pre>
            </div>
          )}

          {/* API Configuration Recommendations */}
          {selectedFeedData.records === 0 && selectedFeedData.status === 'success' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Configuration Needed:</strong>
                {selectedFeedData.sourceId === 'weather-ca' && (
                  <span> This feed requires an Environment Canada API key to access weather data.</span>
                )}
                {selectedFeedData.sourceId === 'social-media' && (
                  <span> This feed requires API keys for social media platforms (Twitter API, Facebook API, etc.).</span>
                )}
                {selectedFeedData.sourceId === 'everbridge' && (
                  <span> This feed requires Everbridge API credentials (username, password, organization ID).</span>
                )}
                {selectedFeedData.sourceId === 'cisa-alerts' && (
                  <span> This feed should work without API keys. The RSS endpoint may be temporarily unavailable.</span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedDetailsView;
