
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface BCAlertsItem {
  id: string;
  title: string;
  type: string;
  status: string;
  severity: string;
  location: string;
  description: string;
  updated: string;
  url?: string;
}

export const fetchBCAlertsData = async (): Promise<BCAlertsItem[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-bc-alerts', {
      body: { source: 'arcgis-bc' }
    });
    
    if (error) throw new Error(error.message);
    
    if (data && Array.isArray(data.alerts)) {
      return data.alerts;
    }
    
    return [];
  } catch (err) {
    console.error('Error fetching BC alerts:', err);
    toast({
      title: "Error",
      description: "Failed to fetch BC emergency alerts. Please try again later.",
      variant: "destructive"
    });
    return [];
  }
};

export const getSeverityClass = (severity: string) => {
  const normalizedSeverity = severity.toLowerCase();
  
  if (normalizedSeverity.includes('extreme') || normalizedSeverity.includes('severe')) {
    return 'bg-danger';
  } else if (normalizedSeverity.includes('moderate') || normalizedSeverity.includes('warning')) {
    return 'bg-warning';
  } else if (normalizedSeverity.includes('minor') || normalizedSeverity.includes('advisory')) {
    return 'bg-secondary';
  } else {
    return 'bg-muted';
  }
};

export const formatBCAlertDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
