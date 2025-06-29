
import React from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface SettingsDialogHeaderProps {
  hasUnsavedChanges: boolean;
  pendingProvincesCount: number;
  pendingHubsCount: number;
  onReset: () => void;
}

const SettingsDialogHeader = ({ 
  hasUnsavedChanges, 
  pendingProvincesCount, 
  pendingHubsCount, 
  onReset 
}: SettingsDialogHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center justify-between">
        <div>
          <span>Customize Location Visibility</span>
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600 font-normal ml-2">• Unsaved Changes</span>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset to Default
        </Button>
      </DialogTitle>
      <DialogDescription>
        Choose which locations to display on your security dashboard. Changes will be applied immediately when you click Apply.
        Currently selected: {pendingProvincesCount} provinces, {pendingHubsCount} international hubs.
      </DialogDescription>
    </DialogHeader>
  );
};

export default SettingsDialogHeader;
