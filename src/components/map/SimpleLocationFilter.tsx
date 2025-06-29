
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter, Eye, EyeOff } from 'lucide-react';

interface SimpleLocationFilterProps {
  provinces: Array<{ id: string; name: string; code: string }>;
  internationalHubs: Array<{ id: string; name: string; country: string }>;
  isProvinceVisible: (id: string) => boolean;
  isHubVisible: (id: string) => boolean;
  onToggleProvince: (id: string) => void;
  onToggleHub: (id: string) => void;
  onShowAllProvinces: () => void;
  onHideAllProvinces: () => void;
  onShowAllHubs: () => void;
  onHideAllHubs: () => void;
  onResetFilters: () => void;
  visibleProvinceCount: number;
  visibleHubCount: number;
  hasFilters: boolean;
}

const SimpleLocationFilter = ({
  provinces,
  internationalHubs,
  isProvinceVisible,
  isHubVisible,
  onToggleProvince,
  onToggleHub,
  onShowAllProvinces,
  onHideAllProvinces,
  onShowAllHubs,
  onHideAllHubs,
  onResetFilters,
  visibleProvinceCount,
  visibleHubCount,
  hasFilters
}: SimpleLocationFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter Locations
          {hasFilters && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
              {visibleProvinceCount + visibleHubCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Filter Locations</span>
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={onResetFilters}>
                Reset All
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Provinces */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                Provinces ({visibleProvinceCount}/{provinces.length})
              </h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={onShowAllProvinces}>
                  <Eye className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onHideAllProvinces}>
                  <EyeOff className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {provinces.map((province) => (
                <div key={province.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`province-${province.id}`}
                    checked={isProvinceVisible(province.id)}
                    onCheckedChange={() => onToggleProvince(province.id)}
                  />
                  <label
                    htmlFor={`province-${province.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {province.name} ({province.code})
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* International Hubs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">
                Int'l Hubs ({visibleHubCount}/{internationalHubs.length})
              </h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={onShowAllHubs}>
                  <Eye className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onHideAllHubs}>
                  <EyeOff className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {internationalHubs.map((hub) => (
                <div key={hub.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`hub-${hub.id}`}
                    checked={isHubVisible(hub.id)}
                    onCheckedChange={() => onToggleHub(hub.id)}
                  />
                  <label
                    htmlFor={`hub-${hub.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {hub.name}, {hub.country}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={() => setIsOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SimpleLocationFilter;
