
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, RotateCcw, Check, X } from 'lucide-react';
import { useLocationVisibility } from '@/hooks/useLocationVisibility';
import { useToast } from '@/hooks/use-toast';

interface LocationVisibilitySettingsProps {
  provinces: Array<{ id: string; name: string; code: string }>;
  internationalHubs: Array<{ id: string; name: string; country: string }>;
}

const LocationVisibilitySettings = ({ provinces, internationalHubs }: LocationVisibilitySettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const {
    hasUnsavedChanges,
    togglePendingProvince,
    togglePendingInternationalHub,
    selectAllPendingProvinces,
    deselectAllPendingProvinces,
    selectAllPendingInternationalHubs,
    deselectAllPendingInternationalHubs,
    applyChanges,
    cancelChanges,
    resetToDefault,
    getPendingVisibleProvincesCount,
    getPendingVisibleInternationalHubsCount,
    isPendingProvinceVisible,
    isPendingInternationalHubVisible
  } = useLocationVisibility();

  const handleApply = () => {
    const success = applyChanges();
    if (success) {
      toast({
        title: "Settings Applied",
        description: "Location visibility preferences have been saved successfully.",
      });
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      cancelChanges();
    }
    setIsOpen(false);
  };

  const handleReset = () => {
    resetToDefault();
  };

  const pendingProvincesCount = getPendingVisibleProvincesCount();
  const pendingHubsCount = getPendingVisibleInternationalHubsCount();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 relative">
          <Settings className="h-4 w-4" />
          Customize View
          {hasUnsavedChanges && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full" />
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span>Customize Location Visibility</span>
              {hasUnsavedChanges && (
                <span className="text-sm text-orange-600 font-normal ml-2">• Unsaved Changes</span>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
          </DialogTitle>
          <DialogDescription>
            Choose which locations to display on your security dashboard. Changes will only be applied when you click the Apply button.
            Currently selected: {pendingProvincesCount} provinces, {pendingHubsCount} international hubs.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Canadian Provinces & Territories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Canadian Provinces & Territories
                <span className="text-sm text-muted-foreground ml-2">
                  ({pendingProvincesCount} of {provinces.length} selected)
                </span>
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllPendingProvinces}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllPendingProvinces}>
                  Deselect All
                </Button>
              </div>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-3">
              {provinces.map((province) => (
                <div key={province.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`province-${province.id}`}
                    checked={isPendingProvinceVisible(province.id)}
                    onCheckedChange={() => togglePendingProvince(province.id)}
                  />
                  <label
                    htmlFor={`province-${province.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {province.name} ({province.code})
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* International Financial Hubs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                International Financial Hubs
                <span className="text-sm text-muted-foreground ml-2">
                  ({pendingHubsCount} of {internationalHubs.length} selected)
                </span>
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllPendingInternationalHubs}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllPendingInternationalHubs}>
                  Deselect All
                </Button>
              </div>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-3">
              {internationalHubs.map((hub) => (
                <div key={hub.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`hub-${hub.id}`}
                    checked={isPendingInternationalHubVisible(hub.id)}
                    onCheckedChange={() => togglePendingInternationalHub(hub.id)}
                  />
                  <label
                    htmlFor={`hub-${hub.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {hub.name}, {hub.country}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {hasUnsavedChanges ? (
              <span className="text-orange-600">You have unsaved changes</span>
            ) : (
              <span>No unsaved changes</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={handleApply} 
              disabled={!hasUnsavedChanges}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              Apply Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationVisibilitySettings;
