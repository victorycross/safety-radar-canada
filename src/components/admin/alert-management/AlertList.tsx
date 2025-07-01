
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Archive, Unarchive, Calendar, User } from 'lucide-react';
import { Alert } from '@/hooks/useAlertArchiveManagement';

interface AlertListProps {
  alerts: Alert[];
  selectedAlerts: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onArchive?: (alertIds: string[]) => void;
  onUnarchive?: (alertIds: string[]) => void;
  loading: boolean;
  showArchived: boolean;
}

const AlertList: React.FC<AlertListProps> = ({
  alerts,
  selectedAlerts,
  onSelectionChange,
  onArchive,
  onUnarchive,
  loading,
  showArchived
}) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(alerts.map(alert => alert.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectAlert = (alertId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedAlerts, alertId]);
    } else {
      onSelectionChange(selectedAlerts.filter(id => id !== alertId));
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'security': return 'bg-red-100 text-red-800';
      case 'weather': return 'bg-blue-100 text-blue-800';
      case 'incident': return 'bg-orange-100 text-orange-800';
      case 'hub': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2 text-muted-foreground">Loading alerts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showArchived ? 'No Archived Alerts' : 'No Active Alerts'}
            </h3>
            <p className="text-gray-600">
              {showArchived 
                ? 'No alerts have been archived yet.' 
                : 'All alerts are up to date. No active alerts found.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Select All Header */}
      <Card>
        <CardHeader className="py-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={selectedAlerts.length === alerts.length && alerts.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">
              Select All ({alerts.length} alerts)
            </span>
            {selectedAlerts.length > 0 && (
              <Badge variant="secondary">
                {selectedAlerts.length} selected
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Alert List */}
      {alerts.map((alert) => (
        <Card key={alert.id} className="relative">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={selectedAlerts.includes(alert.id)}
                onCheckedChange={(checked) => handleSelectAlert(alert.id, checked as boolean)}
                className="mt-1"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {alert.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSourceBadgeColor(alert.source)}>
                      {alert.source}
                    </Badge>
                    {!showArchived && onArchive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onArchive([alert.id])}
                      >
                        <Archive className="h-3 w-3" />
                      </Button>
                    )}
                    {showArchived && onUnarchive && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUnarchive([alert.id])}
                      >
                        <Unarchive className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {alert.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {alert.description}
                  </p>
                )}
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {new Date(alert.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  {showArchived && alert.archived_at && (
                    <>
                      <div className="flex items-center space-x-1">
                        <Archive className="h-3 w-3" />
                        <span>Archived: {new Date(alert.archived_at).toLocaleDateString()}</span>
                      </div>
                      {alert.archive_reason && (
                        <span className="text-gray-600">
                          Reason: {alert.archive_reason}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AlertList;
