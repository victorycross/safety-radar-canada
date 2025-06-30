
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckSquare, Square, Power, AlertTriangle, Download } from 'lucide-react';
import { AlertLevel } from '@/types';

interface HubSelectionHeaderProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  someSelected: boolean;
  bulkAction: string;
  bulkAlertLevel: AlertLevel;
  loading: boolean;
  onSelectAll: () => void;
  onBulkActionChange: (action: string) => void;
  onAlertLevelChange: (level: AlertLevel) => void;
  onApplyAction: () => void;
}

const HubSelectionHeader: React.FC<HubSelectionHeaderProps> = ({
  selectedCount,
  totalCount,
  allSelected,
  someSelected,
  bulkAction,
  bulkAlertLevel,
  loading,
  onSelectAll,
  onBulkActionChange,
  onAlertLevelChange,
  onApplyAction
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSelectAll}
          className="flex items-center space-x-2"
        >
          {allSelected ? <CheckSquare className="h-4 w-4" /> : 
           someSelected ? <Square className="h-4 w-4 bg-blue-500" /> : 
           <Square className="h-4 w-4" />}
          <span>Select All ({totalCount})</span>
        </Button>
        <Badge variant="outline">{selectedCount} selected</Badge>
      </div>
      
      {selectedCount > 0 && (
        <div className="flex items-center space-x-2">
          <Select value={bulkAction} onValueChange={onBulkActionChange}>
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
            <Select value={bulkAlertLevel} onValueChange={(value) => onAlertLevelChange(value as AlertLevel)}>
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
            onClick={onApplyAction}
            disabled={!bulkAction || loading}
            size="sm"
          >
            {loading ? 'Processing...' : 'Apply'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default HubSelectionHeader;
