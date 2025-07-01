
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Activity, 
  Upload, 
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText
} from 'lucide-react';
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from 'react-router-dom';
import { useSourceManagement } from '@/hooks/useSourceManagement';
import { useDataIngestion } from '@/hooks/useDataIngestion';
import DataTemplateDocumentation from '@/components/data-templates/DataTemplateDocumentation';
import BulkDataImporter from '@/components/data-templates/BulkDataImporter';

const SimplifiedDataManagementPage = () => {
  const { isAdmin } = useAuth();
  const { sources, loading: sourcesLoading } = useSourceManagement();
  const { healthMetrics, queueStatus } = useDataIngestion();

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'degraded': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'degraded': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'power_user']}
      fallbackMessage="Data Management requires Administrator or Power User privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Data Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage data sources, processing, templates, and system health
            </p>
          </div>
          
          {isAdmin() && (
            <Button variant="outline" asChild>
              <Link to="/admin?tab=data-management" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced Settings
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sources">Data Sources</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sources.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {sources.filter(s => s.is_active).length} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Processing Queue</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{queueStatus?.pending || 0}</div>
                  <p className="text-xs text-muted-foreground">items pending</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">System Health</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Good</div>
                  <p className="text-xs text-muted-foreground">all systems operational</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest data processing and source updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthMetrics.slice(0, 5).map((metric, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`p-1 rounded-full ${metric.success ? 'bg-green-100' : 'bg-red-100'}`}>
                          {metric.success ? (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">Data source check</p>
                          <p className="text-xs text-muted-foreground">
                            {metric.records_processed} records processed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {new Date(metric.timestamp).toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {metric.response_time_ms}ms
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Sources</CardTitle>
                <CardDescription>Monitor and manage your data sources</CardDescription>
              </CardHeader>
              <CardContent>
                {sourcesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sources.map((source) => {
                      const StatusIcon = getHealthStatusIcon(source.health_status);
                      return (
                        <div key={source.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <StatusIcon className="h-5 w-5" />
                            <div>
                              <h3 className="font-medium">{source.name}</h3>
                              <p className="text-sm text-muted-foreground">{source.description}</p>
                              <p className="text-xs text-muted-foreground">
                                Type: {source.source_type} • 
                                Last poll: {source.last_poll_at ? new Date(source.last_poll_at).toLocaleString() : 'Never'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getHealthStatusColor(source.health_status) as any}>
                              {source.health_status}
                            </Badge>
                            <Badge variant={source.is_active ? 'default' : 'secondary'}>
                              {source.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="processing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Status</CardTitle>
                <CardDescription>Monitor data processing and queue status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5" />
                      <div>
                        <h3 className="font-medium">Processing Queue</h3>
                        <p className="text-sm text-muted-foreground">
                          Items waiting to be processed
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {queueStatus?.pending || 0} pending
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-5 w-5" />
                      <div>
                        <h3 className="font-medium">Processing Rate</h3>
                        <p className="text-sm text-muted-foreground">
                          Average items processed per minute
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {healthMetrics.length > 0 ? Math.round(healthMetrics.length / 60) : 0}/min
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Operations</CardTitle>
                <CardDescription>Perform bulk data operations and file uploads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Upload Data Files</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload CSV files for bulk employee updates or location data
                    </p>
                    <Button variant="outline">
                      Select Files
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Employee Updates</CardTitle>
                        <CardDescription>Bulk update employee locations and counts</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">Upload Employee Data</Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Location Data</CardTitle>
                        <CardDescription>Update province and hub information</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button className="w-full">Upload Location Data</Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Data Templates & Documentation
                </CardTitle>
                <CardDescription>
                  Access standardized templates, validation rules, and comprehensive documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="documentation" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="documentation">Documentation</TabsTrigger>
                    <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
                  </TabsList>

                  <TabsContent value="documentation" className="mt-4">
                    <DataTemplateDocumentation />
                  </TabsContent>

                  <TabsContent value="bulk-import" className="mt-4">
                    <BulkDataImporter />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleProtectedRoute>
  );
};

export default SimplifiedDataManagementPage;
