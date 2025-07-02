
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Archive, CheckSquare, Trash2, Filter } from 'lucide-react';
import { useAlertArchiveManagement } from '@/hooks/useAlertArchiveManagement';

interface UnifiedBulkArchiveProps {
  onRefresh: () => void;
}

const UnifiedBulkArchive: React.FC<UnifiedBulkArchiveProps> = ({ onRefresh }) => {
  const { toast } = useToast();
  const { alerts, loading, archiveAlerts, refreshAlerts } = useAlertArchiveManagement();
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [archiveReason, setArchiveReason] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [archiving, setArchiving] = useState(false);

  const filteredAlerts = alerts.filter(alert => {
    if (sourceFilter === 'all') return true;
    return alert.source.toLowerCase() === sourceFilter.toLowerCase();
  });

  const alertsBySource = {
    security: alerts.filter(a => a.source === 'security').length,
    weather: alerts.filter(a => a.source === 'weather').length,
    immigration: alerts.filter(a => a.source === 'immigration').length,
    incident: alerts.filter(a => a.source === 'incident').length,
    hub: alerts.filter(a => a.source === 'hub').length,
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredAlerts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAlerts.map(a => a.id));
    }
  };

  const handleSelectAlert = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0 || !archiveReason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please select alerts and provide a reason',
        variant: 'destructive'
      });
      return;
    }

    setArchiving(true);
    try {
      console.log('Starting bulk archive operation...');
      await archiveAlerts(selectedIds, archiveReason.trim());
      
      toast({
        title: 'Bulk Archive Successful',
        description: `Successfully archived ${selectedIds.length} alerts`,
      });
      
      setSelectedIds([]);
      setArchiveReason('');
      
      // Refresh both local data and trigger parent refresh
      console.log('Refreshing local bulk interface...');
      await refreshAlerts();
      
      // Add a small delay to ensure database changes are committed and hub data is synchronized
      setTimeout(async () => {
        console.log('Triggering main dashboard refresh...');
        onRefresh();
        
        // Additional delay for hub incident synchronization
        setTimeout(() => {
          console.log('Final refresh to ensure hub synchronization...');
          onRefresh();
        }, 1000);
      }, 500);
      
    } catch (error) {
      console.error('Error archiving alerts:', error);
      toast({
        title: 'Archive Failed',
        description: 'Failed to archive alerts. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setArchiving(false);
    }
  };

  const handleClearAllOutstanding = async () => {
    if (alerts.length === 0) {
      toast({
        title: 'No Outstanding Alerts',
        description: 'There are no outstanding alerts to clear',
        variant: 'destructive'
      });
      return;
    }

    if (!archiveReason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a reason for clearing all outstanding alerts',
        variant: 'destructive'
      });
      return;
    }

    setArchiving(true);
    try {
      console.log('Starting clear all operation...');
      const allActiveIds = alerts.map(a => a.id);
      await archiveAlerts(allActiveIds, archiveReason.trim());
      
      toast({
        title: 'Clear All Successful',
        description: `Successfully cleared ${allActiveIds.length} outstanding alerts`,
      });
      
      setSelectedIds([]);
      setArchiveReason('');
      
      // Refresh both local data and trigger parent refresh
      console.log('Refreshing local bulk interface...');
      await refreshAlerts();
      
      // Add a small delay to ensure database changes are committed and hub data is synchronized
      setTimeout(async () => {
        console.log('Triggering main dashboard refresh...');
        onRefresh();
        
        // Additional delay for hub incident synchronization
        setTimeout(() => {
          console.log('Final refresh to ensure hub synchronization...');
          onRefresh();
        }, 1000);
      }, 500);
      
    } catch (error) {
      console.error('Error clearing all alerts:', error);
      toast({
        title: 'Clear All Failed',
        description: 'Failed to clear all alerts. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setArchiving(false);
    }
  };

  const isAllSelected = selectedIds.length === filteredAlerts.length && filteredAlerts.length > 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div>Loading alerts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Archive All Alert Sources</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline">Security: {alertsBySource.security}</Badge>
          <Badge variant="outline">Weather: {alertsBySource.weather}</Badge>
          <Badge variant="outline">Immigration: {alertsBySource.immigration}</Badge>
          <Badge variant="outline">Incidents: {alertsBySource.incident}</Badge>
          <Badge variant="outline">Hub: {alertsBySource.hub}</Badge>
          <Badge variant="secondary">Total: {alerts.length}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bulk Actions Controls */}
        <div className="flex flex-col gap-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </Button>
            
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources ({alerts.length})</SelectItem>
                <SelectItem value="security">Security ({alertsBySource.security})</SelectItem>
                <SelectItem value="weather">Weather ({alertsBySource.weather})</SelectItem>
                <SelectItem value="immigration">Immigration ({alertsBySource.immigration})</SelectItem>
                <SelectItem value="incident">Incidents ({alertsBySource.incident})</SelectItem>
                <SelectItem value="hub">Hub ({alertsBySource.hub})</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Label htmlFor="reason" className="text-sm">Reason for archiving</Label>
            <Input
              id="reason"
              placeholder="Enter reason for archiving selected alerts..."
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={selectedIds.length === 0 || !archiveReason.trim() || archiving}
                  className="flex items-center gap-2"
                >
                  <Archive className="h-4 w-4" />
                  Archive Selected ({selectedIds.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Bulk Archive</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to archive {selectedIds.length} alerts? 
                    This action can be undone later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkArchive} disabled={archiving}>
                    {archiving ? 'Archiving...' : 'Archive'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={alerts.length === 0 || !archiveReason.trim() || archiving}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Outstanding ({alerts.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Outstanding Alerts</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to clear ALL {alerts.length} outstanding alerts? 
                    This will archive all active alerts across all sources at once. This action can be undone later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAllOutstanding} disabled={archiving}>
                    {archiving ? 'Clearing...' : 'Clear All Outstanding'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {sourceFilter === 'all' ? 'No outstanding alerts found' : `No ${sourceFilter} alerts found`}
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                  selectedIds.includes(alert.id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleSelectAlert(alert.id)}
              >
                <Checkbox
                  checked={selectedIds.includes(alert.id)}
                  onChange={() => handleSelectAlert(alert.id)}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{alert.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {alert.description?.substring(0, 100)}...
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {alert.source}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {selectedIds.length} of {filteredAlerts.length} alerts selected
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedBulkArchive;
