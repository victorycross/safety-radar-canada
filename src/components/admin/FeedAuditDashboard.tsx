
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Activity,
  BarChart3,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FeedAuditData {
  totalFeeds: number;
  activeFeeds: number;
  healthyFeeds: number;
  failingFeeds: number;
  totalIngested: number;
  ingestedToday: number;
}

interface FeedStatus {
  id: string;
  name: string;
  source_type: string;
  health_status: string;
  is_active: boolean;
  last_poll_at: string | null;
  api_endpoint: string;
  recentMetrics: any[];
  ingestedCount: number;
  lastIngestedAt: string | null;
}

const FeedAuditDashboard = () => {
  const { toast } = useToast();
  const [auditData, setAuditData] = useState<FeedAuditData>({
    totalFeeds: 0,
    activeFeeds: 0,
    healthyFeeds: 0,
    failingFeeds: 0,
    totalIngested: 0,
    ingestedToday: 0
  });
  const [feedStatuses, setFeedStatuses] = useState<FeedStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAuditData = async () => {
    try {
      // Fetch alert sources
      const { data: sources, error: sourcesError } = await supabase
        .from('alert_sources')
        .select('*')
        .order('name');

      if (sourcesError) throw sourcesError;

      // Fetch health metrics for each source
      const { data: metrics, error: metricsError } = await supabase
        .from('source_health_metrics')
        .select('*')
        .order('timestamp', { ascending: false });

      if (metricsError) throw metricsError;

      // Fetch ingested data counts
      const { data: securityAlerts, error: securityError } = await supabase
        .from('security_alerts_ingest')
        .select('id, created_at');

      const { data: weatherAlerts, error: weatherError } = await supabase
        .from('weather_alerts_ingest')
        .select('id, created_at');

      if (securityError || weatherError) {
        console.warn('Error fetching ingested data:', { securityError, weatherError });
      }

      // Calculate audit data
      const totalFeeds = sources?.length || 0;
      const activeFeeds = sources?.filter(s => s.is_active).length || 0;
      const healthyFeeds = sources?.filter(s => s.health_status === 'healthy').length || 0;
      const failingFeeds = sources?.filter(s => s.health_status === 'error').length || 0;

      const totalIngested = (securityAlerts?.length || 0) + (weatherAlerts?.length || 0);
      const today = new Date().toISOString().split('T')[0];
      const ingestedToday = [
        ...(securityAlerts || []),
        ...(weatherAlerts || [])
      ].filter(alert => alert.created_at?.startsWith(today)).length;

      setAuditData({
        totalFeeds,
        activeFeeds,
        healthyFeeds,
        failingFeeds,
        totalIngested,
        ingestedToday
      });

      // Build feed status with detailed information
      const feedStatusData: FeedStatus[] = sources?.map(source => {
        const sourceMetrics = metrics?.filter(m => m.source_id === source.id) || [];
        const recentMetrics = sourceMetrics.slice(0, 10);
        
        // Count ingested data for this source
        let ingestedCount = 0;
        let lastIngestedAt = null;

        if (source.source_type === 'security-rss' || source.source_type === 'rss') {
          const sourceAlerts = securityAlerts?.filter(alert => 
            alert.created_at && new Date(alert.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          ) || [];
          ingestedCount = sourceAlerts.length;
          if (sourceAlerts.length > 0) {
            lastIngestedAt = sourceAlerts[0].created_at;
          }
        } else if (source.source_type === 'weather' || source.source_type === 'weather-geocmet') {
          const sourceAlerts = weatherAlerts?.filter(alert => 
            alert.created_at && new Date(alert.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
          ) || [];
          ingestedCount = sourceAlerts.length;
          if (sourceAlerts.length > 0) {
            lastIngestedAt = sourceAlerts[0].created_at;
          }
        }

        return {
          id: source.id,
          name: source.name,
          source_type: source.source_type,
          health_status: source.health_status,
          is_active: source.is_active,
          last_poll_at: source.last_poll_at,
          api_endpoint: source.api_endpoint,
          recentMetrics,
          ingestedCount,
          lastIngestedAt
        };
      }) || [];

      setFeedStatuses(feedStatusData);
    } catch (error) {
      console.error('Error fetching audit data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch feed audit data',
        variant: 'destructive'
      });
    }
  };

  const triggerManualRefresh = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('master-ingestion-orchestrator');
      
      if (error) throw error;
      
      toast({
        title: 'Refresh Triggered',
        description: 'Manual feed refresh has been initiated'
      });
      
      // Refresh data after a delay
      setTimeout(() => {
        fetchAuditData();
      }, 3000);
    } catch (error) {
      console.error('Error triggering refresh:', error);
      toast({
        title: 'Error',
        description: 'Failed to trigger feed refresh',
        variant: 'destructive'
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
    setLoading(false);
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAuditData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      degraded: 'secondary',
      error: 'destructive',
      unknown: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Feed Audit Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and audit all alert feed sources and data ingestion
          </p>
        </div>
        <Button onClick={triggerManualRefresh} disabled={refreshing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh All Feeds
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{auditData.totalFeeds}</p>
                <p className="text-xs text-muted-foreground">Total Feeds</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{auditData.activeFeeds}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{auditData.healthyFeeds}</p>
                <p className="text-xs text-muted-foreground">Healthy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{auditData.failingFeeds}</p>
                <p className="text-xs text-muted-foreground">Failing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{auditData.totalIngested}</p>
                <p className="text-xs text-muted-foreground">Total Ingested</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{auditData.ingestedToday}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues Alert */}
      {auditData.totalIngested === 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Critical Data Pipeline Issue Detected
            </CardTitle>
            <CardDescription className="text-red-700">
              No data has been ingested into the database despite feeds being polled. 
              The data pipeline between edge functions and database storage appears to be broken.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Feed Status Grid */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Feed Grid</TabsTrigger>
          <TabsTrigger value="details">Detailed View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedStatuses.map((feed) => (
              <Card key={feed.id} className={`relative ${
                !feed.is_active ? 'opacity-60' : ''
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-medium">
                        {feed.name}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {getHealthStatusIcon(feed.health_status)}
                        {getHealthStatusBadge(feed.health_status)}
                      </div>
                    </div>
                    {!feed.is_active && (
                      <Badge variant="outline" className="text-xs">
                        Inactive
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="text-xs">
                        {feed.source_type}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Poll:</span>
                      <span className="text-xs">
                        {feed.last_poll_at 
                          ? new Date(feed.last_poll_at).toLocaleString()
                          : 'Never'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ingested (24h):</span>
                      <span className={`text-xs font-medium ${
                        feed.ingestedCount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {feed.ingestedCount}
                      </span>
                    </div>
                    {feed.lastIngestedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Ingested:</span>
                        <span className="text-xs">
                          {new Date(feed.lastIngestedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Health Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Health Score</span>
                      <span>{feed.recentMetrics.length > 0 
                        ? Math.round((feed.recentMetrics.filter(m => m.success).length / feed.recentMetrics.length) * 100)
                        : 0}%</span>
                    </div>
                    <Progress 
                      value={feed.recentMetrics.length > 0 
                        ? (feed.recentMetrics.filter(m => m.success).length / feed.recentMetrics.length) * 100
                        : 0
                      } 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Feed Analysis</CardTitle>
              <CardDescription>
                Comprehensive view of all feeds with detailed metrics and troubleshooting information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedStatuses.map((feed, index) => (
                  <div key={feed.id} className={`p-4 border rounded-lg ${
                    index % 2 === 0 ? 'bg-muted/20' : ''
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{feed.name}</h4>
                        <p className="text-sm text-muted-foreground">{feed.api_endpoint}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getHealthStatusIcon(feed.health_status)}
                        {getHealthStatusBadge(feed.health_status)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <p className="font-medium">
                          {feed.is_active ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Recent Polls:</span>
                        <p className="font-medium">
                          {feed.recentMetrics.length} recorded
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Success Rate:</span>
                        <p className="font-medium">
                          {feed.recentMetrics.length > 0 
                            ? `${Math.round((feed.recentMetrics.filter(m => m.success).length / feed.recentMetrics.length) * 100)}%`
                            : 'No data'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data Ingested:</span>
                        <p className={`font-medium ${
                          feed.ingestedCount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {feed.ingestedCount} (24h)
                        </p>
                      </div>
                    </div>

                    {feed.recentMetrics.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-2">Recent Activity:</p>
                        <div className="flex space-x-1">
                          {feed.recentMetrics.slice(0, 20).map((metric, idx) => (
                            <div
                              key={idx}
                              className={`w-3 h-3 rounded-full ${
                                metric.success ? 'bg-green-500' : 'bg-red-500'
                              }`}
                              title={`${metric.success ? 'Success' : 'Failed'} - ${new Date(metric.timestamp).toLocaleString()}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeedAuditDashboard;
