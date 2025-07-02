import { supabase } from '@/integrations/supabase/client';

export interface ArchivingRule {
  tableName: string;
  condition: string;
  description: string;
  dayThreshold: number;
}

export const AUTOMATED_ARCHIVING_RULES: ArchivingRule[] = [
  {
    tableName: 'weather_alerts_ingest',
    condition: 'expires < now() - interval \'7 days\'',
    description: 'Weather alerts expired more than 7 days ago',
    dayThreshold: 7
  },
  {
    tableName: 'immigration_travel_announcements',
    condition: 'created_at < now() - interval \'30 days\' AND announcement_type IN (\'routine\', \'administrative\')',
    description: 'Routine immigration announcements older than 30 days',
    dayThreshold: 30
  },
  {
    tableName: 'security_alerts_ingest',
    condition: 'created_at < now() - interval \'14 days\' AND category = \'minor\'',
    description: 'Minor security alerts older than 14 days',
    dayThreshold: 14
  }
];

export class AutomatedArchivingService {
  async executeArchivingRules(): Promise<{ rule: ArchivingRule; archivedCount: number }[]> {
    const results = [];
    const currentUser = await supabase.auth.getUser();
    const userId = currentUser.data.user?.id;

    if (!userId) {
      throw new Error('User not authenticated for archiving operations');
    }

    for (const rule of AUTOMATED_ARCHIVING_RULES) {
      try {
        const archivedCount = await this.archiveByRule(rule, userId);
        results.push({ rule, archivedCount });
      } catch (error) {
        console.error(`Error executing archiving rule for ${rule.tableName}:`, error);
        results.push({ rule, archivedCount: 0 });
      }
    }

    return results;
  }

  private async archiveByRule(rule: ArchivingRule, userId: string): Promise<number> {
    const alertIds = await this.getAlertsToArchive(rule);
    
    if (alertIds.length === 0) {
      return 0;
    }

    const { data, error } = await supabase.rpc('bulk_archive_alerts', {
      alert_table_name: rule.tableName,
      alert_ids: alertIds,
      archive_reason: `Automated archiving: ${rule.description}`,
      user_id: userId
    });

    if (error) {
      throw error;
    }

    return (data as any)?.updated_count || 0;
  }

  private async getAlertsToArchive(rule: ArchivingRule): Promise<string[]> {
    const cutoffDate = new Date(Date.now() - (rule.dayThreshold * 24 * 60 * 60 * 1000)).toISOString();
    
    // Use direct table queries with proper field names
    if (rule.tableName === 'weather_alerts_ingest') {
      const { data, error } = await supabase
        .from('weather_alerts_ingest')
        .select('id')
        .is('archived_at', null)
        .lt('expires', cutoffDate);
      
      if (error) throw error;
      return data?.map(item => item.id) || [];
      
    } else if (rule.tableName === 'immigration_travel_announcements') {
      const { data, error } = await supabase
        .from('immigration_travel_announcements')
        .select('id')
        .is('archived_at', null)
        .lt('created_at', cutoffDate)
        .in('announcement_type', ['routine', 'administrative']);
      
      if (error) throw error;
      return data?.map(item => item.id) || [];
      
    } else if (rule.tableName === 'security_alerts_ingest') {
      const { data, error } = await supabase
        .from('security_alerts_ingest')
        .select('id')
        .is('archived_at', null)
        .lt('created_at', cutoffDate)
        .eq('category', 'minor');
      
      if (error) throw error;
      return data?.map(item => item.id) || [];
    }
    
    return [];
  }

  async getArchivingCandidates(): Promise<{ [tableName: string]: number }> {
    const candidates: { [tableName: string]: number } = {};

    for (const rule of AUTOMATED_ARCHIVING_RULES) {
      try {
        const alertIds = await this.getAlertsToArchive(rule);
        candidates[rule.tableName] = alertIds.length;
      } catch (error) {
        console.error(`Error getting candidates for ${rule.tableName}:`, error);
        candidates[rule.tableName] = 0;
      }
    }

    return candidates;
  }
}

export const automatedArchivingService = new AutomatedArchivingService();