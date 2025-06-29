
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useLocationVisibility } from '@/hooks/useLocationVisibility';
import { useToast } from '@/hooks/use-toast';
import SettingsDialogHeader from './SettingsDialogHeader';
import ProvincesSection from './ProvincesSection';
import InternationalHubsSection from './InternationalHubsSection';
import ActionButtons from './ActionButtons';

interface LocationVisibilitySettingsProps {
  provinces: Array<{ id: string; name: string; code: string }>;
  internationalHubs: Array<{ id: string; name: string; country: string }>;
}

const LocationVisibilitySettings = ({ provinces, internationalHubs }: LocationVisibilitySettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  // Extract actual IDs for the hook
  const actualProvinceIds = provinces.map(p => p.id);
  const actualHubIds = internationalHubs.map(h => h.id);
  
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
  } = useLocationVisibility(actualProvinceIds, actualHubIds);

  const handleApply = () => {
    const success = applyChanges();
    if (success) {
      toast({
        title: "View Updated Successfully",
        description: "Your location visibility preferences have been applied immediately to all sections.",
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

  const handleProvinceToggle = (provinceId: string) => {
    console.log('Toggling province:', provinceId);
    togglePendingProvince(provinceId);
  };

  const handleInternationalHubToggle = (hubId: string) => {
    console.log('Toggling hub:', hubId);
    togglePendingInternationalHub(hubId);
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
        <SettingsDialogHeader
          hasUnsavedChanges={hasUnsavedChanges}
          pendingProvincesCount={pendingProvincesCount}
          pendingHubsCount={pendingHubsCount}
          onReset={handleReset}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProvincesSection
            provinces={provinces}
            pendingProvincesCount={pendingProvincesCount}
            isPendingProvinceVisible={isPendingProvinceVisible}
            onProvinceToggle={handleProvinceToggle}
            onSelectAll={selectAllPendingProvinces}
            onDeselectAll={deselectAllPendingProvinces}
          />

          <InternationalHubsSection
            internationalHubs={internationalHubs}
            pendingHubsCount={pendingHubsCount}
            isPendingInternationalHubVisible={isPendingInternationalHubVisible}
            onHubToggle={handleInternationalHubToggle}
            onSelectAll={selectAllPendingInternationalHubs}
            onDeselectAll={deselectAllPendingInternationalHubs}
          />
        </div>

        <ActionButtons
          hasUnsavedChanges={hasUnsavedChanges}
          onApply={handleApply}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default LocationVisibilitySettings;
