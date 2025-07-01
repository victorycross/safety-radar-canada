
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, Activity, Lock, Eye, RefreshCw } from 'lucide-react';

interface SecurityMetric {
  id: string;
  action: string;
  created_at: string;
  new_values: any;
  user_id?: string;
}

interface SecurityAlert {
  type: 'warning' | 'error' | 'info';
  message: string;
  count?: number;
}

const SecurityDashboard: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSecurityMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch recent security events
      const { data: auditLogs, error } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setMetrics(auditLogs || []);
      
      // Analyze security patterns
      const securityAlerts = analyzeSecurityPatterns(auditLogs || []);
      setAlerts(securityAlerts);
      
    } catch (error) {
      console.error('Error fetching security metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSecurityPatterns = (logs: SecurityMetric[]): SecurityAlert[] => {
    const alerts: SecurityAlert[] = [];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Recent failed login attempts
    const recentFailedLogins = logs.filter(log => 
      log.action === 'LOGIN_FAILURE' && 
      new Date(log.created_at) > oneHourAgo
    );
    
    if (recentFailedLogins.length > 10) {
      alerts.push({
        type: 'warning',
        message: 'High number of failed login attempts detected',
        count: recentFailedLogins.length
      });
    }

    // Suspicious activity patterns
    const suspiciousActivity = logs.filter(log => 
      log.action === 'SUSPICIOUS_ACTIVITY' && 
      new Date(log.created_at) > oneHourAgo
    );
    
    if (suspiciousActivity.length > 0) {
      alerts.push({
        type: 'error',
        message: 'Suspicious activity detected',
        count: suspiciousActivity.length
      });
    }

    // Admin access patterns
    const adminAccess = logs.filter(log => 
      log.action === 'ADMIN_ACCESS' && 
      new Date(log.created_at) > oneHourAgo
    );
    
    if (adminAccess.length > 0) {
      alerts.push({
        type: 'info',
        message: 'Recent admin access logged',
        count: adminAccess.length
      });
    }

    return alerts;
  };

  useEffect(() => {
    if (isAdmin()) {
      fetchSecurityMetrics();
      
      // Set up real-time updates
      const interval = setInterval(fetchSecurityMetrics, 30000); // Every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  if (!isAdmin()) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Administrator access required</p>
        </CardContent>
      </Card>
    );
  }

  const getAlertIcon = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'info': return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertColor = (type: SecurityAlert['type']) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'info': return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Security Dashboard
          </h2>
          <p className="text-muted-foreground">Monitor security events and system health</p>
        </div>
        <Button onClick={fetchSecurityMetrics} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Security Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Active Security Alerts</h3>
          {alerts.map((alert, index) => (
            <Alert key={index} className={getAlertColor(alert.type)}>
              {getAlertIcon(alert.type)}
              <AlertDescription className="flex items-center justify-between">
                <span>{alert.message}</span>
                {alert.count && (
                  <Badge variant="outline">{alert.count} events</Badge>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Failed Logins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.filter(m => m.action === 'LOGIN_FAILURE').length}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.filter(m => m.action === 'ADMIN_ACCESS').length}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>Latest security-related activities</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading security events...</div>
          ) : metrics.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No security events found
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {metrics.slice(0, 20).map((metric) => (
                <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {metric.action}
                      </Badge>
                      <span className="text-sm font-medium">
                        {new Date(metric.created_at).toLocaleString()}
                      </span>
                    </div>
                    {metric.new_values && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {typeof metric.new_values === 'object' ? 
                          Object.entries(metric.new_values).slice(0, 2).map(([key, value]) => (
                            <span key={key} className="mr-3">
                              {key}: {String(value)}
                            </span>
                          )) : 
                          String(metric.new_values)
                        }
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityDashboard;
