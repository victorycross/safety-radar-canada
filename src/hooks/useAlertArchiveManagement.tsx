
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

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

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Fetch from multiple alert tables
      const [securityAlerts, weatherAlerts, incidents, hubIncidents] = await Promise.all([
        supabase.from('security_alerts_ingest').select('*'),
        supabase.from('weather_alerts_ingest').select('*'),
        supabase.from('incidents').select('*'),
        supabase.from('hub_incidents').select('*')
      ]);

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

      setAlerts(allAlerts);
      setArchivedAlerts(allArchivedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const logArchiveAction = async (alertIds: string[], action: 'archive' | 'unarchive' | 'delete', reason: string) => {
    if (!user?.id) return;

    const logEntries = alertIds.map(alertId => {
      const alert = [...alerts, ...archivedAlerts].find(a => a.id === alertId);
      return {
        alert_table: alert?.table_name || 'unknown',
        alert_id: alertId,
        action,
        performed_by: user.id,
        reason,
        metadata: { timestamp: new Date().toISOString() }
      };
    });

    await supabase.from('alert_archive_log').insert(logEntries);
  };

  const archiveAlerts = async (alertIds: string[], reason: string) => {
    if (!user?.id) return;

    const archiveData = {
      archived_at: new Date().toISOString(),
      archived_by: user.id,
      archive_reason: reason
    };

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

    // Update each table explicitly
    for (const [tableName, ids] of alertsByTable) {
      if (tableName === 'security_alerts_ingest') {
        await supabase.from('security_alerts_ingest').update(archiveData).in('id', ids);
      } else if (tableName === 'weather_alerts_ingest') {
        await supabase.from('weather_alerts_ingest').update(archiveData).in('id', ids);
      } else if (tableName === 'incidents') {
        await supabase.from('incidents').update(archiveData).in('id', ids);
      } else if (tableName === 'hub_incidents') {
        await supabase.from('hub_incidents').update(archiveData).in('id', ids);
      }
    }

    await logArchiveAction(alertIds, 'archive', reason);
  };

  const unarchiveAlerts = async (alertIds: string[], reason: string) => {
    const unarchiveData = {
      archived_at: null,
      archived_by: null,
      archive_reason: null
    };

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

    // Update each table explicitly
    for (const [tableName, ids] of alertsByTable) {
      if (tableName === 'security_alerts_ingest') {
        await supabase.from('security_alerts_ingest').update(unarchiveData).in('id', ids);
      } else if (tableName === 'weather_alerts_ingest') {
        await supabase.from('weather_alerts_ingest').update(unarchiveData).in('id', ids);
      } else if (tableName === 'incidents') {
        await supabase.from('incidents').update(unarchiveData).in('id', ids);
      } else if (tableName === 'hub_incidents') {
        await supabase.from('hub_incidents').update(unarchiveData).in('id', ids);
      }
    }

    await logArchiveAction(alertIds, 'unarchive', reason);
  };

  const deleteAlerts = async (alertIds: string[], reason: string) => {
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

    await logArchiveAction(alertIds, 'delete', reason);

    // Delete from each table explicitly
    for (const [tableName, ids] of alertsByTable) {
      if (tableName === 'security_alerts_ingest') {
        await supabase.from('security_alerts_ingest').delete().in('id', ids);
      } else if (tableName === 'weather_alerts_ingest') {
        await supabase.from('weather_alerts_ingest').delete().in('id', ids);
      } else if (tableName === 'incidents') {
        await supabase.from('incidents').delete().in('id', ids);
      } else if (tableName === 'hub_incidents') {
        await supabase.from('hub_incidents').delete().in('id', ids);
      }
    }
  };

  const refreshAlerts = () => {
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
