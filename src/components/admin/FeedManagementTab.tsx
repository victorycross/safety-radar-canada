
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertSource } from '@/types/dataIngestion';
import AddFeedModal from './feed-management/AddFeedModal';
import FeedManagementHeader from './feed-management/FeedManagementHeader';
import FeedManagementStats from './feed-management/FeedManagementStats';
import FeedManagementContent from './feed-management/FeedManagementContent';
import FeedManagementLoading from './feed-management/FeedManagementLoading';

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

  if (loading) {
    return <FeedManagementLoading />;
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
