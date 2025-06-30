
import React from 'react';
import { InternationalHub } from '@/types/dashboard';
import HubListItem from './HubListItem';

interface HubListProps {
  hubs: InternationalHub[];
  selectedHubs: Set<string>;
  onToggleHub: (hubId: string) => void;
}

const HubList: React.FC<HubListProps> = ({
  hubs,
  selectedHubs,
  onToggleHub
}) => {
  if (hubs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hubs available for bulk operations
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto space-y-2">
      {hubs.map((hub) => (
        <HubListItem
          key={hub.id}
          hub={hub}
          isSelected={selectedHubs.has(hub.id)}
          onToggleSelect={onToggleHub}
        />
      ))}
    </div>
  );
};

export default HubList;
