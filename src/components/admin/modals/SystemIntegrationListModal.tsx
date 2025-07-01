
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { useDataManagement, SystemIntegration } from '@/hooks/useDataManagement';

interface SystemIntegrationListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditIntegration: (integration: SystemIntegration) => void;
}

const SystemIntegrationListModal: React.FC<SystemIntegrationListModalProps> = ({
  isOpen,
  onClose,
  onEditIntegration
}) => {
  const { fetchSystemIntegrations, deleteSystemIntegration, updateSystemIntegration, loading } = useDataManagement();
  const [integrations, setIntegrations] = useState<SystemIntegration[]>([]);
  const [loadingIntegrations, setLoadingIntegrations] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadIntegrations();
    }
  }, [isOpen]);

  const loadIntegrations = async () => {
    setLoadingIntegrations(true);
    try {
      const integrationsData = await fetchSystemIntegrations();
      setIntegrations(integrationsData);
    } catch (error) {
      console.error('Error loading system integrations:', error);
    } finally {
      setLoadingIntegrations(false);
    }
  };

  const handleDeleteIntegration = async (integrationId: string) => {
    if (window.confirm('Are you sure you want to delete this system integration?')) {
      try {
        await deleteSystemIntegration(integrationId);
        await loadIntegrations();
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleToggleActive = async (integration: SystemIntegration) => {
    try {
      await updateSystemIntegration(integration.id, { is_active: !integration.is_active });
      await loadIntegrations();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditIntegration = (integration: SystemIntegration) => {
    onEditIntegration(integration);
    onClose();
  };

  const getStatusBadge = (integration: SystemIntegration) => {
    switch (integration.connection_status) {
      case 'connected':
        return <Badge variant="default">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Disconnected</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage System Integrations</DialogTitle>
          <DialogDescription>
            Edit, delete, or configure the status of your system integrations
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {loadingIntegrations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading system integrations...</span>
            </div>
          ) : integrations.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>No system integrations found</span>
            </div>
          ) : (
            integrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(integration)}
                      <Badge variant="outline">{integration.type}</Badge>
                      {!integration.is_active && <Badge variant="secondary">Inactive</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Endpoint:</p>
                      <p className="text-sm font-mono break-all">{integration.api_endpoint}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Sync Frequency:</p>
                        <p>{integration.sync_frequency_minutes} minutes</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Sync:</p>
                        <p>{integration.last_sync ? new Date(integration.last_sync).toLocaleString() : 'Never'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditIntegration(integration)}
                          disabled={loading}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(integration)}
                          disabled={loading}
                        >
                          {integration.is_active ? (
                            <ToggleRight className="h-4 w-4 mr-1" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 mr-1" />
                          )}
                          {integration.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={loading}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Test Connection
                        </Button>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteIntegration(integration.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SystemIntegrationListModal;
