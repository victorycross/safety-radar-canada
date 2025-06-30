
import React from 'react';
import { Button } from '@/components/ui/button';
import { TestTube, Settings, Trash2, RefreshCw } from 'lucide-react';

interface SourceActionsProps {
  onTest: () => void;
  onDelete: () => void;
  isTestingThis: boolean;
}

const SourceActions: React.FC<SourceActionsProps> = ({
  onTest,
  onDelete,
  isTestingThis
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onTest}
        disabled={isTestingThis}
        className="flex-1"
      >
        {isTestingThis ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <TestTube className="h-4 w-4" />
        )}
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
      >
        <Settings className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default SourceActions;
