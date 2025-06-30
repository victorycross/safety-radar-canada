
import { DiagnosticResult } from '../types';

export const runFrontendDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = [];

  try {
    const componentChecks = [
      { name: 'Router', status: window.location ? 'pass' : 'fail' },
      { name: 'Local Storage', status: typeof localStorage !== 'undefined' ? 'pass' : 'fail' },
      { name: 'Console API', status: typeof console !== 'undefined' ? 'pass' : 'fail' },
      { name: 'DOM API', status: typeof document !== 'undefined' ? 'pass' : 'fail' }
    ];

    componentChecks.forEach(check => {
      results.push({
        name: check.name,
        status: check.status as 'pass' | 'fail',
        message: `${check.name} ${check.status === 'pass' ? 'working' : 'not working'}`,
        details: [],
        category: 'frontend'
      });
    });
  } catch (error) {
    results.push({
      name: 'Frontend Components',
      status: 'fail',
      message: 'Frontend diagnostic error',
      details: [error instanceof Error ? error.message : 'Unknown frontend error'],
      category: 'frontend'
    });
  }

  return results;
};
