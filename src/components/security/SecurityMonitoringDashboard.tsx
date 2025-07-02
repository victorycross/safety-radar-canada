
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Lock, 
  Eye, 
  RefreshCw,
  TrendingUp,
  Clock,
  Globe,
  Users
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedRateLimiter } from '@/utils/enhancedRateLimit';
import { SecurityConfigService } from '@/services/securityConfigService';
import { formatDistanceToNow } from 'date-fns';

interface SecurityMetrics {
  totalLogins: number;
  failedLogins: number;
  suspiciousActivities: number;
  blockedIPs: number;
  activeUsers: number;
  rateLimitViolations: number;
}

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  details: any;
}

const SecurityMonitoringDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalLogins: 0,
    failedLogins: 0,
    suspiciousActivities: 0,
    blockedIPs: 0,
    activeUsers: 0,
    rateLimitViolations: 0
  });
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadSecurityData = async () => {
    if (!isAdmin()) return;
    
    setLoading(true);
    try {
      // Load security audit logs
      const { data: auditLogs, error: auditError } = await supabase
        .from('security_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (auditError) throw auditError;

      // Calculate metrics from audit logs
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentLogs = auditLogs?.filter(log => 
        new Date(log.created_at) > last24Hours
      ) || [];

      const newMetrics: SecurityMetrics = {
        totalLogins: recentLogs.filter(log => log.action === 'LOGIN_SUCCESS').length,
        failedLogins: recentLogs.filter(log => log.action === 'LOGIN_FAILURE').length,
        suspiciousActivities: recentLogs.filter(log => log.action === 'SUSPICIOUS_ACTIVITY').length,
        blockedIPs: EnhancedRateLimiter.getStats().blockedIPs,
        activeUsers: new Set(recentLogs.map(log => log.user_id).filter(Boolean)).size,
        rateLimitViolations: recentLogs.filter(log => log.action === 'RATE_LIMIT_EXCEEDED').length
      };

      setMetrics(newMetrics);

      // Generate alerts from recent suspicious activities
      const securityAlerts: SecurityAlert[] = recentLogs
        .filter(log => 
          ['SUSPICIOUS_ACTIVITY', 'RATE_LIMIT_EXCEEDED', 'CONCURRENT_SESSION'].includes(log.action)
        )
        .map(log => ({
          id: log.id,
          type: log.action,
          severity: log.action === 'SUSPICIOUS_ACTIVITY' ? 'high' : 'medium',
          message: `${log.action.replace(/_/g, ' ').toLowerCase()} detected`,
          timestamp: log.created_at,
          details: log.new_values
        }));

      setAlerts(securityAlerts);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  if (!isAdmin()) {
    return (
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Administrator access required to view security monitoring dashboard.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Security Monitoring</h2>
          <p className="text-muted-foreground">
            Last updated: {formatDistanceToNow(lastUpdate)} ago
          </p>
        </div>
        <Button onClick={loadSecurityData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins (24h)</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.totalLogins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins (24h)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.failedLogins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Activities</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.suspiciousActivities}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.blockedIPs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.activeUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit Violations</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.rateLimitViolations}</div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Recent Security Alerts
          </CardTitle>
          <CardDescription>
            Latest security events and alerts from the past 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No security alerts in the past 24 hours
            </p>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 10).map((alert) => (
                <div key={alert.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                      <span className="text-sm font-medium">{alert.message}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(alert.timestamp))} ago
                    </div>
                    {alert.details && (
                      <pre className="text-xs mt-2 p-2 bg-muted rounded">
                        {JSON.stringify(alert.details, null, 2)}
                      </pre>
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

export default SecurityMonitoringDashboard;
