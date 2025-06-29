
import { supabase } from '@/integrations/supabase/client';
import { UniversalAlert } from '@/types/alerts';
import { normalizeAlert } from './sourceNormalizers';

export interface AlertItem {
  id: string;
  title: string;
  published: string;
  updated?: string;
  summary: string;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Extreme' | 'Unknown';
  urgency: 'Immediate' | 'Expected' | 'Future' | 'Past' | 'Unknown';
  category: string;
  status: 'Actual' | 'Exercise' | 'System' | 'Test' | 'Draft';
  area: string;
  url?: string;
  instructions?: string;
  effectiveTime?: string;
  expiryTime?: string;
  author?: string;
}

export const fetchAlertReadyData = async (): Promise<UniversalAlert[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-alerts', {
      body: { source: 'alert-ready' }
    });
    
    if (error) throw new Error(error.message);
    
    if (data && Array.isArray(data.alerts)) {
      // Normalize all alerts to universal format using consistent normalization
      return data.alerts.map((alert: any) => normalizeAlert(alert, 'alert-ready'));
    }
    
    return [];
  } catch (err) {
    console.error('Error fetching alerts:', err);
    return [];
  }
};

export const getSeverityLevel = (severity: string) => {
  switch (severity) {
    case 'Extreme':
    case 'Severe':
      return 'high';
    case 'Moderate':
      return 'medium';
    case 'Minor':
      return 'low';
    default:
      return 'unknown';
  }
};

export const formatAlertDate = (dateString: string) => {
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

export const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'Extreme':
      return { color: 'bg-red-600 text-white', text: 'Extreme' };
    case 'Severe':
      return { color: 'bg-red-500 text-white', text: 'Severe' };
    case 'Moderate':
      return { color: 'bg-orange-500 text-white', text: 'Moderate' };
    case 'Minor':
      return { color: 'bg-yellow-500 text-black', text: 'Minor' };
    default:
      return { color: 'bg-gray-500 text-white', text: 'Unknown' };
  }
};

export const getUrgencyBadge = (urgency: string) => {
  switch (urgency) {
    case 'Immediate':
      return { color: 'bg-red-600 text-white', text: 'Immediate' };
    case 'Expected':
      return { color: 'bg-orange-500 text-white', text: 'Expected' };
    case 'Future':
      return { color: 'bg-blue-500 text-white', text: 'Future' };
    case 'Past':
      return { color: 'bg-gray-500 text-white', text: 'Past' };
    default:
      return { color: 'bg-gray-400 text-white', text: 'Unknown' };
  }
};

export const formatTimeRange = (effectiveTime?: string, expiryTime?: string) => {
  if (!effectiveTime && !expiryTime) return null;
  
  const parts = [];
  if (effectiveTime) parts.push(`Effective: ${effectiveTime}`);
  if (expiryTime) parts.push(`Until: ${expiryTime}`);
  
  return parts.join(' • ');
};
