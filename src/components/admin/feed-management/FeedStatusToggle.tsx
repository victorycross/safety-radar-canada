
import React from 'react';
import { Switch } from '@/components/ui/switch';

interface FeedStatusToggleProps {
  isActive: boolean;
  onToggle: (isActive: boolean) => void;
}

const FeedStatusToggle: React.FC<FeedStatusToggleProps> = ({ isActive, onToggle }) => {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        checked={isActive}
        onCheckedChange={onToggle}
      />
      <span className="text-xs text-muted-foreground">
        {isActive ? 'Active' : 'Inactive'}
      </span>
    </div>
  );
};

export default FeedStatusToggle;
