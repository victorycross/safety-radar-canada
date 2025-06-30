
import { useState } from 'react';
import { DiagnosticResult } from '../types';
import { runAuthDiagnostics } from '../diagnostics/authDiagnostics';
import { runDatabaseDiagnostics } from '../diagnostics/databaseDiagnostics';
import { runApiDiagnostics } from '../diagnostics/apiDiagnostics';
import { runFrontendDiagnostics } from '../diagnostics/frontendDiagnostics';
import { runSecurityDiagnostics } from '../diagnostics/securityDiagnostics';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

export const useDiagnostics = () => {
  const { user, session, isAdmin } = useAuth();
  const { toast } = useToast();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    const allResults: DiagnosticResult[] = [];

    try {
      // Run all diagnostic categories
      const authResults = await runAuthDiagnostics(user, session, isAdmin);
      const databaseResults = await runDatabaseDiagnostics();
      const apiResults = await runApiDiagnostics();
      const frontendResults = await runFrontendDiagnostics();
      const securityResults = await runSecurityDiagnostics();

      allResults.push(
        ...authResults,
        ...databaseResults,
        ...apiResults,
        ...frontendResults,
        ...securityResults
      );

      setResults(allResults);

      // Show summary toast
      const passed = allResults.filter(r => r.status === 'pass').length;
      const failed = allResults.filter(r => r.status === 'fail').length;
      const warnings = allResults.filter(r => r.status === 'warning').length;

      toast({
        title: 'Diagnostics Complete',
        description: `${passed} passed, ${failed} failed, ${warnings} warnings`,
        variant: failed > 0 ? 'destructive' : 'default'
      });
    } catch (error) {
      toast({
        title: 'Diagnostics Error',
        description: 'Failed to run diagnostics',
        variant: 'destructive'
      });
    } finally {
      setRunning(false);
    }
  };

  return {
    results,
    running,
    runDiagnostics
  };
};
