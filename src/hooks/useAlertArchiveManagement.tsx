
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export interface Alert {
  id: string;
  title: string;
  description?: string;
  source: string;
  created_at: string;
  archived_at?: string;
  archived_by?: string;
  archive_reason?: string;
  table_name: string;
}

export const useAlertArchiveManagement = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [archivedAlerts, setArchivedAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      console.log('Fetching alerts...');
      
      // Fetch from multiple alert tables
      const [securityAlerts, weatherAlerts, incidents, hubIncidents] = await Promise.all([
        supabase.from('security_alerts_ingest').select('*'),
        supabase.from('weather_alerts_ingest').select('*'),
        supabase.from('incidents').select('*'),
        supabase.from('hub_incidents').select('*')
      ]);

      console.log('Fetch results:', {
        security: securityAlerts.data?.length || 0,
        weather: weatherAlerts.data?.length || 0,
        incidents: incidents.data?.length || 0,
        hubIncidents: hubIncidents.data?.length || 0
      });

      // Check for errors in fetch operations
      if (securityAlerts.error) console.error('Security alerts error:', securityAlerts.error);
      if (weatherAlerts.error) console.error('Weather alerts error:', weatherAlerts.error);
      if (incidents.error) console.error('Incidents error:', incidents.error);
      if (hubIncidents.error) console.error('Hub incidents error:', hubIncidents.error);

      // Transform and combine alerts
      const allAlerts: Alert[] = [];
      const allArchivedAlerts: Alert[] = [];

      // Process security alerts
      if (securityAlerts.data) {
        securityAlerts.data.forEach(alert => {
          const transformedAlert: Alert = {
            id: alert.id,
            title: alert.title,
            description: alert.summary,
            source: 'security',
            created_at: alert.created_at,
            archived_at: alert.archived_at,
            archived_by: alert.archived_by,
            archive_reason: alert.archive_reason,
            table_name: 'security_alerts_ingest'
          };
          
          if (alert.archived_at) {
            allArchivedAlerts.push(transformedAlert);
          } else {
            allAlerts.push(transformedAlert);
          }
        });
      }

      // Process weather alerts
      if (weatherAlerts.data) {
        weatherAlerts.data.forEach(alert => {
          const transformedAlert: Alert = {
            id: alert.id,
            title: alert.event_type || 'Weather Alert',
            description: alert.description,
            source: 'weather',
            created_at: alert.created_at,
            archived_at: alert.archived_at,
            archived_by: alert.archived_by,
            archive_reason: alert.archive_reason,
            table_name: 'weather_alerts_ingest'
          };
          
          if (alert.archived_at) {
            allArchivedAlerts.push(transformedAlert);
          } else {
            allAlerts.push(transformedAlert);
          }
        });
      }

      // Process incidents
      if (incidents.data) {
        incidents.data.forEach(incident => {
          const transformedAlert: Alert = {
            id: incident.id,
            title: incident.title,
            description: incident.description,
            source: 'incident',
            created_at: incident.created_at,
            archived_at: incident.archived_at,
            archived_by: incident.archived_by,
            archive_reason: incident.archive_reason,
            table_name: 'incidents'
          };
          
          if (incident.archived_at) {
            allArchivedAlerts.push(transformedAlert);
          } else {
            allAlerts.push(transformedAlert);
          }
        });
      }

      // Process hub incidents
      if (hubIncidents.data) {
        hubIncidents.data.forEach(incident => {
          const transformedAlert: Alert = {
            id: incident.id,
            title: incident.title,
            description: incident.description,
            source: 'hub',
            created_at: incident.created_at,
            archived_at: incident.archived_at,
            archived_by: incident.archived_by,
            archive_reason: incident.archive_reason,
            table_name: 'hub_incidents'
          };
          
          if (incident.archived_at) {
            allArchivedAlerts.push(transformedAlert);
          } else {
            allAlerts.push(transformedAlert);
          }
        });
      }

      // Sort by created_at descending
      allAlerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      allArchivedAlerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('Processed alerts:', {
        active: allAlerts.length,
        archived: allArchivedAlerts.length
      });

      setAlerts(allAlerts);
      setArchivedAlerts(allArchivedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch alerts. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const archiveAlerts = async (alertIds: string[], reason: string) => {
    if (!user?.id) {
      console.error('No authenticated user found');
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to archive alerts.',
        variant: 'destructive'
      });
      return;
    }

    console.log('Archiving alerts:', { alertIds, reason, userId: user.id });

    // Group alerts by table
    const alertsByTable = new Map<string, string[]>();
    alertIds.forEach(alertId => {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        if (!alertsByTable.has(alert.table_name)) {
          alertsByTable.set(alert.table_name, []);
        }
        alertsByTable.get(alert.table_name)!.push(alertId);
      }
    });

    console.log('Alerts grouped by table:', Object.fromEntries(alertsByTable));

    // Process each table using the bulk archive function
    const results = [];
    for (const [tableName, ids] of alertsByTable) {
      try {
        console.log(`Calling bulk_archive_alerts for table: ${tableName} with ${ids.length} alerts`);
        
        const { data, error } = await supabase.rpc('bulk_archive_alerts', {
          alert_table_name: tableName,
          alert_ids: ids,
          archive_reason: reason,
          user_id: user.id
        });

        if (error) {
          console.error(`Error archiving ${tableName}:`, error);
          throw error;
        }

        console.log(`Archive result for ${tableName}:`, data);
        results.push(data);

        if (!data.success) {
          throw new Error(data.error || `Failed to archive alerts in ${tableName}`);
        }
      } catch (error) {
        console.error(`Failed to archive alerts in ${tableName}:`, error);
        toast({
          title: 'Archive Error',
          description: `Failed to archive ${tableName} alerts: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive'
        });
        throw error;
      }
    }

    console.log('All archive operations completed successfully:', results);
  };

  const unarchiveAlerts = async (alertIds: string[], reason: string) => {
    if (!user?.id) {
      console.error('No authenticated user found');
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to unarchive alerts.',
        variant: 'destructive'
      });
      return;
    }

    console.log('Unarchiving alerts:', { alertIds, reason, userId: user.id });

    // Group alerts by table
    const alertsByTable = new Map<string, string[]>();
    alertIds.forEach(alertId => {
      const alert = archivedAlerts.find(a => a.id === alertId);
      if (alert) {
        if (!alertsByTable.has(alert.table_name)) {
          alertsByTable.set(alert.table_name, []);
        }
        alertsByTable.get(alert.table_name)!.push(alertId);
      }
    });

    // Process each table using the bulk unarchive function
    const results = [];
    for (const [tableName, ids] of alertsByTable) {
      try {
        console.log(`Calling bulk_unarchive_alerts for table: ${tableName} with ${ids.length} alerts`);
        
        const { data, error } = await supabase.rpc('bulk_unarchive_alerts', {
          alert_table_name: tableName,
          alert_ids: ids,
          unarchive_reason: reason,
          user_id: user.id
        });

        if (error) {
          console.error(`Error unarchiving ${tableName}:`, error);
          throw error;
        }

        console.log(`Unarchive result for ${tableName}:`, data);
        results.push(data);

        if (!data.success) {
          throw new Error(data.error || `Failed to unarchive alerts in ${tableName}`);
        }
      } catch (error) {
        console.error(`Failed to unarchive alerts in ${tableName}:`, error);
        toast({
          title: 'Unarchive Error',
          description: `Failed to unarchive ${tableName} alerts: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive'
        });
        throw error;
      }
    }

    console.log('All unarchive operations completed successfully:', results);
  };

  const deleteAlerts = async (alertIds: string[], reason: string) => {
    if (!user?.id) {
      console.error('No authenticated user found');
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to delete alerts.',
        variant: 'destructive'
      });
      return;
    }

    console.log('Deleting alerts:', { alertIds, reason, userId: user.id });

    // Group alerts by table
    const alertsByTable = new Map<string, string[]>();
    alertIds.forEach(alertId => {
      const alert = archivedAlerts.find(a => a.id === alertId);
      if (alert) {
        if (!alertsByTable.has(alert.table_name)) {
          alertsByTable.set(alert.table_name, []);
        }
        alertsByTable.get(alert.table_name)!.push(alertId);
      }
    });

    // Log the delete action first
    try {
      const logEntries = alertIds.map(alertId => {
        const alert = archivedAlerts.find(a => a.id === alertId);
        return {
          alert_table: alert?.table_name || 'unknown',
          alert_id: alertId,
          action: 'delete',
          performed_by: user.id,
          reason,
          metadata: { timestamp: new Date().toISOString() }
        };
      });

      await supabase.from('alert_archive_log').insert(logEntries);
    } catch (error) {
      console.error('Failed to log delete action:', error);
    }

    // Delete from each table explicitly
    for (const [tableName, ids] of alertsByTable) {
      try {
        console.log(`Deleting from ${tableName}:`, ids);
        
        let deleteResult;
        if (tableName === 'security_alerts_ingest') {
          deleteResult = await supabase.from('security_alerts_ingest').delete().in('id', ids);
        } else if (tableName === 'weather_alerts_ingest') {
          deleteResult = await supabase.from('weather_alerts_ingest').delete().in('id', ids);
        } else if (tableName === 'incidents') {
          deleteResult = await supabase.from('incidents').delete().in('id', ids);
        } else if (tableName === 'hub_incidents') {
          deleteResult = await supabase.from('hub_incidents').delete().in('id', ids);
        }

        if (deleteResult?.error) {
          console.error(`Error deleting from ${tableName}:`, deleteResult.error);
          throw deleteResult.error;
        }

        console.log(`Successfully deleted from ${tableName}`);
      } catch (error) {
        console.error(`Failed to delete alerts from ${tableName}:`, error);
        toast({
          title: 'Delete Error',
          description: `Failed to delete ${tableName} alerts: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive'
        });
        throw error;
      }
    }

    console.log('All delete operations completed successfully');
  };

  const refreshAlerts = () => {
    console.log('Refreshing alerts...');
    fetchAlerts();
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return {
    alerts,
    archivedAlerts,
    loading,
    archiveAlerts,
    unarchiveAlerts,
    deleteAlerts,
    refreshAlerts
  };
};
