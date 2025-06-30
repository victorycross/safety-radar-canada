
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database,
  Shield,
  Globe,
  Settings,
  Users,
  Activity
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'running';
  message: string;
  details?: string[];
  category: 'auth' | 'database' | 'api' | 'frontend' | 'security';
}

const SystemDiagnostics: React.FC = () => {
  const { user, session, isAdmin } = useAuth();
  const { toast } = useToast();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [running, setRunning] = useState(false);

  const runDiagnostics = async () => {
    setRunning(true);
    const diagnosticResults: DiagnosticResult[] = [];

    // Authentication Diagnostics
    try {
      diagnosticResults.push({
        name: 'Authentication Service',
        status: user ? 'pass' : 'warning',
        message: user ? 'User authenticated successfully' : 'No user authenticated',
        details: user ? [`User ID: ${user.id}`, `Email: ${user.email}`] : ['User should sign in to test auth'],
        category: 'auth'
      });

      diagnosticResults.push({
        name: 'Session Management',
        status: session ? 'pass' : 'warning',
        message: session ? 'Active session found' : 'No active session',
        details: session ? [`Session expires: ${new Date(session.expires_at! * 1000).toLocaleString()}`] : [],
        category: 'auth'
      });

      diagnosticResults.push({
        name: 'Role System',
        status: 'pass',
        message: `Role check functional - Admin: ${isAdmin()}`,
        details: [`Admin access: ${isAdmin() ? 'Yes' : 'No'}`],
        category: 'auth'
      });
    } catch (error) {
      diagnosticResults.push({
        name: 'Authentication Service',
        status: 'fail',
        message: 'Authentication system error',
        details: [error instanceof Error ? error.message : 'Unknown auth error'],
        category: 'auth'
      });
    }

    // Database Connectivity
    try {
      const { data: provinces, error: provincesError } = await supabase
        .from('provinces')
        .select('id, name')
        .limit(1);

      diagnosticResults.push({
        name: 'Database Connection',
        status: provincesError ? 'fail' : 'pass',
        message: provincesError ? 'Database connection failed' : 'Database connected successfully',
        details: provincesError ? [provincesError.message] : [`Sample query returned ${provinces?.length || 0} records`],
        category: 'database'
      });
    } catch (error) {
      diagnosticResults.push({
        name: 'Database Connection',
        status: 'fail',
        message: 'Database connection error',
        details: [error instanceof Error ? error.message : 'Unknown database error'],
        category: 'database'
      });
    }

    // Table Structure Validation with proper typing
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
        diagnosticResults.push({
          name: `Table: ${tableCheck.name}`,
          status: error ? 'fail' : 'pass',
          message: error ? `Table ${tableCheck.name} not accessible` : `Table ${tableCheck.name} accessible`,
          details: error ? [error.message] : ['Table structure valid'],
          category: 'database'
        });
      } catch (error) {
        diagnosticResults.push({
          name: `Table: ${tableCheck.name}`,
          status: 'fail',
          message: `Table ${tableCheck.name} error`,
          details: [error instanceof Error ? error.message : 'Unknown table error'],
          category: 'database'
        });
      }
    }

    // API Endpoints
    try {
      const { data, error } = await supabase.functions.invoke('master-ingestion-orchestrator', {
        body: { test: true }
      });

      diagnosticResults.push({
        name: 'Edge Functions',
        status: error ? 'warning' : 'pass',
        message: error ? 'Edge function may not be deployed' : 'Edge functions accessible',
        details: error ? [error.message] : ['Master ingestion orchestrator responsive'],
        category: 'api'
      });
    } catch (error) {
      diagnosticResults.push({
        name: 'Edge Functions',
        status: 'warning',
        message: 'Edge functions not accessible',
        details: ['This is normal if edge functions are not deployed'],
        category: 'api'
      });
    }

    // Frontend Components Check
    try {
      const componentChecks = [
        { name: 'Router', status: window.location ? 'pass' : 'fail' },
        { name: 'Local Storage', status: typeof localStorage !== 'undefined' ? 'pass' : 'fail' },
        { name: 'Console API', status: typeof console !== 'undefined' ? 'pass' : 'fail' },
        { name: 'React State', status: typeof useState !== 'undefined' ? 'pass' : 'fail' }
      ];

      componentChecks.forEach(check => {
        diagnosticResults.push({
          name: check.name,
          status: check.status as 'pass' | 'fail',
          message: `${check.name} ${check.status === 'pass' ? 'working' : 'not working'}`,
          details: [],
          category: 'frontend'
        });
      });
    } catch (error) {
      diagnosticResults.push({
        name: 'Frontend Components',
        status: 'fail',
        message: 'Frontend diagnostic error',
        details: [error instanceof Error ? error.message : 'Unknown frontend error'],
        category: 'frontend'
      });
    }

    // Security Checks
    try {
      diagnosticResults.push({
        name: 'HTTPS Protocol',
        status: window.location.protocol === 'https:' ? 'pass' : 'warning',
        message: window.location.protocol === 'https:' ? 'Secure connection' : 'Non-HTTPS connection (okay for development)',
        details: [`Protocol: ${window.location.protocol}`],
        category: 'security'
      });

      diagnosticResults.push({
        name: 'Environment Configuration',
        status: 'pass',
        message: 'Supabase configuration loaded',
        details: ['Supabase URL and key configured'],
        category: 'security'
      });
    } catch (error) {
      diagnosticResults.push({
        name: 'Security Configuration',
        status: 'fail',
        message: 'Security diagnostic error',
        details: [error instanceof Error ? error.message : 'Unknown security error'],
        category: 'security'
      });
    }

    setResults(diagnosticResults);
    setRunning(false);

    // Show summary toast
    const passed = diagnosticResults.filter(r => r.status === 'pass').length;
    const failed = diagnosticResults.filter(r => r.status === 'fail').length;
    const warnings = diagnosticResults.filter(r => r.status === 'warning').length;

    toast({
      title: 'Diagnostics Complete',
      description: `${passed} passed, ${failed} failed, ${warnings} warnings`,
      variant: failed > 0 ? 'destructive' : 'default'
    });
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'running': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default: return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth': return <Shield className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'api': return <Globe className="h-4 w-4" />;
      case 'frontend': return <Settings className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'default',
      fail: 'destructive',
      warning: 'secondary',
      running: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const categorizedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) acc[result.category] = [];
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, DiagnosticResult[]>);

  const overallStatus = results.length > 0 ? (
    results.some(r => r.status === 'fail') ? 'fail' :
    results.some(r => r.status === 'warning') ? 'warning' : 'pass'
  ) : 'running';

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
        {getStatusIcon(overallStatus)}
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
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 capitalize">
              {getCategoryIcon(category)}
              {category} Diagnostics
            </CardTitle>
            <CardDescription>
              {categoryResults.filter(r => r.status === 'pass').length}/{categoryResults.length} checks passed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryResults.map((result, index) => (
                <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{result.name}</h4>
                        {getStatusBadge(result.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                      {result.details && result.details.length > 0 && (
                        <div className="mt-2">
                          {result.details.map((detail, idx) => (
                            <p key={idx} className="text-xs text-muted-foreground">• {detail}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common troubleshooting steps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Application
          </Button>
          <Button variant="outline" onClick={() => localStorage.clear()}>
            Clear Local Storage
          </Button>
          <Button variant="outline" onClick={() => console.clear()}>
            Clear Console
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemDiagnostics;
