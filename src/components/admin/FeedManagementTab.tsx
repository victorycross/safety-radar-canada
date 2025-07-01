
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { AlertSource } from '@/types/dataIngestion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import AddFeedModal from './feed-management/AddFeedModal';
import FeedManagementHeader from './feed-management/FeedManagementHeader';
import FeedManagementStats from './feed-management/FeedManagementStats';
import FeedManagementContent from './feed-management/FeedManagementContent';
import FeedManagementLoading from './feed-management/FeedManagementLoading';

const FeedManagementTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [feeds, setFeeds] = useState<AlertSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Check if user has proper permissions
  const hasPermissions = user?.role === 'admin' || user?.role === 'power_user';

  const fetchFeeds = async () => {
    setLoading(true);
    try {
      console.log('Fetching feeds with user role:', user?.role);
      
      const { data, error } = await supabase
        .from('alert_sources')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching feeds:', error);
        throw error;
      }
      
      console.log('Fetched feeds:', data?.length || 0);
      
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
        description: error instanceof Error ? error.message : 'Failed to load feeds',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, [user?.role]);

  const handleAddFeed = async (feedConfig: any) => {
    if (!hasPermissions) {
      toast({
        title: 'Insufficient Permissions',
        description: 'You need admin or power user privileges to add feeds.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Adding new feed:', feedConfig);
      
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

      if (error) {
        console.error('Error adding feed:', error);
        throw error;
      }

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
        description: error instanceof Error ? error.message : 'Failed to add feed',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <FeedManagementLoading />;
  }

  if (!hasPermissions) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Feed Management</h2>
          <p className="text-muted-foreground">Configure and monitor all alert feed sources</p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need admin or power user privileges to access feed management features.
            Current role: <strong>{user?.role || 'none'}</strong>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <FeedManagementHeader onAddFeed={() => setShowAddModal(true)} />

      <FeedManagementStats feeds={feeds} />

      <FeedManagementContent 
        feeds={feeds}
        onAddFeed={() => setShowAddModal(true)}
        onUpdate={fetchFeeds}
      />

      <AddFeedModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAddFeed}
      />
    </div>
  );
};

export default FeedManagementTab;
