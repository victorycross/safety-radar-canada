
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SecurityDashboard from '@/components/security/SecurityDashboard';
import { useAuth } from '@/components/auth/AuthProvider';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import RealtimeStatus from '@/components/ui/RealtimeStatus';
import { Badge } from '@/components/ui/badge';
import { Shield, Activity, Database, Users } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const SecurityMonitoringPage: React.FC = () => {
  const { user, securityScore, userRoles } = useAuth();
  const { status } = useRealtimeUpdates();

  const getSecurityBadgeColor = () => {
    if (securityScore >= 80) return 'default';
    if (securityScore >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Security Monitoring</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive security and real-time system monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <RealtimeStatus />
            <Badge variant={getSecurityBadgeColor()} className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Security Score: {securityScore}%
            </Badge>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Security Score</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{securityScore}%</div>
              <p className="text-xs text-muted-foreground">
                {securityScore >= 80 ? 'Excellent' : securityScore >= 60 ? 'Good' : 'Needs Attention'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Real-time Status</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {status.isConnected ? 'Online' : 'Offline'}
              </div>
              <p className="text-xs text-muted-foreground">
                {status.subscriptions.length} active subscriptions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Roles</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userRoles.length}</div>
              <p className="text-xs text-muted-foreground">
                {userRoles.join(', ') || 'No roles assigned'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Update</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {status.lastUpdate ? status.lastUpdate.toLocaleTimeString() : 'Never'}
              </div>
              <p className="text-xs text-muted-foreground">
                Data synchronization
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="security" className="space-y-4">
          <TabsList>
            <TabsTrigger value="security">Security Dashboard</TabsTrigger>
            <TabsTrigger value="realtime">Real-time Monitoring</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="security" className="space-y-4">
            <SecurityDashboard />
          </TabsContent>

          <TabsContent value="realtime" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Connections</CardTitle>
                <CardDescription>
                  Monitor live data connections and subscription status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {status.subscriptions.map((subscription, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm capitalize">{subscription}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge variant={status.isConnected ? 'default' : 'destructive'}>
                          {status.isConnected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {status.errorCount > 0 && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader>
                      <CardTitle className="text-yellow-800">Connection Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-yellow-700">
                        {status.errorCount} connection error{status.errorCount !== 1 ? 's' : ''} detected.
                        Real-time updates may be delayed.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  View recent system activity and security events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user && (
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">User authenticated</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  
                  {status.lastUpdate && (
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Real-time data updated</span>
                      <span className="text-xs text-muted-foreground">
                        {status.lastUpdate.toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Security monitoring active</span>
                    <span className="text-xs text-muted-foreground">
                      Continuous
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
};

export default SecurityMonitoringPage;
