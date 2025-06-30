
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

const RealtimeStatus: React.FC = () => {
  const { status, reconnect } = useRealtimeUpdates();

  const getStatusColor = () => {
    if (status.isConnected && status.errorCount === 0) return 'default';
    if (status.errorCount > 0 && status.errorCount < 3) return 'secondary';
    return 'destructive';
  };

  const getStatusText = () => {
    if (status.isConnected && status.errorCount === 0) return 'Live';
    if (status.errorCount > 0 && status.errorCount < 3) return 'Unstable';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (status.isConnected && status.errorCount === 0) {
      return <Wifi className="h-3 w-3" />;
    }
    return <WifiOff className="h-3 w-3" />;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor()} className="flex items-center gap-1">
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
            {!status.isConnected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reconnect}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p><strong>Status:</strong> {getStatusText()}</p>
            <p><strong>Subscriptions:</strong> {status.subscriptions.length}</p>
            {status.lastUpdate && (
              <p><strong>Last Update:</strong> {status.lastUpdate.toLocaleTimeString()}</p>
            )}
            {status.errorCount > 0 && (
              <p className="text-red-500"><strong>Errors:</strong> {status.errorCount}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RealtimeStatus;
