
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { InternationalHub } from '@/types/dashboard';
import { AlertLevel } from '@/types';
import { CheckSquare, Square, Download, Upload, AlertTriangle, Users, Power } from 'lucide-react';

interface BulkHubOperationsProps {
  hubs: InternationalHub[];
  onBulkUpdate: (hubIds: string[], updates: Partial<InternationalHub>) => Promise<void>;
  onRefresh: () => void;
}

const BulkHubOperations: React.FC<BulkHubOperationsProps> = ({
  hubs,
  onBulkUpdate,
  onRefresh
}) => {
  const [selectedHubs, setSelectedHubs] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkAlertLevel, setBulkAlertLevel] = useState<AlertLevel>(AlertLevel.NORMAL);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSelectAll = () => {
    if (selectedHubs.size === hubs.length) {
      setSelectedHubs(new Set());
    } else {
      setSelectedHubs(new Set(hubs.map(h => h.id)));
    }
  };

  const handleSelectHub = (hubId: string) => {
    const newSelected = new Set(selectedHubs);
    if (newSelected.has(hubId)) {
      newSelected.delete(hubId);
    } else {
      newSelected.add(hubId);
    }
    setSelectedHubs(newSelected);
  };

  const handleBulkAction = async () => {
    if (selectedHubs.size === 0 || !bulkAction) return;

    setLoading(true);
    try {
      const hubIds = Array.from(selectedHubs);
      
      switch (bulkAction) {
        case 'activate':
          await onBulkUpdate(hubIds, { isActive: true });
          toast({
            title: 'Hubs Activated',
            description: `Successfully activated ${hubIds.length} hubs`,
          });
          break;
        case 'deactivate':
          await onBulkUpdate(hubIds, { isActive: false });
          toast({
            title: 'Hubs Deactivated',
            description: `Successfully deactivated ${hubIds.length} hubs`,
          });
          break;
        case 'update_alert':
          await onBulkUpdate(hubIds, { alertLevel: bulkAlertLevel });
          toast({
            title: 'Alert Levels Updated',
            description: `Updated alert level for ${hubIds.length} hubs`,
          });
          break;
        case 'export':
          handleExportData();
          break;
      }
      
      setSelectedHubs(new Set());
      setBulkAction('');
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to perform bulk operation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    const selectedHubData = hubs.filter(h => selectedHubs.has(h.id));
    const csvContent = [
      'Name,Country,Code,Alert Level,Employee Count,Active Status',
      ...selectedHubData.map(h => 
        `"${h.name}","${h.country}","${h.code}","${h.alertLevel}",${h.employeeCount},${h.isActive}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hub_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Export Complete',
      description: `Exported data for ${selectedHubs.size} hubs`,
    });
  };

  const allSelected = selectedHubs.size === hubs.length && hubs.length > 0;
  const someSelected = selectedHubs.size > 0 && selectedHubs.size < hubs.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bulk Hub Operations</span>
          <Badge variant="outline">{selectedHubs.size} selected</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Controls */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="flex items-center space-x-2"
            >
              {allSelected ? <CheckSquare className="h-4 w-4" /> : 
               someSelected ? <Square className="h-4 w-4 bg-blue-500" /> : 
               <Square className="h-4 w-4" />}
              <span>Select All ({hubs.length})</span>
            </Button>
          </div>
          
          {selectedHubs.size > 0 && (
            <div className="flex items-center space-x-2">
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Choose action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">
                    <div className="flex items-center space-x-2">
                      <Power className="h-4 w-4" />
                      <span>Activate</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="deactivate">
                    <div className="flex items-center space-x-2">
                      <Power className="h-4 w-4" />
                      <span>Deactivate</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="update_alert">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Update Alert</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="export">
                    <div className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Export Data</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {bulkAction === 'update_alert' && (
                <Select value={bulkAlertLevel} onValueChange={(value) => setBulkAlertLevel(value as AlertLevel)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AlertLevel.NORMAL}>Normal</SelectItem>
                    <SelectItem value={AlertLevel.WARNING}>Warning</SelectItem>
                    <SelectItem value={AlertLevel.SEVERE}>Severe</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <Button 
                onClick={handleBulkAction}
                disabled={!bulkAction || loading}
                size="sm"
              >
                {loading ? 'Processing...' : 'Apply'}
              </Button>
            </div>
          )}
        </div>

        {/* Hub Selection List */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {hubs.map((hub) => (
            <div
              key={hub.id}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                selectedHubs.has(hub.id) ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => handleSelectHub(hub.id)}
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={selectedHubs.has(hub.id)}
                  onChange={() => handleSelectHub(hub.id)}
                />
                <span className="text-xl">{hub.flagEmoji}</span>
                <div>
                  <span className="font-medium">{hub.name}</span>
                  <p className="text-sm text-gray-600">{hub.country} • {hub.code}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge variant={hub.isActive ? 'default' : 'secondary'}>
                  {hub.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge 
                  variant="outline"
                  className={hub.alertLevel === AlertLevel.SEVERE ? 'border-red-500 text-red-600' :
                           hub.alertLevel === AlertLevel.WARNING ? 'border-yellow-500 text-yellow-600' :
                           'border-green-500 text-green-600'}
                >
                  {hub.alertLevel}
                </Badge>
                <div className="text-sm text-gray-600">
                  {hub.employeeCount} employees
                </div>
              </div>
            </div>
          ))}
        </div>

        {hubs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hubs available for bulk operations
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BulkHubOperations;
