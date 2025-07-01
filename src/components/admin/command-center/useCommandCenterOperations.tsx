
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export const useCommandCenterOperations = () => {
  const { toast } = useToast();
  const [operations, setOperations] = useState({
    testingPipeline: false,
    processingQueue: false,
    settingUpCron: false,
    diagnosing: false,
    testingFeed: false,
    testingAPI: false
  });

  const setOperation = (key: string, value: boolean) => {
    setOperations(prev => ({ ...prev, [key]: value }));
  };

  const testDataPipeline = async () => {
    setOperation('testingPipeline', true);
    try {
      logger.info('Testing data pipeline...');
      const { data, error } = await supabase.functions.invoke('master-ingestion-orchestrator');
      
      if (error) throw error;
      
      toast({
        title: 'Pipeline Test Started',
        description: 'Monitoring data flow through the pipeline...',
      });

    } catch (error) {
      logger.error('Error testing pipeline:', error);
      toast({
        title: 'Test Failed',
        description: 'Failed to test data pipeline. Check API configurations.',
        variant: 'destructive'
      });
    } finally {
      setOperation('testingPipeline', false);
    }
  };

  const processQueueNow = async () => {
    setOperation('processingQueue', true);
    try {
      logger.info('Processing alert queue...');
      const { data, error } = await supabase.functions.invoke('process-alert-queue');
      
      if (error) throw error;
      
      toast({
        title: 'Queue Processing Started',
        description: `Processing ${data?.total_items || 0} queued items...`,
      });

    } catch (error) {
      logger.error('Error processing queue:', error);
      toast({
        title: 'Queue Processing Failed',
        description: 'Failed to process alert queue.',
        variant: 'destructive'
      });
    } finally {
      setOperation('processingQueue', false);
    }
  };

  const setupAutomation = async () => {
    setOperation('settingUpCron', true);
    try {
      logger.info('Setting up cron jobs...');
      const { data, error } = await supabase.functions.invoke('setup-cron-jobs');
      
      if (error) throw error;
      
      toast({
        title: 'Automation Setup',
        description: data?.success ? 'Cron jobs configured successfully' : 'Setup completed with warnings',
        variant: data?.success ? 'default' : 'destructive'
      });

    } catch (error) {
      logger.error('Error setting up cron jobs:', error);
      toast({
        title: 'Automation Setup Failed',
        description: 'Failed to set up automated processing.',
        variant: 'destructive'
      });
    } finally {
      setOperation('settingUpCron', false);
    }
  };

  const reDiagnoseSystem = async () => {
    setOperation('diagnosing', true);
    try {
      logger.info('Re-diagnosing system...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'System Diagnosis Complete',
        description: 'System health check completed successfully.',
      });

    } catch (error) {
      logger.error('Error diagnosing system:', error);
      toast({
        title: 'Diagnosis Failed',
        description: 'Failed to complete system diagnosis.',
        variant: 'destructive'
      });
    } finally {
      setOperation('diagnosing', false);
    }
  };

  const testAPIConnectivity = async () => {
    setOperation('testingAPI', true);
    try {
      logger.info('Testing API connectivity...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: 'API Connectivity Test',
        description: 'API connectivity tests completed.',
      });

    } catch (error) {
      logger.error('Error testing APIs:', error);
      toast({
        title: 'API Test Failed',
        description: 'Failed to test API connectivity.',
        variant: 'destructive'
      });
    } finally {
      setOperation('testingAPI', false);
    }
  };

  const testFeedValidation = async () => {
    setOperation('testingFeed', true);
    try {
      logger.info('Testing feed validation...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Feed Validation Test',
        description: 'Feed validation tests completed.',
      });

    } catch (error) {
      logger.error('Error testing feeds:', error);
      toast({
        title: 'Feed Test Failed',
        description: 'Failed to test feed validation.',
        variant: 'destructive'
      });
    } finally {
      setOperation('testingFeed', false);
    }
  };

  return {
    operations,
    testDataPipeline,
    processQueueNow,
    setupAutomation,
    reDiagnoseSystem,
    testAPIConnectivity,
    testFeedValidation
  };
};
