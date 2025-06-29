
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plane, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Plus,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  fetchTravelIntegrationConfigs,
  createTravelIntegrationConfig,
  updateTravelIntegrationConfig,
  fetchTravelRecords,
  type TravelIntegrationConfig,
  type TravelRecord
} from '@/services/travelService';

const TravelIntegrationDashboard = () => {
  const [integrations, setIntegrations] = useState<TravelIntegrationConfig[]>([]);
  const [travelRecords, setTravelRecords] = useState<TravelRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    platformName: '',
    apiEndpoint: '',
    isActive: false,
    syncFrequencyMinutes: 60
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [integrationsData, recordsData] = await Promise.all([
        fetchTravelIntegrationConfigs(),
        fetchTravelRecords()
      ]);
      setIntegrations(integrationsData);
      setTravelRecords(recordsData);
    } catch (error) {
      console.error('Error loading travel data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load travel integration data',
        variant: 'destructive'
      });
    }
  };

  const handleCreateIntegration = async () => {
    if (!newIntegration.platformName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Platform name is required',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await createTravelIntegrationConfig(newIntegration);
      
      toast({
        title: 'Integration Created',
        description: `${newIntegration.platformName} integration has been created`,
      });

      setNewIntegration({
        platformName: '',
        apiEndpoint: '',
        isActive: false,
        syncFrequencyMinutes: 60
      });

      await loadData();
    } catch (error) {
      console.error('Error creating integration:', error);
      toast({
        title: 'Creation Failed',
        description: 'Failed to create travel integration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntegration = async (id: string, isActive: boolean) => {
    try {
      await updateTravelIntegrationConfig(id, { isActive });
      
      toast({
        title: 'Integration Updated',
        description: `Integration has been ${isActive ? 'enabled' : 'disabled'}`,
      });

      await loadData();
    } catch (error) {
      console.error('Error updating integration:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update integration status',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: TravelIntegrationConfig['syncStatus']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: TravelIntegrationConfig['syncStatus']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      pending: 'secondary',
      disabled: 'outline'
    } as const;
    
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const activeTravelers = travelRecords.filter(record => 
    record.travelStatus !== 'home'
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter(i => i.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {integrations.length} configured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Travelers</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTravelers}</div>
            <p className="text-xs text-muted-foreground">
              employees currently traveling
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.filter(i => i.syncStatus === 'success').length}
            </div>
            <p className="text-xs text-muted-foreground">
              successful syncs
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="travel-records">Travel Records</TabsTrigger>
          <TabsTrigger value="add-integration">Add Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Travel Platform Integrations</CardTitle>
              <CardDescription>
                Manage connections to enterprise travel management systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No travel integrations configured yet
                  </div>
                ) : (
                  integrations.map(integration => (
                    <div key={integration.id} className="flex items-center justify-between p-4 border rounded">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(integration.syncStatus)}
                        <div>
                          <div className="font-medium">{integration.platformName}</div>
                          <div className="text-sm text-muted-foreground">
                            {integration.apiEndpoint || 'No endpoint configured'}
                          </div>
                          {integration.lastSyncAt && (
                            <div className="text-xs text-muted-foreground">
                              Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(integration.syncStatus)}
                        <Switch
                          checked={integration.isActive}
                          onCheckedChange={(checked) => 
                            handleToggleIntegration(integration.id, checked)
                          }
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="travel-records">
          <Card>
            <CardHeader>
              <CardTitle>Active Travel Records</CardTitle>
              <CardDescription>
                Current employee travel status and locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {travelRecords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No travel records found
                  </div>
                ) : (
                  travelRecords.slice(0, 10).map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3">
                        <Plane className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Employee {record.employeeId}</div>
                          <div className="text-sm text-muted-foreground">
                            Platform: {record.travelPlatform || 'Manual'}
                            {record.externalBookingId && ` • Booking: ${record.externalBookingId}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={record.travelStatus === 'home' ? 'secondary' : 'default'}>
                          {record.travelStatus.replace('_', ' ')}
                        </Badge>
                        {record.departureDate && (
                          <div className="text-xs text-muted-foreground">
                            {new Date(record.departureDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-integration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Integration
              </CardTitle>
              <CardDescription>
                Configure a new travel platform integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-name">Platform Name</Label>
                  <Input
                    id="platform-name"
                    value={newIntegration.platformName}
                    onChange={(e) => setNewIntegration({
                      ...newIntegration,
                      platformName: e.target.value
                    })}
                    placeholder="e.g., Concur Travel, SAP Travel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api-endpoint">API Endpoint</Label>
                  <Input
                    id="api-endpoint"
                    value={newIntegration.apiEndpoint}
                    onChange={(e) => setNewIntegration({
                      ...newIntegration,
                      apiEndpoint: e.target.value
                    })}
                    placeholder="https://api.platform.com/v1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sync-frequency">Sync Frequency (minutes)</Label>
                  <Input
                    id="sync-frequency"
                    type="number"
                    min="1"
                    value={newIntegration.syncFrequencyMinutes}
                    onChange={(e) => setNewIntegration({
                      ...newIntegration,
                      syncFrequencyMinutes: parseInt(e.target.value) || 60
                    })}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Switch
                      checked={newIntegration.isActive}
                      onCheckedChange={(checked) => setNewIntegration({
                        ...newIntegration,
                        isActive: checked
                      })}
                    />
                    Enable Integration
                  </Label>
                </div>
              </div>

              <Button 
                onClick={handleCreateIntegration} 
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Creating...' : 'Create Integration'}
              </Button>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Popular Platforms</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewIntegration({
                      ...newIntegration,
                      platformName: 'Concur Travel',
                      apiEndpoint: 'https://api.concursolutions.com/api/v3.0'
                    })}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Concur Travel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewIntegration({
                      ...newIntegration,
                      platformName: 'SAP Travel',
                      apiEndpoint: 'https://api.sap.com/travel/v1'
                    })}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    SAP Travel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TravelIntegrationDashboard;
