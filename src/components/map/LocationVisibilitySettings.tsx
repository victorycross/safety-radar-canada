
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, RotateCcw } from 'lucide-react';
import { useLocationVisibility } from '@/hooks/useLocationVisibility';

interface LocationVisibilitySettingsProps {
  provinces: Array<{ id: string; name: string; code: string }>;
  internationalHubs: Array<{ id: string; name: string; country: string }>;
}

const LocationVisibilitySettings = ({ provinces, internationalHubs }: LocationVisibilitySettingsProps) => {
  const {
    toggleProvince,
    toggleInternationalHub,
    selectAllProvinces,
    deselectAllProvinces,
    selectAllInternationalHubs,
    deselectAllInternationalHubs,
    resetToDefault,
    isProvinceVisible,
    isInternationalHubVisible
  } = useLocationVisibility();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Customize View
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Customize Location Visibility</span>
            <Button variant="outline" size="sm" onClick={resetToDefault} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Canadian Provinces & Territories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Canadian Provinces & Territories</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllProvinces}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllProvinces}>
                  Deselect All
                </Button>
              </div>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {provinces.map((province) => (
                <div key={province.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`province-${province.id}`}
                    checked={isProvinceVisible(province.id)}
                    onCheckedChange={() => toggleProvince(province.id)}
                  />
                  <label
                    htmlFor={`province-${province.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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
              <h3 className="text-lg font-semibold">International Financial Hubs</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={selectAllInternationalHubs}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={deselectAllInternationalHubs}>
                  Deselect All
                </Button>
              </div>
            </div>
            
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {internationalHubs.map((hub) => (
                <div key={hub.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={`hub-${hub.id}`}
                    checked={isInternationalHubVisible(hub.id)}
                    onCheckedChange={() => toggleInternationalHub(hub.id)}
                  />
                  <label
                    htmlFor={`hub-${hub.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {hub.name}, {hub.country}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationVisibilitySettings;
