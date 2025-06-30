
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Shield, CheckCircle, RefreshCw } from 'lucide-react';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';

const SecurityDashboard: React.FC = () => {
  const {
    sessionValid,
    permissionCheck,
    rlsCheck,
    loading,
    lastChecked,
    refreshSecurityCheck
  } = useSecurityMonitor();

  const getSecurityBadge = (isValid: boolean, label: string) => (
    <Badge variant={isValid ? "default" : "destructive"} className="flex items-center gap-1">
      {isValid ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
      {label}
    </Badge>
  );

  const renderSecurityCheck = (check: any, title: string) => {
    if (!check) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{title}</h4>
          {getSecurityBadge(check.isValid, check.isValid ? 'Secure' : 'Issues Found')}
        </div>
        
        {check.errors.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-red-600">Errors:</p>
            {check.errors.map((error: string, index: number) => (
              <p key={index} className="text-sm text-red-600 ml-2">• {error}</p>
            ))}
          </div>
        )}
        
        {check.warnings.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-yellow-600">Warnings:</p>
            {check.warnings.map((warning: string, index: number) => (
              <p key={index} className="text-sm text-yellow-600 ml-2">• {warning}</p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Monitor
            </CardTitle>
            <CardDescription>
              System security status and monitoring
              {lastChecked && (
                <span className="block text-xs mt-1">
                  Last checked: {lastChecked.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSecurityCheck}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Session Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="font-medium">Session Status</span>
          </div>
          {getSecurityBadge(sessionValid, sessionValid ? 'Valid' : 'Invalid')}
        </div>

        {/* Permission Check */}
        {permissionCheck && renderSecurityCheck(permissionCheck, 'User Permissions')}

        {/* RLS Check */}
        {rlsCheck && renderSecurityCheck(rlsCheck, 'Row Level Security')}

        {loading && (
          <div className="flex items-center justify-center p-6">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Running security checks...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SecurityDashboard;
