
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Incident } from '@/types';

interface UseArchiveAlertsReturn {
  archiveIncidents: (incidentIds: string[], reason: string) => Promise<boolean>;
  archiveHubIncidents: (incidentIds: string[], reason: string) => Promise<boolean>;
  isArchiving: boolean;
}

export const useArchiveAlerts = (): UseArchiveAlertsReturn => {
  const [isArchiving, setIsArchiving] = useState(false);
  const { toast } = useToast();

  const archiveIncidents = async (incidentIds: string[], reason: string): Promise<boolean> => {
    setIsArchiving(true);
    
    try {
      const { error } = await supabase
        .from('incidents')
        .update({
          archived_at: new Date().toISOString(),
          archived_by: (await supabase.auth.getUser()).data.user?.id,
          archive_reason: reason
        })
        .in('id', incidentIds);

      if (error) throw error;

      toast({
        title: 'Alerts Archived',
        description: `Successfully archived ${incidentIds.length} alert${incidentIds.length !== 1 ? 's' : ''}`,
      });

      return true;
    } catch (error) {
      console.error('Error archiving incidents:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive alerts. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsArchiving(false);
    }
  };

  const archiveHubIncidents = async (incidentIds: string[], reason: string): Promise<boolean> => {
    setIsArchiving(true);
    
    try {
      const { error } = await supabase
        .from('hub_incidents')
        .update({
          archived_at: new Date().toISOString(),
          archived_by: (await supabase.auth.getUser()).data.user?.id,
          archive_reason: reason
        })
        .in('id', incidentIds);

      if (error) throw error;

      toast({
        title: 'Hub Alerts Archived',
        description: `Successfully archived ${incidentIds.length} hub alert${incidentIds.length !== 1 ? 's' : ''}`,
      });

      return true;
    } catch (error) {
      console.error('Error archiving hub incidents:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive hub alerts. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsArchiving(false);
    }
  };

  return {
    archiveIncidents,
    archiveHubIncidents,
    isArchiving
  };
};
