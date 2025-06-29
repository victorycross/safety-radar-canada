
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Database,
  Settings,
  Eye,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeedTest {
  sourceId: string;
  sourceName: string;
  status: 'idle' | 'testing' | 'success' | 'error';
  lastTest?: Date;
  records?: number;
  error?: string;
  rawData?: any;
}

const FeedTestingDashboard: React.FC = () => {
  const { toast } = useToast();
  const [feedTests, setFeedTests] = useState<FeedTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<string>('');

  // Initialize with known sources
  React.useEffect(() => {
    const knownSources = [
      { id: 'alert-ready', name: 'Alert Ready (Canada Emergency Alerts)' },
      { id: 'bc-arcgis', name: 'BC ArcGIS Emergency Data' },
      { id: 'everbridge', name: 'Everbridge Alerts' },
      { id: 'weather-ca', name: 'Environment Canada Weather' },
      { id: 'cisa-alerts', name: 'CISA Security Alerts' },
      { id: 'social-media', name: 'Social Media Monitoring' }
    ];

    setFeedTests(knownSources.map(source => ({
      sourceId: source.id,
      sourceName: source.name,
      status: 'idle'
    })));
  }, []);

  const testIndividualFeed = async (sourceId: string) => {
    setFeedTests(prev => prev.map(test => 
      test.sourceId === sourceId 
        ? { ...test, status: 'testing', error: undefined }
        : test
    ));

    try {
      let result;
      
      // Test specific feeds based on source ID
      switch (sourceId) {
        case 'alert-ready':
          result = await supabase.functions.invoke('fetch-alerts');
          break;
        case 'bc-arcgis':
          result = await supabase.functions.invoke('fetch-bc-alerts');
          break;
        case 'everbridge':
          result = await supabase.functions.invoke('fetch-everbridge-alerts');
          break;
        default:
          // For other sources, trigger master orchestrator
          result = await supabase.functions.invoke('master-ingestion-orchestrator');
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      setFeedTests(prev => prev.map(test => 
        test.sourceId === sourceId 
          ? { 
              ...test, 
              status: 'success', 
              lastTest: new Date(),
              records: result.data?.processed_count || result.data?.alerts?.length || 0,
              rawData: result.data
            }
          : test
      ));

      toast({
        title: 'Feed Test Successful',
        description: `${sourceId} processed successfully`,
      });

    } catch (error) {
      console.error(`Feed test error for ${sourceId}:`, error);
      
      setFeedTests(prev => prev.map(test => 
        test.sourceId === sourceId 
          ? { 
              ...test, 
              status: 'error', 
              lastTest: new Date(),
              error: error.message
            }
          : test
      ));

      toast({
        title: 'Feed Test Failed',
        description: `Error testing ${sourceId}: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const testAllFeeds = async () => {
    setLoading(true);
    
    for (const feed of feedTests) {
      await testIndividualFeed(feed.sourceId);
      // Add delay between tests to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    setLoading(false);
  };

  const setupCronJobs = async () => {
    try {
      const result = await supabase.functions.invoke('setup-cron-jobs');
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: 'Cron Jobs Configured',
        description: 'Automated data ingestion has been activated',
      });

    } catch (error) {
      console.error('Cron setup error:', error);
      toast({
        title: 'Cron Setup Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const checkDatabaseRecords = async () => {
    try {
      // Check recent incidents
      const { data: incidents, error: incidentsError } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (incidentsError) throw incidentsError;

      // Check queue status
      const { data: queueItems, error: queueError } = await supabase
        .from('alert_ingestion_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (queueError) throw queueError;

      toast({
        title: 'Database Check',
        description: `Found ${incidents?.length || 0} recent incidents, ${queueItems?.length || 0} queue items`,
      });

      console.log('Recent incidents:', incidents);
      console.log('Queue items:', queueItems);

    } catch (error) {
      console.error('Database check error:', error);
      toast({
        title: 'Database Check Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'testing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const selectedFeedData = feedTests.find(f => f.sourceId === selectedFeed);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Feed Testing & Validation Dashboard
            </span>
            <div className="flex space-x-2">
              <Button onClick={setupCronJobs} variant="outline" size="sm">
                <Settings className="mr-1 h-4 w-4" />
                Setup Cron Jobs
              </Button>
              <Button onClick={checkDatabaseRecords} variant="outline" size="sm">
                <Eye className="mr-1 h-4 w-4" />
                Check Database
              </Button>
              <Button 
                onClick={testAllFeeds} 
                disabled={loading}
                size="sm"
              >
                <Play className="mr-1 h-4 w-4" />
                Test All Feeds
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This dashboard helps you test each external data source individually and verify data flow into the database.
              Start by setting up cron jobs, then test each feed systematically.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="feeds" className="w-full">
            <TabsList>
              <TabsTrigger value="feeds">Feed Testing</TabsTrigger>
              <TabsTrigger value="details">Feed Details</TabsTrigger>
              <TabsTrigger value="analysis">Data Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="feeds" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feedTests.map((feed) => (
                  <Card key={feed.sourceId} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{feed.sourceName}</h4>
                        {getStatusIcon(feed.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span>Status:</span>
                          <Badge variant={
                            feed.status === 'success' ? 'default' :
                            feed.status === 'error' ? 'destructive' :
                            feed.status === 'testing' ? 'secondary' : 'outline'
                          }>
                            {feed.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        {feed.lastTest && (
                          <div className="flex justify-between items-center text-xs">
                            <span>Last Test:</span>
                            <span>{feed.lastTest.toLocaleTimeString()}</span>
                          </div>
                        )}
                        
                        {feed.records !== undefined && (
                          <div className="flex justify-between items-center text-xs">
                            <span>Records:</span>
                            <span>{feed.records}</span>
                          </div>
                        )}
                        
                        {feed.error && (
                          <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded">
                            {feed.error}
                          </div>
                        )}
                        
                        <div className="flex space-x-1 mt-3">
                          <Button 
                            size="sm" 
                            onClick={() => testIndividualFeed(feed.sourceId)}
                            disabled={feed.status === 'testing'}
                            className="flex-1"
                          >
                            {feed.status === 'testing' ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Play className="h-3 w-3" />
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedFeed(feed.sourceId)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details">
              {selectedFeedData ? (
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
                      </div>
                      
                      {selectedFeedData.rawData && (
                        <div>
                          <span className="font-medium">Raw Response:</span>
                          <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                            {JSON.stringify(selectedFeedData.rawData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">
                      Select a feed from the testing tab to view details
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analysis">
              <Card>
                <CardHeader>
                  <CardTitle>Data Flow Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        This section will show aggregation patterns, data quality metrics, and processing statistics once feeds are active.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium">Processing Rate</h4>
                        <p className="text-2xl font-bold text-blue-600">-</p>
                        <p className="text-sm text-muted-foreground">Records/hour</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium">Success Rate</h4>
                        <p className="text-2xl font-bold text-green-600">-</p>
                        <p className="text-sm text-muted-foreground">% successful</p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium">Data Quality</h4>
                        <p className="text-2xl font-bold text-orange-600">-</p>
                        <p className="text-sm text-muted-foreground">Quality score</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedTestingDashboard;
