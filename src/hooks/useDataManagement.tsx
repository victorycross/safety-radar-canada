
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
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface SystemIntegration {
  id: string;
  name: string;
  type: string;
  connection_status: 'connected' | 'disconnected' | 'error';
  configuration: any;
  last_sync: string | null;
  api_endpoint?: string;
  is_active: boolean;
  authentication_config?: any;
  sync_frequency_minutes?: number;
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

  const createAPISource = async (sourceData: Omit<APISource, 'id'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alert_sources')
        .insert([{
          name: sourceData.name,
          source_type: sourceData.type,
          api_endpoint: sourceData.endpoint,
          is_active: sourceData.is_active,
          configuration: {
            ...sourceData.configuration,
            authentication: sourceData.authentication,
            source_category: 'api'
          }
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'API Source Created',
        description: `${sourceData.name} has been added successfully`,
      });

      return data;
    } catch (error) {
      console.error('Error creating API source:', error);
      toast({
        title: 'Error',
        description: 'Failed to create API source',
        variant: 'destructive'
      });
      throw error;
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

  // System Integration Management
  const fetchSystemIntegrations = async (): Promise<SystemIntegration[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('travel_integration_config')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(item => ({
        id: item.id,
        name: item.platform_name,
        type: 'travel_platform',
        connection_status: item.sync_status === 'success' ? 'connected' : 
                          item.sync_status === 'error' ? 'error' : 'disconnected',
        configuration: item.authentication_config || {},
        last_sync: item.last_sync_at,
        api_endpoint: item.api_endpoint,
        is_active: item.is_active,
        authentication_config: item.authentication_config,
        sync_frequency_minutes: item.sync_frequency_minutes
      }));
    } catch (error) {
      console.error('Error fetching system integrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch system integrations',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createSystemIntegration = async (integrationData: Omit<SystemIntegration, 'id' | 'connection_status' | 'last_sync'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('travel_integration_config')
        .insert([{
          platform_name: integrationData.name,
          api_endpoint: integrationData.api_endpoint,
          is_active: integrationData.is_active,
          authentication_config: integrationData.authentication_config,
          sync_frequency_minutes: integrationData.sync_frequency_minutes || 60,
          sync_status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'System Integration Created',
        description: `${integrationData.name} has been added successfully`,
      });

      return data;
    } catch (error) {
      console.error('Error creating system integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to create system integration',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSystemIntegration = async (id: string, updates: Partial<SystemIntegration>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('travel_integration_config')
        .update({
          platform_name: updates.name,
          api_endpoint: updates.api_endpoint,
          is_active: updates.is_active,
          authentication_config: updates.authentication_config,
          sync_frequency_minutes: updates.sync_frequency_minutes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'System Integration Updated',
        description: 'Integration has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating system integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to update system integration',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteSystemIntegration = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('travel_integration_config')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'System Integration Deleted',
        description: 'Integration has been removed successfully',
      });
    } catch (error) {
      console.error('Error deleting system integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete system integration',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Communication Template Management
  const fetchCommunicationTemplates = async (): Promise<CommunicationTemplate[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('communication_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error fetching communication templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch communication templates',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createCommunicationTemplate = async (templateData: Omit<CommunicationTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('communication_templates')
        .insert([{
          ...templateData,
          created_by: supabase.auth.getUser().then(u => u.data.user?.id)
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Communication Template Created',
        description: `${templateData.name} has been added successfully`,
      });

      return data;
    } catch (error) {
      console.error('Error creating communication template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create communication template',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCommunicationTemplate = async (id: string, updates: Partial<CommunicationTemplate>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('communication_templates')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Communication Template Updated',
        description: 'Template has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating communication template:', error);
      toast({
        title: 'Error',
        description: 'Failed to update communication template',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCommunicationTemplate = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('communication_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Communication Template Deleted',
        description: 'Template has been removed successfully',
      });
    } catch (error) {
      console.error('Error deleting communication template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete communication template',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    // RSS Feed functions
    fetchRSSFeeds,
    fetchRSSFeed,
    createRSSFeed,
    updateRSSFeed,
    deleteRSSFeed,
    // API Source functions
    fetchAPISources,
    fetchAPISource,
    createAPISource,
    updateAPISource,
    deleteAPISource,
    // System Integration functions
    fetchSystemIntegrations,
    createSystemIntegration,
    updateSystemIntegration,
    deleteSystemIntegration,
    // Communication Template functions
    fetchCommunicationTemplates,
    createCommunicationTemplate,
    updateCommunicationTemplate,
    deleteCommunicationTemplate
  };
};
