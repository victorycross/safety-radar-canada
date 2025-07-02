import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Clock, Zap, AlertCircle } from 'lucide-react';

interface DataFreshnessIndicatorProps {
  lastUpdated?: Date | string;
  isProcessing?: boolean;
  hasErrors?: boolean;
  className?: string;
}

const DataFreshnessIndicator: React.FC<DataFreshnessIndicatorProps> = ({
  lastUpdated,
  isProcessing,
  hasErrors,
  className = ''
}) => {
  const getTimeAgo = (date: Date | string) => {
    const now = new Date();
    const updated = new Date(date);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return { text: 'Just now', isFresh: true };
    if (diffMins < 5) return { text: `${diffMins}m ago`, isFresh: true };
    if (diffMins < 60) return { text: `${diffMins}m ago`, isFresh: false };
    if (diffHours < 24) return { text: `${diffHours}h ago`, isFresh: false };
    return { text: `${diffDays}d ago`, isFresh: false };
  };

  const getFreshnessStatus = () => {
    if (hasErrors) {
      return {
        icon: AlertCircle,
        variant: 'destructive' as const,
        text: 'Data Error',
        description: 'There was an error updating the data'
      };
    }

    if (isProcessing) {
      return {
        icon: Zap,
        variant: 'secondary' as const,
        text: 'Updating...',
        description: 'Data is currently being refreshed'
      };
    }

    if (lastUpdated) {
      const timeInfo = getTimeAgo(lastUpdated);
      return {
        icon: Clock,
        variant: timeInfo.isFresh ? 'default' as const : 'outline' as const,
        text: timeInfo.text,
        description: `Last updated: ${new Date(lastUpdated).toLocaleString()}`
      };
    }

    return {
      icon: Clock,
      variant: 'outline' as const,
      text: 'Unknown',
      description: 'Data freshness unknown'
    };
  };

  const status = getFreshnessStatus();
  const Icon = status.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={status.variant} className={`flex items-center gap-1 text-xs ${className}`}>
            <Icon className="h-3 w-3" />
            <span>{status.text}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{status.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DataFreshnessIndicator;