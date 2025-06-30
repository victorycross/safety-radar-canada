
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { InternationalHub } from '@/types/dashboard';
import { AlertLevel } from '@/types';

interface HubListItemProps {
  hub: InternationalHub;
  isSelected: boolean;
  onToggleSelect: (hubId: string) => void;
}

const HubListItem: React.FC<HubListItemProps> = ({
  hub,
  isSelected,
  onToggleSelect
}) => {
  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={() => onToggleSelect(hub.id)}
    >
      <div className="flex items-center space-x-3">
        <Checkbox
          checked={isSelected}
          onChange={() => onToggleSelect(hub.id)}
        />
        <span className="text-xl">{hub.flagEmoji}</span>
        <div>
          <span className="font-medium">{hub.name}</span>
          <p className="text-sm text-gray-600">{hub.country} • {hub.code}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Badge variant={hub.isActive ? 'default' : 'secondary'}>
          {hub.isActive ? 'Active' : 'Inactive'}
        </Badge>
        <Badge 
          variant="outline"
          className={hub.alertLevel === AlertLevel.SEVERE ? 'border-red-500 text-red-600' :
                   hub.alertLevel === AlertLevel.WARNING ? 'border-yellow-500 text-yellow-600' :
                   'border-green-500 text-green-600'}
        >
          {hub.alertLevel}
        </Badge>
        <div className="text-sm text-gray-600">
          {hub.employeeCount} employees
        </div>
      </div>
    </div>
  );
};

export default HubListItem;
