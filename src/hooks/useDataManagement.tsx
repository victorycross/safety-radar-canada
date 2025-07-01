
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  category: string;
  is_active: boolean;
  polling_interval: number;
  last_updated: string | null;
}

export interface APISource {
  id: string;
  name: string;
  endpoint: string;
  type: string;
  is_active: boolean;
  authentication: any;
  configuration: any;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  subject?: string;
  content: string;
  is_active: boolean;
}

export interface SystemIntegration {
  id: string;
  name: string;
  type: string;
  connection_status: 'connected' | 'disconnected' | 'error';
  configuration: any;
  last_sync: string | null;
}

export const useDataManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // RSS Feed Management
  const fetchRSSFeeds = async (): Promise<RSSFeed[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alert_sources')
        .select('*')
        .eq('source_type', 'rss')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => {
        const config = item.configuration as any;
        return {
          id: item.id,
          name: item.name,
          url: item.api_endpoint,
          category: config?.category || 'general',
          is_active: item.is_active,
          polling_interval: item.polling_interval,
          last_updated: item.updated_at
        };
      });
    } catch (error) {
      console.error('Error fetching RSS feeds:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch RSS feeds',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchRSSFeed = async (id: string): Promise<RSSFeed | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alert_sources')
        .select('*')
        .eq('id', id)
        .eq('source_type', 'rss')
        .single();

      if (error) throw error;

      const config = data.configuration as any;
      return {
        id: data.id,
        name: data.name,
        url: data.api_endpoint,
        category: config?.category || 'general',
        is_active: data.is_active,
        polling_interval: data.polling_interval,
        last_updated: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch RSS feed',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createRSSFeed = async (feedData: Omit<RSSFeed, 'id' | 'last_updated'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alert_sources')
        .insert([{
          name: feedData.name,
          source_type: 'rss',
          api_endpoint: feedData.url,
          is_active: feedData.is_active,
          polling_interval: feedData.polling_interval,
          configuration: {
            category: feedData.category,
            feed_type: 'rss'
          }
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'RSS Feed Created',
        description: `${feedData.name} has been added successfully`,
      });

      return data;
    } catch (error) {
      console.error('Error creating RSS feed:', error);
      toast({
        title: 'Error',
        description: 'Failed to create RSS feed',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateRSSFeed = async (id: string, updates: Partial<RSSFeed>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('alert_sources')
        .update({
          name: updates.name,
          api_endpoint: updates.url,
          is_active: updates.is_active,
          polling_interval: updates.polling_interval,
          configuration: {
            category: updates.category,
            feed_type: 'rss'
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'RSS Feed Updated',
        description: 'Feed has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating RSS feed:', error);
      toast({
        title: 'Error',
        description: 'Failed to update RSS feed',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteRSSFeed = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('alert_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'RSS Feed Deleted',
        description: 'Feed has been removed successfully',
      });
    } catch (error) {
      console.error('Error deleting RSS feed:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete RSS feed',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // API Source Management
  const fetchAPISources = async (): Promise<APISource[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alert_sources')
        .select('*')
        .neq('source_type', 'rss')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => {
        const config = item.configuration as any;
        return {
          id: item.id,
          name: item.name,
          endpoint: item.api_endpoint,
          type: item.source_type,
          is_active: item.is_active,
          authentication: config?.authentication || {},
          configuration: config || {}
        };
      });
    } catch (error) {
      console.error('Error fetching API sources:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch API sources',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchAPISource = async (id: string): Promise<APISource | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alert_sources')
        .select('*')
        .eq('id', id)
        .neq('source_type', 'rss')
        .single();

      if (error) throw error;

      const config = data.configuration as any;
      return {
        id: data.id,
        name: data.name,
        endpoint: data.api_endpoint,
        type: data.source_type,
        is_active: data.is_active,
        authentication: config?.authentication || {},
        configuration: config || {}
      };
    } catch (error) {
      console.error('Error fetching API source:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch API source',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAPISource = async (id: string, updates: Partial<APISource>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('alert_sources')
        .update({
          name: updates.name,
          api_endpoint: updates.endpoint,
          source_type: updates.type,
          is_active: updates.is_active,
          configuration: {
            ...updates.configuration,
            authentication: updates.authentication,
            source_category: 'api'
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'API Source Updated',
        description: 'Source has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating API source:', error);
      toast({
        title: 'Error',
        description: 'Failed to update API source',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteAPISource = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('alert_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'API Source Deleted',
        description: 'Source has been removed successfully',
      });
    } catch (error) {
      console.error('Error deleting API source:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete API source',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchRSSFeeds,
    fetchRSSFeed,
    createRSSFeed,
    updateRSSFeed,
    deleteRSSFeed,
    fetchAPISources,
    fetchAPISource,
    createAPISource,
    updateAPISource,
    deleteAPISource
  };
};
