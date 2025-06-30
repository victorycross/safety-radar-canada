
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedSource } from './useSourceState';

interface UseSourceTestingProps {
  fetchHealthMetrics: () => Promise<void>;
}

export const useSourceTesting = ({ fetchHealthMetrics }: UseSourceTestingProps) => {
  const { toast } = useToast();

  const testSource = async (source: UnifiedSource) => {
    try {
      console.log('Testing source connection:', source.name);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const startTime = Date.now();
      const response = await fetch(source.api_endpoint, {
        method: 'HEAD',
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      const success = response.ok;
      
      await supabase
        .from('source_health_metrics')
        .insert([{
          source_id: source.id,
          success,
          response_time_ms: responseTime,
          records_processed: 0,
          error_message: success ? null : `HTTP ${response.status}: ${response.statusText}`
        }]);

      await fetchHealthMetrics();

      toast({
        title: success ? 'Connection Successful' : 'Connection Failed',
        description: `Response time: ${responseTime}ms`,
        variant: success ? 'default' : 'destructive'
      });

      return { success, responseTime };
    } catch (err) {
      console.error('Error testing source:', err);
      
      await supabase
        .from('source_health_metrics')
        .insert([{
          source_id: source.id,
          success: false,
          response_time_ms: 0,
          records_processed: 0,
          error_message: err instanceof Error ? err.message : 'Connection failed'
        }]);

      await fetchHealthMetrics();

      toast({
        title: 'Connection Test Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });

      return { success: false, responseTime: 0 };
    }
  };

  return {
    testSource
  };
};
