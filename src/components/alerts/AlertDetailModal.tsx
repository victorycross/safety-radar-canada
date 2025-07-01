
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Archive, ExternalLink, MapPin, Clock, AlertTriangle, Calendar, User } from 'lucide-react';
import { UniversalAlert } from '@/types/alerts';
import { useAuth } from '@/components/auth/AuthProvider';

interface AlertDetailModalProps {
  alert: UniversalAlert | null;
  isOpen: boolean;
  onClose: () => void;
  onArchive?: (alertId: string, reason: string) => void;
}

const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  isOpen,
  onClose,
  onArchive
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (!alert) return null;

  const getSeverityColor = (severity: UniversalAlert['severity']) => {
    switch (severity) {
      case 'Extreme': return 'bg-red-600 text-white';
      case 'Severe': return 'bg-red-500 text-white';
      case 'Moderate': return 'bg-orange-500 text-white';
      case 'Minor': return 'bg-yellow-500 text-black';
      case 'Info': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getUrgencyColor = (urgency: UniversalAlert['urgency']) => {
    switch (urgency) {
      case 'Immediate': return 'bg-red-600 text-white';
      case 'Expected': return 'bg-orange-500 text-white';
      case 'Future': return 'bg-blue-500 text-white';
      case 'Past': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const handleArchive = () => {
    if (onArchive) {
      const reason = prompt('Enter reason for archiving this alert:');
      if (reason) {
        onArchive(alert.id, reason);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl leading-tight pr-4">{alert.title}</DialogTitle>
              <DialogDescription className="mt-2">
                Alert Details and Management
              </DialogDescription>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
              <Badge className={getUrgencyColor(alert.urgency)}>{alert.urgency}</Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Alert Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm leading-relaxed">{alert.description}</p>
          </div>

          {/* Instructions */}
          {alert.instructions && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <span className="font-medium">Recommended Action:</span> {alert.instructions}
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Timeline Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-3">Timeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">Published:</span>
                  <span>{formatDate(alert.published)}</span>
                </div>
                {alert.updated && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">Updated:</span>
                    <span>{formatDate(alert.updated)}</span>
                  </div>
                )}
                {alert.effective && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">Effective:</span>
                    <span>{formatDate(alert.effective)}</span>
                  </div>
                )}
                {alert.expires && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">Expires:</span>
                    <span>{formatDate(alert.expires)}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Category:</span>
                  <span>{alert.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <span>{alert.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Source:</span>
                  <span>{alert.source}</span>
                </div>
                {alert.author && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">Author:</span>
                    <span>{alert.author}</span>
                  </div>
                )}
                {alert.area && alert.area !== 'Area not specified' && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">Area:</span>
                    <span>{alert.area}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex justify-between items-center">
            <div>
              {alert.url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={alert.url} target="_blank" rel="noopener noreferrer">
                    View Original <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
            
            {isAdmin && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleArchive}>
                  <Archive className="h-3 w-3 mr-1" />
                  Archive Alert
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertDetailModal;
