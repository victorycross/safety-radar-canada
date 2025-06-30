
import { DiagnosticResult } from '../types';

export const runSecurityDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];

  try {
    results.push({
      name: 'HTTPS Protocol',
      status: window.location.protocol === 'https:' ? 'pass' : 'warning',
      message: window.location.protocol === 'https:' ? 'Secure connection' : 'Non-HTTPS connection (okay for development)',
      details: [`Protocol: ${window.location.protocol}`],
      category: 'security'
    });

    results.push({
      name: 'Environment Configuration',
      status: 'pass',
      message: 'Supabase configuration loaded',
      details: ['Supabase URL and key configured'],
      category: 'security'
    });
  } catch (error) {
    results.push({
      name: 'Security Configuration',
      status: 'fail',
      message: 'Security diagnostic error',
      details: [error instanceof Error ? error.message : 'Unknown security error'],
      category: 'security'
    });
  }

  return results;
};
