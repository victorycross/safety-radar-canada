import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  RefreshCw, 
  AlertTriangle,
  Database,
  Settings,
  Eye
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import FeedTestCard from './FeedTestCard';
import FeedDetailsView from './FeedDetailsView';
import FeedAnalysisView from './FeedAnalysisView';
import FeedConfigModal from './FeedConfigModal';

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

const FeedTestingDashboard: React.FC = () => {
  const { toast } = useToast();
  const [feedTests, setFeedTests] = useState<FeedTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('feeds');
  const [configModal, setConfigModal] = useState<{
    isOpen: boolean;
    feedId: string;
    feedName: string;
  }>({
    isOpen: false,
    feedId: '',
    feedName: ''
  });

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
        ? { ...test, status: 'testing', error: undefined, details: undefined }
        : test
    ));

    try {
      let result;
      let details = '';
      
      // Test specific feeds based on source ID with proper request bodies
      switch (sourceId) {
        case 'alert-ready':
          result = await supabase.functions.invoke('fetch-alerts', {
            body: { source: 'alert-ready' }
          });
          details = 'Alert Ready provides real-time emergency alerts from Alert Ready system';
          break;
        case 'bc-arcgis':
          result = await supabase.functions.invoke('fetch-bc-alerts', {
            body: { source: 'arcgis-bc' }
          });
          details = 'BC ArcGIS provides emergency data from British Columbia ArcGIS services';
          break;
        case 'everbridge':
          result = await supabase.functions.invoke('fetch-everbridge-alerts', {
            body: { source: 'everbridge' }
          });
          details = 'Everbridge requires API credentials for access to emergency notifications';
          break;
        default:
          result = await supabase.functions.invoke('master-ingestion-orchestrator', {
            body: { source: sourceId, test_mode: true }
          });
          details = 'Generic feed test using master orchestrator';
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      const recordsProcessed = result.data?.alerts?.length || 
                              result.data?.processed_count || 
                              result.data?.results?.length || 
                              result.data?.count || 0;

      let statusMessage = '';
      if (recordsProcessed === 0) {
        switch (sourceId) {
          case 'weather-ca':
            statusMessage = 'Success but no records - likely needs Environment Canada API key';
            break;
          case 'cisa-alerts':
            statusMessage = 'Success but no records - may need to verify CISA RSS feed endpoint';
            break;
          case 'social-media':
            statusMessage = 'Success but no records - requires social media API keys (Twitter, Facebook, etc.)';
            break;
          case 'everbridge':
            statusMessage = 'Success but no records - requires Everbridge API credentials';
            break;
          default:
            statusMessage = 'Success but no records found';
        }
      }

      setFeedTests(prev => prev.map(test => 
        test.sourceId === sourceId 
          ? { 
              ...test, 
              status: 'success', 
              lastTest: new Date(),
              records: recordsProcessed,
              rawData: result.data,
              details: details + (statusMessage ? ` - ${statusMessage}` : '')
            }
          : test
      ));

      toast({
        title: recordsProcessed > 0 ? 'Feed Test Successful' : 'Feed Connected But No Data',
        description: recordsProcessed > 0 
          ? `${sourceId} processed ${recordsProcessed} records`
          : statusMessage || `${sourceId} connected but returned no records`,
        variant: recordsProcessed > 0 ? 'default' : 'destructive'
      });

    } catch (error) {
      console.error(`Feed test error for ${sourceId}:`, error);
      
      let errorDetails = '';
      if (error.message.includes('non-2xx')) {
        errorDetails = 'Edge function returned error - may need API configuration';
      } else {
        errorDetails = error.message;
      }
      
      setFeedTests(prev => prev.map(test => 
        test.sourceId === sourceId 
          ? { 
              ...test, 
              status: 'error', 
              lastTest: new Date(),
              error: errorDetails,
              details: `Error: ${errorDetails}`
            }
          : test
      ));

      toast({
        title: 'Feed Test Failed',
        description: `Error testing ${sourceId}: ${errorDetails}`,
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

  const handleViewDetails = (sourceId: string) => {
    setSelectedFeed(sourceId);
    setActiveTab('details');
  };

  const handleConfigure = (sourceId: string) => {
    const feed = feedTests.find(f => f.sourceId === sourceId);
    setConfigModal({
      isOpen: true,
      feedId: sourceId,
      feedName: feed?.sourceName || sourceId
    });
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
              Feeds showing "success but no records" likely need API keys or configuration.
            </AlertDescription>
          </Alert>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="feeds">Feed Testing</TabsTrigger>
              <TabsTrigger value="details">Feed Details</TabsTrigger>
              <TabsTrigger value="analysis">Data Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="feeds" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feedTests.map((feed) => (
                  <FeedTestCard 
                    key={feed.sourceId}
                    feed={feed}
                    onTest={testIndividualFeed}
                    onViewDetails={handleViewDetails}
                    onConfigure={handleConfigure}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="details">
              <FeedDetailsView selectedFeedData={selectedFeedData} />
            </TabsContent>

            <TabsContent value="analysis">
              <FeedAnalysisView />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <FeedConfigModal
        isOpen={configModal.isOpen}
        onClose={() => setConfigModal(prev => ({ ...prev, isOpen: false }))}
        feedId={configModal.feedId}
        feedName={configModal.feedName}
      />
    </div>
  );
};

export default FeedTestingDashboard;
