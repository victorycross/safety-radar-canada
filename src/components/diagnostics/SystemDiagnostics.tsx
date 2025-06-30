
import React, { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useDiagnostics } from './hooks/useDiagnostics';
import { categorizeResults, getOverallStatus, getStatusIcon } from './utils/diagnosticUtils';
import DiagnosticCategoryCard from './components/DiagnosticCategoryCard';
import QuickActions from './components/QuickActions';

const SystemDiagnostics: React.FC = () => {
  const { results, running, runDiagnostics } = useDiagnostics();

  useEffect(() => {
    runDiagnostics();
  }, []);

  const categorizedResults = categorizeResults(results);
  const overallStatus = getOverallStatus(results);
  const StatusIcon = getStatusIcon(overallStatus);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Diagnostics</h2>
          <p className="text-muted-foreground">
            Comprehensive system health check and functionality validation
          </p>
        </div>
        <Button onClick={runDiagnostics} disabled={running}>
          <RefreshCw className={`mr-2 h-4 w-4 ${running ? 'animate-spin' : ''}`} />
          Run Diagnostics
        </Button>
      </div>

      {/* Overall Status */}
      <Alert variant={overallStatus === 'fail' ? 'destructive' : 'default'}>
        {StatusIcon && <StatusIcon className="h-5 w-5" />}
        <AlertDescription>
          <strong>System Status: {overallStatus.toUpperCase()}</strong>
          {results.length > 0 && (
            <span className="ml-2">
              ({results.filter(r => r.status === 'pass').length}/{results.length} checks passed)
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Diagnostic Results by Category */}
      {Object.entries(categorizedResults).map(([category, categoryResults]) => (
        <DiagnosticCategoryCard 
          key={category} 
          category={category} 
          results={categoryResults} 
        />
      ))}

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default SystemDiagnostics;
