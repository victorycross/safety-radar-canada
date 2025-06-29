
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Plus } from 'lucide-react';
import { AlertSource } from '@/types/dataIngestion';
import FeedConfigurationCard from './FeedConfigurationCard';

interface FeedManagementContentProps {
  feeds: AlertSource[];
  onAddFeed: () => void;
  onUpdate: () => void;
}

const FeedManagementContent: React.FC<FeedManagementContentProps> = ({ 
  feeds, 
  onAddFeed, 
  onUpdate 
}) => {
  if (feeds.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Database className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Feeds Configured</h3>
          <p className="text-muted-foreground text-center mb-4">
            Get started by adding your first data feed. All feeds will be automatically 
            normalized to ensure consistent data processing.
          </p>
          <Button onClick={onAddFeed}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Feed
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {feeds.map((feed) => (
        <FeedConfigurationCard
          key={feed.id}
          feed={feed}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};

export default FeedManagementContent;
