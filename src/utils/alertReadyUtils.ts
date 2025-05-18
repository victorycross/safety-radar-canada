
import { supabase } from '@/integrations/supabase/client';

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
}

export const fetchAlertReadyData = async (): Promise<AlertItem[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-alerts', {
      body: { source: 'alert-ready' }
    });
    
    if (error) throw new Error(error.message);
    
    if (data && Array.isArray(data.alerts)) {
      return data.alerts;
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
  return new Date(dateString).toLocaleString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'Extreme':
      return { color: 'bg-danger', text: 'Extreme' };
    case 'Severe':
      return { color: 'bg-danger/80', text: 'Severe' };
    case 'Moderate':
      return { color: 'bg-warning', text: 'Moderate' };
    case 'Minor':
      return { color: 'bg-warning/70', text: 'Minor' };
    default:
      return { color: 'bg-muted', text: 'Unknown' };
  }
};

export const getUrgencyBadge = (urgency: string) => {
  switch (urgency) {
    case 'Immediate':
      return { color: 'bg-danger/90', text: 'Immediate' };
    case 'Expected':
      return { color: 'bg-warning/90', text: 'Expected' };
    case 'Future':
      return { color: 'bg-secondary', text: 'Future' };
    case 'Past':
      return { color: 'bg-muted', text: 'Past' };
    default:
      return { color: 'bg-muted', text: 'Unknown' };
  }
};
