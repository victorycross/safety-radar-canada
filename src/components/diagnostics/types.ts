
export interface DiagnosticResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'running';
  message: string;
  details?: string[];
  category: 'auth' | 'database' | 'api' | 'frontend' | 'security';
}

export type DiagnosticCategory = DiagnosticResult['category'];
