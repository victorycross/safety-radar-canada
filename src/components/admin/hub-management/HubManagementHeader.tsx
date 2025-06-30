
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';

interface HubManagementHeaderProps {
  onRefresh: () => void;
}

const HubManagementHeader: React.FC<HubManagementHeaderProps> = ({ onRefresh }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">Hub Management</h2>
        <p className="text-muted-foreground">Manage international financial hubs and their security status</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <Button variant="default" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Hub
        </Button>
      </div>
    </div>
  );
};

export default HubManagementHeader;
