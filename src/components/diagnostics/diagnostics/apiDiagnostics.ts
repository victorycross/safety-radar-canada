
import { DiagnosticResult } from '../types';
import { supabase } from '@/integrations/supabase/client';

export const runApiDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];

  try {
    const { data, error } = await supabase.functions.invoke('master-ingestion-orchestrator', {
      body: { test: true }
    });

    results.push({
      name: 'Edge Functions',
      status: error ? 'warning' : 'pass',
      message: error ? 'Edge function may not be deployed' : 'Edge functions accessible',
      details: error ? [error.message] : ['Master ingestion orchestrator responsive'],
      category: 'api'
    });
  } catch (error) {
    results.push({
      name: 'Edge Functions',
      status: 'warning',
      message: 'Edge functions not accessible',
      details: ['This is normal if edge functions are not deployed'],
      category: 'api'
    });
  }

  return results;
};
