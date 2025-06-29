
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Expand, 
  Minimize2, 
  RotateCcw, 
  RefreshCw
} from 'lucide-react';

interface SourcesPageHeaderProps {
  autoRefresh: boolean;
  onToggleAutoRefresh: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onReset: () => void;
}

const SourcesPageHeader: React.FC<SourcesPageHeaderProps> = ({
  autoRefresh,
  onToggleAutoRefresh,
  onExpandAll,
  onCollapseAll,
  onReset
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">External Sources</h1>
        <p className="text-muted-foreground">
          Monitor and manage connected information sources feeding the security dashboard
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant={autoRefresh ? "default" : "outline"} 
          size="sm" 
          onClick={onToggleAutoRefresh}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
          Auto Refresh
        </Button>
        <Button variant="outline" size="sm" onClick={onExpandAll}>
          <Expand className="h-4 w-4 mr-2" />
          Expand All
        </Button>
        <Button variant="outline" size="sm" onClick={onCollapseAll}>
          <Minimize2 className="h-4 w-4 mr-2" />
          Collapse All
        </Button>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default SourcesPageHeader;
