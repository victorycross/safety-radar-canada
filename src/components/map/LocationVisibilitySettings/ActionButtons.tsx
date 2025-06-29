
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface ActionButtonsProps {
  hasUnsavedChanges: boolean;
  onApply: () => void;
  onCancel: () => void;
}

const ActionButtons = ({ hasUnsavedChanges, onApply, onCancel }: ActionButtonsProps) => {
  return (
    <div className="flex items-center justify-between pt-4 border-t">
      <div className="text-sm text-muted-foreground">
        {hasUnsavedChanges ? (
          <span className="text-orange-600">You have unsaved changes that will be applied immediately</span>
        ) : (
          <span>No unsaved changes</span>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="gap-2">
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button 
          onClick={onApply} 
          disabled={!hasUnsavedChanges}
          className="gap-2"
        >
          <Check className="h-4 w-4" />
          Apply Changes
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;
