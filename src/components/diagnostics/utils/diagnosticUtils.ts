
import { DiagnosticResult, DiagnosticCategory } from '../types';
import { 
  Shield, 
  Database, 
  Globe, 
  Monitor, 
  Lock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export const categorizeResults = (results: DiagnosticResult[]): Record<string, DiagnosticResult[]> => {
  return results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, DiagnosticResult[]>);
};

export const getOverallStatus = (results: DiagnosticResult[]): 'pass' | 'fail' | 'warning' => {
  if (results.some(r => r.status === 'fail')) return 'fail';
  if (results.some(r => r.status === 'warning')) return 'warning';
  return 'pass';
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'auth': return Shield;
    case 'database': return Database;
    case 'api': return Globe;
    case 'frontend': return Monitor;
    case 'security': return Lock;
    default: return Shield;
  }
};

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pass': return CheckCircle;
    case 'fail': return XCircle;
    case 'warning': return AlertTriangle;
    case 'running': return Loader2;
    default: return CheckCircle;
  }
};
