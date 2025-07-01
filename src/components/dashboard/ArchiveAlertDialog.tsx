
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle, Archive } from 'lucide-react';
import { Incident } from '@/types';
import { useArchiveAlerts } from '@/hooks/useArchiveAlerts';

interface ArchiveAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incidents: Incident[];
  locationName: string;
  onArchiveComplete: () => void;
}

const ArchiveAlertDialog: React.FC<ArchiveAlertDialogProps> = ({
  open,
  onOpenChange,
  incidents,
  locationName,
  onArchiveComplete
}) => {
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const { archiveIncidents, isArchiving } = useArchiveAlerts();

  const handleArchive = async () => {
    if (!selectedReason) {
      return;
    }

    const finalReason = selectedReason === 'other' ? reason : selectedReason;
    const incidentIds = incidents.map(i => i.id);
    
    const success = await archiveIncidents(incidentIds, finalReason);
    
    if (success) {
      onArchiveComplete();
      onOpenChange(false);
      
      // Reset form
      setReason('');
      setSelectedReason('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Archive Alerts for {locationName}
          </DialogTitle>
          <DialogDescription>
            This will archive {incidents.length} active alert{incidents.length !== 1 ? 's' : ''} for this location.
            This action can be undone from the admin panel.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="archive-reason">Reason for archiving</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resolved">Issue resolved</SelectItem>
                <SelectItem value="false-positive">False positive</SelectItem>
                <SelectItem value="duplicate">Duplicate alert</SelectItem>
                <SelectItem value="expired">Alert expired</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {selectedReason === 'other' && (
            <div>
              <Label htmlFor="custom-reason">Custom reason</Label>
              <Textarea
                id="custom-reason"
                placeholder="Please provide a detailed reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
          
          <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Before archiving:</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Verify all incidents have been properly addressed</li>
                  <li>• Ensure no active security threats remain</li>
                  <li>• Document any follow-up actions required</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isArchiving}>
            Cancel
          </Button>
          <Button onClick={handleArchive} disabled={isArchiving || !selectedReason}>
            {isArchiving ? 'Archiving...' : 'Archive Alerts'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ArchiveAlertDialog;
