
import React from 'react';
import { Button } from '@/components/ui/button';
import { TestTube, Edit, Activity, Trash2, AlertCircle } from 'lucide-react';

interface FeedActionsProps {
  onTest: () => void;
  testing: boolean;
  onRemove?: () => void;
  removing?: boolean;
  disabled?: boolean;
}

const FeedActions: React.FC<FeedActionsProps> = ({ 
  onTest, 
  testing, 
  onRemove, 
  removing = false,
  disabled = false
}) => {
  return (
    <div className="flex space-x-2 pt-2">
      <Button 
        size="sm" 
        variant="outline" 
        onClick={onTest} 
        disabled={testing || disabled}
      >
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
      
      {onRemove ? (
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onRemove}
          disabled={removing || disabled}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          {removing ? (
            <>
              <Activity className="h-3 w-3 mr-1 animate-spin" />
              Removing...
            </>
          ) : (
            <>
              <Trash2 className="h-3 w-3 mr-1" />
              Remove
            </>
          )}
        </Button>
      ) : (
        <Button 
          size="sm" 
          variant="outline" 
          disabled
          className="text-muted-foreground"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          No Permission
        </Button>
      )}
    </div>
  );
};

export default FeedActions;
