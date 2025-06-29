
import { supabase } from '@/integrations/supabase/client';
import { UniversalAlert } from '@/types/alerts';
import { normalizeAlert } from './sourceNormalizers';

export interface BCAlertsItem {
  id: string;
  title: string;
  description: string;
  severity: string;
  location: string;
  updated: string;
  type: string;
  status: string;
  url?: string;
}

export const fetchBCAlertsData = async (): Promise<UniversalAlert[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-bc-alerts', {
      body: { source: 'bc' }
    });
    
    if (error) throw new Error(error.message);
    
    if (data && Array.isArray(data.alerts)) {
      // Normalize all alerts to universal format
      return data.alerts.map((alert: any) => normalizeAlert(alert, 'bc'));
    }
    
    return [];
  } catch (err) {
    console.error('Error fetching BC alerts:', err);
    return [];
  }
};
