
import { DiagnosticResult } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database,
  Shield,
  Globe,
  Settings,
  Activity
} from 'lucide-react';

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pass': return CheckCircle;
    case 'fail': return XCircle;
    case 'warning': return AlertTriangle;
    case 'running': return RefreshCw;
    default: return null;
  }
};

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'auth': return Shield;
    case 'database': return Database;
    case 'api': return Globe;
    case 'frontend': return Settings;
    case 'security': return Shield;
    default: return Activity;
  }
};

export const getStatusVariant = (status: string) => {
  const variants = {
    pass: 'default',
    fail: 'destructive',
    warning: 'secondary',
    running: 'outline'
  } as const;
  
  return variants[status as keyof typeof variants] || 'outline';
};

export const categorizeResults = (results: DiagnosticResult[]) => {
  return results.reduce((acc, result) => {
    if (!acc[result.category]) acc[result.category] = [];
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, DiagnosticResult[]>);
};

export const getOverallStatus = (results: DiagnosticResult[]) => {
  if (results.length === 0) return 'running';
  if (results.some(r => r.status === 'fail')) return 'fail';
  if (results.some(r => r.status === 'warning')) return 'warning';
  return 'pass';
};
