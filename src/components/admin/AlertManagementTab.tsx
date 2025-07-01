
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Archive, ArchiveRestore, Trash2, Search, Filter, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { useAlertArchiveManagement } from '@/hooks/useAlertArchiveManagement';
import AlertArchiveDialog from './alert-management/AlertArchiveDialog';
import AlertList from './alert-management/AlertList';

const AlertManagementTab = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlertType, setSelectedAlertType] = useState('all');
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [archiveAction, setArchiveAction] = useState<'archive' | 'unarchive'>('archive');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    alerts,
    archivedAlerts,
    loading,
    archiveAlerts,
    unarchiveAlerts,
    deleteAlerts,
    refreshAlerts
  } = useAlertArchiveManagement();

  // Check if user has proper permissions
  const hasPermissions = user?.role === 'admin' || user?.role === 'power_user';

  const handleBulkAction = async (action: 'archive' | 'unarchive' | 'delete', reason?: string) => {
    if (selectedAlerts.length === 0) {
      toast({
        title: 'No alerts selected',
        description: 'Please select alerts to perform this action.',
        variant: 'default',
      });
      return;
    }

    if (!hasPermissions) {
      toast({
        title: 'Insufficient Permissions',
        description: 'You need admin or power user privileges to perform this action.',
        variant: 'destructive',
      });
      return;
    }

    if (!reason) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for this action.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    console.log(`Starting ${action} operation for ${selectedAlerts.length} alerts`);

    try {
      switch (action) {
        case 'archive':
          await archiveAlerts(selectedAlerts, reason);
          toast({
            title: 'Alerts Archived',
            description: `Successfully archived ${selectedAlerts.length} alerts.`,
          });
          break;
        case 'unarchive':
          await unarchiveAlerts(selectedAlerts, reason);
          toast({
            title: 'Alerts Restored',
            description: `Successfully restored ${selectedAlerts.length} alerts.`,
          });
          break;
        case 'delete':
          await deleteAlerts(selectedAlerts, reason);
          toast({
            title: 'Alerts Deleted',
            description: `Successfully deleted ${selectedAlerts.length} alerts.`,
          });
          break;
      }
      
      setSelectedAlerts([]);
      refreshAlerts();
    } catch (error) {
      console.error(`${action} operation failed:`, error);
      toast({
        title: 'Operation Failed',
        description: `Failed to ${action} alerts. Please check the console for details and try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredAlerts = (alertList: any[]) => {
    return alertList.filter(alert => {
      const matchesSearch = alert.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           alert.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedAlertType === 'all' || alert.source === selectedAlertType;
      return matchesSearch && matchesType;
    });
  };

  if (!hasPermissions) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You need admin or power user privileges to access alert management features.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert Management</h2>
          <p className="text-muted-foreground">Manage, archive, and organize system alerts</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={() => setShowArchiveDialog(true)}
            disabled={selectedAlerts.length === 0 || isProcessing}
            variant="outline"
            size="sm"
          >
            <Archive className="mr-2 h-4 w-4" />
            Archive Selected ({selectedAlerts.length})
          </Button>
          <Button 
            onClick={refreshAlerts} 
            variant="outline" 
            size="sm"
            disabled={loading || isProcessing}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* User Role Information */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Logged in as: <strong>{user?.email}</strong> with role: <strong>{user?.role}</strong>
        </AlertDescription>
      </Alert>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedAlertType} onValueChange={setSelectedAlertType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="security">Security Alerts</SelectItem>
                <SelectItem value="weather">Weather Alerts</SelectItem>
                <SelectItem value="incident">Incidents</SelectItem>
                <SelectItem value="hub">Hub Incidents</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alert Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            Active Alerts
            <Badge variant="secondary" className="ml-2">
              {filteredAlerts(alerts).length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="archived">
            Archived Alerts
            <Badge variant="secondary" className="ml-2">
              {filteredAlerts(archivedAlerts).length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <AlertList
            alerts={filteredAlerts(alerts)}
            selectedAlerts={selectedAlerts}
            onSelectionChange={setSelectedAlerts}
            onArchive={(alertIds) => {
              setSelectedAlerts(alertIds);
              setArchiveAction('archive');
              setShowArchiveDialog(true);
            }}
            loading={loading}
            showArchived={false}
          />
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">
              Archived alerts are hidden from normal operations but can be restored if needed.
            </p>
            <div className="flex space-x-2">
              <Button
                onClick={() => handleBulkAction('unarchive', 'Bulk restore operation')}
                disabled={selectedAlerts.length === 0 || isProcessing}
                variant="outline"
                size="sm"
              >
                <ArchiveRestore className="mr-2 h-4 w-4" />
                {isProcessing ? 'Processing...' : 'Restore Selected'}
              </Button>
              <Button
                onClick={() => handleBulkAction('delete', 'Bulk delete operation')}
                disabled={selectedAlerts.length === 0 || isProcessing}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {isProcessing ? 'Processing...' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
          <AlertList
            alerts={filteredAlerts(archivedAlerts)}
            selectedAlerts={selectedAlerts}
            onSelectionChange={setSelectedAlerts}
            onUnarchive={(alertIds) => handleBulkAction('unarchive', 'Individual restore operation')}
            loading={loading}
            showArchived={true}
          />
        </TabsContent>
      </Tabs>

      <AlertArchiveDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        selectedCount={selectedAlerts.length}
        action={archiveAction}
        onConfirm={(reason) => handleBulkAction(archiveAction, reason)}
      />
    </div>
  );
};

export default AlertManagementTab;
