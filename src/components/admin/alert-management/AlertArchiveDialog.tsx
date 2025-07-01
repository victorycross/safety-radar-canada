
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Archive, ArchiveRestore, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AlertArchiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  action: 'archive' | 'unarchive';
  onConfirm: (reason: string) => Promise<void>;
}

const AlertArchiveDialog: React.FC<AlertArchiveDialogProps> = ({
  open,
  onOpenChange,
  selectedCount,
  action,
  onConfirm
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for this action.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log(`${action} dialog: Starting operation with reason:`, reason.trim());
      await onConfirm(reason.trim());
      setReason('');
      onOpenChange(false);
    } catch (error) {
      console.error(`${action} dialog: Operation failed:`, error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {action === 'archive' ? (
              <Archive className="h-5 w-5" />
            ) : (
              <ArchiveRestore className="h-5 w-5" />
            )}
            <span>
              {action === 'archive' ? 'Archive' : 'Restore'} Alerts
            </span>
          </DialogTitle>
          <DialogDescription>
            {action === 'archive' 
              ? `You are about to archive ${selectedCount} alert${selectedCount > 1 ? 's' : ''}. Archived alerts will be hidden from normal operations but can be restored later if needed.`
              : `You are about to restore ${selectedCount} alert${selectedCount > 1 ? 's' : ''}. Restored alerts will become active again and visible in normal operations.`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="reason">
              Reason for {action === 'archive' ? 'archiving' : 'restoring'} *
            </Label>
            <Textarea
              id="reason"
              placeholder={`Enter the reason for ${action === 'archive' ? 'archiving' : 'restoring'} these alerts...`}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              className="mt-1"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!reason.trim() || isSubmitting}
            variant={action === 'archive' ? 'default' : 'default'}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                {action === 'archive' ? 'Archiving...' : 'Restoring...'}
              </>
            ) : (
              <>
                {action === 'archive' ? (
                  <Archive className="h-4 w-4 mr-2" />
                ) : (
                  <ArchiveRestore className="h-4 w-4 mr-2" />
                )}
                {action === 'archive' ? 'Archive' : 'Restore'} {selectedCount} Alert{selectedCount > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AlertArchiveDialog;
