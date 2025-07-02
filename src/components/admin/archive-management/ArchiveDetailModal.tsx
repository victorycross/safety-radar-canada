
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, User, FileText, Database, Info } from 'lucide-react';

interface ArchiveLogEntry {
  id: string;
  alert_table: string;
  alert_id: string;
  action: string;
  performed_by: string;
  reason: string | null;
  created_at: string;
  metadata: any;
  user_email?: string;
}

interface ArchiveDetailModalProps {
  entry: ArchiveLogEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

const ArchiveDetailModal: React.FC<ArchiveDetailModalProps> = ({
  entry,
  isOpen,
  onClose
}) => {
  if (!entry) return null;

  const getSourceDisplayName = (tableName: string) => {
    const mapping: Record<string, string> = {
      'security_alerts_ingest': 'Security Alerts',
      'weather_alerts_ingest': 'Weather Alerts',
      'incidents': 'Provincial Incidents',
      'hub_incidents': 'Hub Incidents',
      'immigration_travel_announcements': 'Immigration Announcements'
    };
    return mapping[tableName] || tableName;
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'archive':
        return <Badge variant="destructive">Archived</Badge>;
      case 'unarchive':
        return <Badge variant="default">Restored</Badge>;
      case 'delete':
        return <Badge variant="destructive">Deleted</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Archive Action Details
          </DialogTitle>
          <DialogDescription>
            Complete details and metadata for this archive operation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {getActionBadge(entry.action)}
                Action Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Performed By</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.user_email || 'Unknown User'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Date & Time</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(entry.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                Alert Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <div className="text-sm font-medium">Source Table</div>
                  <Badge variant="outline" className="mt-1">
                    {getSourceDisplayName(entry.alert_table)}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium">Alert ID</div>
                  <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                    {entry.alert_id}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reason */}
          {entry.reason && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">{entry.reason}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          {entry.metadata && Object.keys(entry.metadata).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Additional Metadata
                </CardTitle>
                <CardDescription>
                  Technical details and system information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-3 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(entry.metadata, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Log Entry ID:</span>
                  <span className="font-mono">{entry.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User ID:</span>
                  <span className="font-mono">{entry.performed_by}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Database Table:</span>
                  <span className="font-mono">{entry.alert_table}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveDetailModal;
