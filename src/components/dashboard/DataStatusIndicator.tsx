
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface DataStatusIndicatorProps {
  lastUpdated?: Date;
  isProcessing?: boolean;
  hasErrors?: boolean;
  dataSourcesCount?: number;
  healthySourcesCount?: number;
}

const DataStatusIndicator: React.FC<DataStatusIndicatorProps> = ({
  lastUpdated,
  isProcessing = false,
  hasErrors = false,
  dataSourcesCount = 0,
  healthySourcesCount = 0
}) => {
  const getStatusColor = () => {
    if (hasErrors) return 'destructive';
    if (isProcessing) return 'secondary';
    return 'default';
  };

  const getStatusIcon = () => {
    if (hasErrors) return XCircle;
    if (isProcessing) return Clock;
    return CheckCircle;
  };

  const getStatusText = () => {
    if (hasErrors) return 'Data Issues';
    if (isProcessing) return 'Updating...';
    return 'Current';
  };

  const getLastUpdatedText = () => {
    if (!lastUpdated) return 'Never updated';
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const StatusIcon = getStatusIcon();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getStatusColor()} className="flex items-center gap-1 cursor-help">
            <StatusIcon className="h-3 w-3" />
            <span className="text-xs">{getStatusText()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm space-y-1">
            <div><strong>Status:</strong> {getStatusText()}</div>
            <div><strong>Last Updated:</strong> {getLastUpdatedText()}</div>
            {dataSourcesCount > 0 && (
              <div><strong>Sources:</strong> {healthySourcesCount}/{dataSourcesCount} healthy</div>
            )}
            {lastUpdated && (
              <div className="text-xs text-muted-foreground">
                {lastUpdated.toLocaleString()}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DataStatusIndicator;
