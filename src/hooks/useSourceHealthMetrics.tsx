
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseSourceHealthMetricsProps {
  setHealthMetrics: (metrics: any[]) => void;
}

export const useSourceHealthMetrics = ({
  setHealthMetrics
}: UseSourceHealthMetricsProps) => {
  const { toast } = useToast();

  const fetchHealthMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('source_health_metrics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setHealthMetrics(data || []);
    } catch (err) {
      console.error('Error fetching health metrics:', err);
    }
  };

  return {
    fetchHealthMetrics
  };
};
