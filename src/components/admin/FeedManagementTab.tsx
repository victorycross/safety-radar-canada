
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Settings, 
  TestTube, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AddFeedModal from './feed-management/AddFeedModal';
import FeedConfigurationCard from './feed-management/FeedConfigurationCard';
import { AlertSource } from '@/types/dataIngestion';

const FeedManagementTab = () => {
  const { toast } = useToast();
  const [feeds, setFeeds] = useState<AlertSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alert_sources')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        const mappedFeeds: AlertSource[] = data.map(source => ({
          ...source,
          health_status: source.health_status as 'healthy' | 'degraded' | 'error' | 'unknown'
        }));
        setFeeds(mappedFeeds);
      }
    } catch (error) {
      console.error('Error fetching feeds:', error);
      toast({
        title: 'Error',
        description: 'Failed to load feeds',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  const handleAddFeed = async (feedConfig: any) => {
    try {
      const { error } = await supabase
        .from('alert_sources')
        .insert([{
          name: feedConfig.name,
          source_type: feedConfig.sourceType,
          api_endpoint: feedConfig.apiEndpoint,
          description: feedConfig.description,
          is_active: feedConfig.isActive,
          polling_interval: feedConfig.pollingInterval,
          configuration: {
            ...feedConfig.configuration,
            normalization: feedConfig.normalization,
            fieldMapping: feedConfig.fieldMapping
          }
        }]);

      if (error) throw error;

      toast({
        title: 'Feed Added',
        description: `${feedConfig.name} has been added successfully`,
      });

      setShowAddModal(false);
      fetchFeeds();
    } catch (error) {
      console.error('Error adding feed:', error);
      toast({
        title: 'Error',
        description: 'Failed to add feed',
        variant: 'destructive'
      });
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default' as const,
      degraded: 'secondary' as const,
      error: 'destructive' as const,
      unknown: 'outline' as const
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {getHealthStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Feed Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Feed Management</h2>
          <p className="text-muted-foreground">
            Manage and configure data feeds with normalized processing
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Feed
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feeds</CardTitle>
            <Database className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{feeds.length}</div>
            <p className="text-xs text-muted-foreground">
              Configured data sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Feeds</CardTitle>
            <Activity className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feeds.filter(f => f.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently polling
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Feeds</CardTitle>
            <CheckCircle className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {feeds.filter(f => f.health_status === 'healthy').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Operating normally
            </p>
          </CardContent>
        </Card>
      </div>

      {feeds.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Feeds Configured</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by adding your first data feed. All feeds will be automatically 
              normalized to ensure consistent data processing.
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Feed
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {feeds.map((feed) => (
            <FeedConfigurationCard
              key={feed.id}
              feed={feed}
              onUpdate={fetchFeeds}
            />
          ))}
        </div>
      )}

      <AddFeedModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddFeed}
      />
    </div>
  );
};

export default FeedManagementTab;
