
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  RefreshCw,
  Settings,
  TrendingUp,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeedAuditData {
  id: string;
  name: string;
  source_type: string;
  api_endpoint: string;
  health_status: string;
  is_active: boolean;
  last_poll_at: string | null;
  polling_interval: number;
  recentMetrics: any[];
  uptime: number;
  avgResponseTime: number;
  errorRate: number;
}

interface AuditResults {
  totalFeeds: number;
  healthyFeeds: number;
  degradedFeeds: number;
  errorFeeds: number;
  unknownFeeds: number;
  criticalIssues: string[];
  recommendations: string[];
}

const RSSFeedAuditTab = () => {
  const { toast } = useToast();
  const [feeds, setFeeds] = useState<FeedAuditData[]>([]);
  const [auditResults, setAuditResults] = useState<AuditResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [auditInProgress, setAuditInProgress] = useState(false);

  useEffect(() => {
    fetchFeedData();
  }, []);

  const fetchFeedData = async () => {
    setLoading(true);
    try {
      // Fetch alert sources
      const { data: sources, error: sourcesError } = await supabase
        .from('alert_sources')
        .select('*')
        .order('name');

      if (sourcesError) throw sourcesError;

      // Fetch health metrics for each source
      const feedsWithMetrics = await Promise.all(
        (sources || []).map(async (source) => {
          const { data: metrics } = await supabase
            .from('source_health_metrics')
            .select('*')
            .eq('source_id', source.id)
            .order('timestamp', { ascending: false })
            .limit(10);

          const recentMetrics = metrics || [];
          const successCount = recentMetrics.filter(m => m.success).length;
          const uptime = recentMetrics.length > 0 ? (successCount / recentMetrics.length) * 100 : 0;
          const avgResponseTime = recentMetrics.length > 0 
            ? recentMetrics.reduce((sum, m) => sum + (m.response_time_ms || 0), 0) / recentMetrics.length 
            : 0;
          const errorRate = recentMetrics.length > 0 ? ((recentMetrics.length - successCount) / recentMetrics.length) * 100 : 0;

          return {
            ...source,
            recentMetrics,
            uptime,
            avgResponseTime,
            errorRate
          };
        })
      );

      setFeeds(feedsWithMetrics);
      performAudit(feedsWithMetrics);
    } catch (error) {
      console.error('Error fetching feed data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feed data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const performAudit = (feedData: FeedAuditData[]) => {
    const totalFeeds = feedData.length;
    const healthyFeeds = feedData.filter(f => f.health_status === 'healthy').length;
    const degradedFeeds = feedData.filter(f => f.health_status === 'degraded').length;
    const errorFeeds = feedData.filter(f => f.health_status === 'error').length;
    const unknownFeeds = feedData.filter(f => f.health_status === 'unknown').length;

    const criticalIssues: string[] = [];
    const recommendations: string[] = [];

    // Identify critical issues
    feedData.forEach(feed => {
      if (feed.health_status === 'error') {
        criticalIssues.push(`${feed.name}: Error status - requires immediate attention`);
      }
      if (feed.uptime < 80 && feed.recentMetrics.length > 0) {
        criticalIssues.push(`${feed.name}: Low uptime (${feed.uptime.toFixed(1)}%)`);
      }
      if (!feed.last_poll_at) {
        criticalIssues.push(`${feed.name}: Never polled - check configuration`);
      }
      if (feed.avgResponseTime > 5000) {
        criticalIssues.push(`${feed.name}: Slow response time (${feed.avgResponseTime.toFixed(0)}ms)`);
      }
    });

    // Generate recommendations
    if (degradedFeeds > 0) {
      recommendations.push(`Review ${degradedFeeds} degraded feeds for potential configuration issues`);
    }
    if (unknownFeeds > 0) {
      recommendations.push(`Test ${unknownFeeds} feeds with unknown status to determine health`);
    }
    if (totalFeeds < 10) {
      recommendations.push('Consider adding more RSS feeds to improve coverage');
    }

    setAuditResults({
      totalFeeds,
      healthyFeeds,
      degradedFeeds,
      errorFeeds,
      unknownFeeds,
      criticalIssues,
      recommendations
    });
  };

  const testFeed = async (feedId: string) => {
    setTesting(feedId);
    try {
      const { data, error } = await supabase.functions.invoke('master-ingestion-orchestrator', {
        body: { source_id: feedId, test_mode: true }
      });

      if (error) throw error;

      toast({
        title: 'Feed Test Complete',
        description: `Feed test completed. Check health metrics for results.`,
      });

      // Refresh data after test
      await fetchFeedData();
    } catch (error) {
      console.error('Feed test error:', error);
      toast({
        title: 'Feed Test Failed',
        description: 'Failed to test feed connectivity',
        variant: 'destructive'
      });
    } finally {
      setTesting(null);
    }
  };

  const runFullAudit = async () => {
    setAuditInProgress(true);
    try {
      // Test all feeds
      for (const feed of feeds) {
        if (feed.is_active) {
          await testFeed(feed.id);
          // Add delay between tests
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      toast({
        title: 'Audit Complete',
        description: 'Full RSS feed audit completed',
      });
    } catch (error) {
      console.error('Audit error:', error);
      toast({
        title: 'Audit Failed',
        description: 'Failed to complete full audit',
        variant: 'destructive'
      });
    } finally {
      setAuditInProgress(false);
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthBadge = (status: string) => {
    const variants = {
      healthy: 'default' as const,
      degraded: 'secondary' as const,
      error: 'destructive' as const,
      unknown: 'outline' as const
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {getHealthIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading feed audit data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Audit Summary */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">RSS Feed Audit Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive monitoring and evaluation of RSS feed health
          </p>
        </div>
        <Button 
          onClick={runFullAudit} 
          disabled={auditInProgress}
          className="min-w-[140px]"
        >
          {auditInProgress ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Auditing...
            </>
          ) : (
            <>
              <Activity className="h-4 w-4 mr-2" />
              Run Full Audit
            </>
          )}
        </Button>
      </div>

      {/* Critical Issues Alert */}
      {auditResults && auditResults.criticalIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{auditResults.criticalIssues.length} Critical Issues Found:</strong>
            <ul className="mt-2 list-disc list-inside">
              {auditResults.criticalIssues.slice(0, 3).map((issue, index) => (
                <li key={index} className="text-sm">{issue}</li>
              ))}
              {auditResults.criticalIssues.length > 3 && (
                <li className="text-sm">... and {auditResults.criticalIssues.length - 3} more</li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Audit Overview Stats */}
      {auditResults && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Feeds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{auditResults.totalFeeds}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{auditResults.healthyFeeds}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Degraded</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{auditResults.degradedFeeds}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{auditResults.errorFeeds}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unknown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{auditResults.unknownFeeds}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="feeds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feeds">Feed Details</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="feeds" className="space-y-4">
          <div className="grid gap-4">
            {feeds.map((feed) => (
              <Card key={feed.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{feed.name}</CardTitle>
                      <CardDescription>{feed.source_type}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getHealthBadge(feed.health_status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testFeed(feed.id)}
                        disabled={testing === feed.id}
                      >
                        {testing === feed.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          'Test'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Uptime</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={feed.uptime} className="flex-1" />
                        <span>{feed.uptime.toFixed(1)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">Avg Response</p>
                      <p className="text-muted-foreground">{feed.avgResponseTime.toFixed(0)}ms</p>
                    </div>
                    <div>
                      <p className="font-medium">Error Rate</p>
                      <p className="text-muted-foreground">{feed.errorRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="font-medium">Last Poll</p>
                      <p className="text-muted-foreground">
                        {feed.last_poll_at 
                          ? new Date(feed.last_poll_at).toLocaleString()
                          : 'Never'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {auditResults && (
            <>
              {auditResults.recommendations.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>Suggested improvements for your RSS feed setup</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {auditResults.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5" />
                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p>No recommendations at this time. Your RSS feeds are performing well!</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Overall Health</span>
                      <span>{auditResults ? ((auditResults.healthyFeeds / auditResults.totalFeeds) * 100).toFixed(1) : 0}%</span>
                    </div>
                    <Progress 
                      value={auditResults ? (auditResults.healthyFeeds / auditResults.totalFeeds) * 100 : 0} 
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Active Feeds</span>
                      <span>{feeds.filter(f => f.is_active).length}/{feeds.length}</span>
                    </div>
                    <Progress 
                      value={(feeds.filter(f => f.is_active).length / feeds.length) * 100} 
                      className="mt-1" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feed Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from(new Set(feeds.map(f => f.source_type))).map(type => {
                    const count = feeds.filter(f => f.source_type === type).length;
                    return (
                      <div key={type} className="flex justify-between">
                        <span className="text-sm">{type}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RSSFeedAuditTab;
