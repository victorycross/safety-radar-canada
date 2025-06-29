
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface InternationalHub {
  id: string;
  name: string;
  country: string;
}

interface InternationalHubsSectionProps {
  internationalHubs: InternationalHub[];
  pendingHubsCount: number;
  isPendingInternationalHubVisible: (hubId: string) => boolean;
  onHubToggle: (hubId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const InternationalHubsSection = ({
  internationalHubs,
  pendingHubsCount,
  isPendingInternationalHubVisible,
  onHubToggle,
  onSelectAll,
  onDeselectAll
}: InternationalHubsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          International Financial Hubs
          <span className="text-sm text-muted-foreground ml-2">
            ({pendingHubsCount} of {internationalHubs.length} selected)
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
        {internationalHubs.map((hub) => {
          const isChecked = isPendingInternationalHubVisible(hub.id);
          return (
            <div key={hub.id} className="flex items-center space-x-3">
              <Checkbox
                id={`hub-${hub.id}`}
                checked={isChecked}
                onCheckedChange={() => {
                  console.log(`Hub ${hub.id} checked:`, !isChecked);
                  onHubToggle(hub.id);
                }}
              />
              <label
                htmlFor={`hub-${hub.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                onClick={() => onHubToggle(hub.id)}
              >
                {hub.name}, {hub.country}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InternationalHubsSection;
