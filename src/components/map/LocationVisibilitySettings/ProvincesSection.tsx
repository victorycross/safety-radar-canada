
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface Province {
  id: string;
  name: string;
  code: string;
}

interface ProvincesSectionProps {
  provinces: Province[];
  pendingProvincesCount: number;
  isPendingProvinceVisible: (provinceId: string) => boolean;
  onProvinceToggle: (provinceId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const ProvincesSection = ({
  provinces,
  pendingProvincesCount,
  isPendingProvinceVisible,
  onProvinceToggle,
  onSelectAll,
  onDeselectAll
}: ProvincesSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Canadian Provinces & Territories
          <span className="text-sm text-muted-foreground ml-2">
            ({pendingProvincesCount} of {provinces.length} selected)
          </span>
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSelectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={onDeselectAll}>
            Deselect All
          </Button>
        </div>
      </div>
      
      <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-3">
        {provinces.map((province) => {
          const isChecked = isPendingProvinceVisible(province.id);
          return (
            <div key={province.id} className="flex items-center space-x-3">
              <Checkbox
                id={`province-${province.id}`}
                checked={isChecked}
                onCheckedChange={() => {
                  console.log(`Province ${province.id} checked:`, !isChecked);
                  onProvinceToggle(province.id);
                }}
              />
              <label
                htmlFor={`province-${province.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                onClick={() => onProvinceToggle(province.id)}
              >
                {province.name} ({province.code})
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProvincesSection;
