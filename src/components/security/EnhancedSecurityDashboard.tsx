import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Activity, Database, RefreshCw } from 'lucide-react';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import { supabase } from '@/integrations/supabase/client';

interface SecurityEvent {
  id: string;
  action: string;
  user_id: string | null;
  created_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

interface SecurityMetric {
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  description: string;
}

const EnhancedSecurityDashboard = () => {
  const { sessionValid, permissionCheck, rlsCheck, loading, refreshSecurityCheck } = useSecurityMonitor();
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSecurityEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('security_audit_log')
        .select('id, action, user_id, created_at, ip_address, user_agent')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Type-safe data transformation
      const typedEvents: SecurityEvent[] = (data || []).map(event => ({
        ...event,
        ip_address: event.ip_address as string | null,
        user_agent: event.user_agent as string | null
      }));
      
      setRecentEvents(typedEvents);
    } catch (error) {
      console.error('Failed to fetch security events:', error);
    }
  };

  const calculateSecurityMetrics = () => {
    const metrics: SecurityMetric[] = [
      {
        name: 'Session Security',
        value: sessionValid ? 100 : 0,
        status: sessionValid ? 'healthy' : 'critical',
        description: 'User session validation status'
      },
      {
        name: 'Permission Check',
        value: permissionCheck?.isValid ? 100 : 0,
        status: permissionCheck?.isValid ? 'healthy' : 'warning',
        description: 'User permission validation'
      },
      {
        name: 'RLS Coverage',
        value: rlsCheck?.isValid ? 100 : 0,
        status: rlsCheck?.isValid ? 'healthy' : 'warning',
        description: 'Row Level Security policy coverage'
      },
      {
        name: 'Failed Login Attempts',
        value: recentEvents.filter(e => e.action === 'login_failure').length,
        status: recentEvents.filter(e => e.action === 'login_failure').length > 5 ? 'critical' : 'healthy',
        description: 'Recent failed authentication attempts'
      }
    ];

    setSecurityMetrics(metrics);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      fetchSecurityEvents(),
      refreshSecurityCheck()
    ]);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchSecurityEvents();
  }, []);

  useEffect(() => {
    calculateSecurityMetrics();
  }, [sessionValid, permissionCheck, rlsCheck, recentEvents]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            Enhanced Security Monitoring
          </h2>
          <p className="text-muted-foreground">
            Real-time security status and threat monitoring with enhanced controls
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {securityMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.name}
              </CardTitle>
              {getStatusIcon(metric.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}%</div>
              <div className="flex items-center space-x-2 mt-2">
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Recent Security Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No recent security events found
            </p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">
                      {event.action}
                    </Badge>
                    <span className="text-sm">
                      {event.user_id ? `User: ${event.user_id.substring(0, 8)}...` : 'Anonymous'}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </div>
                    {event.ip_address && (
                      <div className="text-xs text-muted-foreground">
                        IP: {event.ip_address}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Security Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Security Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {securityMetrics.filter(m => m.status === 'healthy').length}
                </div>
                <div className="text-sm text-muted-foreground">Healthy Systems</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {securityMetrics.filter(m => m.status === 'warning').length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {securityMetrics.filter(m => m.status === 'critical').length}
                </div>
                <div className="text-sm text-muted-foreground">Critical Issues</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Recent Security Enhancements</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-green-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Enhanced RLS policies for data_sync_status and alert_ingestion_queue
                </div>
                <div className="flex items-center text-green-600">
                  <Shield className="h-4 w-4 mr-2" />
                  JWT verification enabled for sensitive edge functions
                </div>
                <div className="flex items-center text-green-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Content Security Policy updated with Mapbox domains
                </div>
                <div className="flex items-center text-green-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Mapbox token management improved with localStorage persistence
                </div>
                <div className="flex items-center text-green-600">
                  <Shield className="h-4 w-4 mr-2" />
                  Rate limiting added to edge functions
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedSecurityDashboard;