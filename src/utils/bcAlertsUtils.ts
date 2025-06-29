
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

// Utility functions for backward compatibility with BCAlertsCard
export const getSeverityClass = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'extreme':
      return 'bg-red-600';
    case 'severe':
      return 'bg-red-500';
    case 'moderate':
      return 'bg-orange-500';
    case 'minor':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

export const formatBCAlertDate = (dateString: string) => {
  if (!dateString) {
    return 'Date not available';
  }
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid date';
    }
    
    return date.toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Date formatting error';
  }
};
