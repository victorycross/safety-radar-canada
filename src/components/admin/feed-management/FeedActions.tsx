
import React from 'react';
import { Button } from '@/components/ui/button';
import { TestTube, Edit, Activity } from 'lucide-react';

interface FeedActionsProps {
  onTest: () => void;
  testing: boolean;
}

const FeedActions: React.FC<FeedActionsProps> = ({ onTest, testing }) => {
  return (
    <div className="flex space-x-2 pt-2">
      <Button size="sm" variant="outline" onClick={onTest} disabled={testing}>
        {testing ? (
          <>
            <Activity className="h-3 w-3 mr-1 animate-spin" />
            Testing...
          </>
        ) : (
          <>
            <TestTube className="h-3 w-3 mr-1" />
            Test
          </>
        )}
      </Button>
      <Button size="sm" variant="outline" disabled>
        <Edit className="h-3 w-3 mr-1" />
        Edit
      </Button>
    </div>
  );
};

export default FeedActions;
