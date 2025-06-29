
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface FeedManagementHeaderProps {
  onAddFeed: () => void;
}

const FeedManagementHeader: React.FC<FeedManagementHeaderProps> = ({ onAddFeed }) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Feed Management</h2>
        <p className="text-muted-foreground">
          Manage and configure data feeds with normalized processing
        </p>
      </div>
      <Button onClick={onAddFeed}>
        <Plus className="h-4 w-4 mr-2" />
        Add New Feed
      </Button>
    </div>
  );
};

export default FeedManagementHeader;
