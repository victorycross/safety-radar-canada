
import { DiagnosticResult } from '../types';
import { supabase } from '@/integrations/supabase/client';

export const runDatabaseDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];

  // Database Connectivity
  try {
    const { data: provinces, error: provincesError } = await supabase
      .from('provinces')
      .select('id, name')
      .limit(1);

    results.push({
      name: 'Database Connection',
      status: provincesError ? 'fail' : 'pass',
      message: provincesError ? 'Database connection failed' : 'Database connected successfully',
      details: provincesError ? [provincesError.message] : [`Sample query returned ${provinces?.length || 0} records`],
      category: 'database'
    });
  } catch (error) {
    results.push({
      name: 'Database Connection',
      status: 'fail',
      message: 'Database connection error',
      details: [error instanceof Error ? error.message : 'Unknown database error'],
      category: 'database'
    });
  }

  // Table Structure Validation
  const tableChecks = [
    { name: 'provinces', query: () => supabase.from('provinces').select('*').limit(1) },
    { name: 'incidents', query: () => supabase.from('incidents').select('*').limit(1) },
    { name: 'alert_sources', query: () => supabase.from('alert_sources').select('*').limit(1) },
    { name: 'user_roles', query: () => supabase.from('user_roles').select('*').limit(1) },
    { name: 'security_audit_log', query: () => supabase.from('security_audit_log').select('*').limit(1) }
  ];

  for (const tableCheck of tableChecks) {
    try {
      const { error } = await tableCheck.query();
      results.push({
        name: `Table: ${tableCheck.name}`,
        status: error ? 'fail' : 'pass',
        message: error ? `Table ${tableCheck.name} not accessible` : `Table ${tableCheck.name} accessible`,
        details: error ? [error.message] : ['Table structure valid'],
        category: 'database'
      });
    } catch (error) {
      results.push({
        name: `Table: ${tableCheck.name}`,
        status: 'fail',
        message: `Table ${tableCheck.name} error`,
        details: [error instanceof Error ? error.message : 'Unknown table error'],
        category: 'database'
      });
    }
  }

  return results;
};
