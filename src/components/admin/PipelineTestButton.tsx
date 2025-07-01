
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { logger } from '@/utils/logger';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

const PipelineTestButton: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const { toast } = useToast();

  const testPipeline = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      logger.info('Testing data pipeline...');
      
      // Test 1: Check if edge function responds
      const { data, error } = await supabase.functions.invoke('master-ingestion-orchestrator');
      
      if (error) {
        logger.error('Edge function test failed:', error);
        setResult({
          success: false,
          message: 'Edge function failed to respond',
          details: error
        });
        return;
      }
      
      logger.info('Edge function response:', data);
      
      // Test 2: Check if data sources are accessible
      const { data: sources, error: sourcesError } = await supabase
        .from('alert_sources')
        .select('*')
        .limit(1);
        
      if (sourcesError) {
        logger.error('Database access test failed:', sourcesError);
        setResult({
          success: false,
          message: 'Database access failed',
          details: sourcesError
        });
        return;
      }
      
      // Success
      setResult({
        success: true,
        message: 'Pipeline test successful - ready for real data processing',
        details: {
          edgeFunction: 'Responsive',
          database: 'Accessible',
          configuredSources: sources?.length || 0,
          processedSources: data?.processed_sources || 0
        }
      });
      
      toast({
        title: 'Pipeline Test Complete',
        description: `Pipeline is ready to process real data from ${sources?.length || 0} configured sources`,
      });
      
    } catch (error) {
      logger.error('Pipeline test error:', error);
      setResult({
        success: false,
        message: 'Unexpected error during test',
        details: error
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={testPipeline} 
        disabled={testing}
        variant="outline"
        className="w-full"
      >
        {testing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Testing Pipeline...
          </>
        ) : (
          'Test Data Pipeline'
        )}
      </Button>
      
      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">{result.message}</p>
              {result.details && (
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PipelineTestButton;
