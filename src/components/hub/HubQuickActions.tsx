
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import { InternationalHub } from '@/types/dashboard';
import { AlertLevel } from '@/types';

interface HubQuickActionsProps {
  hub: InternationalHub;
  onRefresh?: () => void;
  onUpdateAlertLevel?: (hubId: string, level: AlertLevel) => void;
  compact?: boolean;
}

const HubQuickActions: React.FC<HubQuickActionsProps> = ({
  hub,
  onRefresh,
  onUpdateAlertLevel,
  compact = false
}) => {
  const getAlertLevelColor = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.SEVERE:
        return 'bg-red-500 hover:bg-red-600';
      case AlertLevel.WARNING:
        return 'bg-yellow-500 hover:bg-yellow-600';
      default:
        return 'bg-green-500 hover:bg-green-600';
    }
  };

  const getAlertLevelText = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.SEVERE:
        return 'High Risk';
      case AlertLevel.WARNING:
        return 'Caution';
      default:
        return 'Safe';
    }
  };

  const getStatusBadge = () => {
    return (
      <Badge
        variant={hub.isActive ? 'default' : 'secondary'}
        className={hub.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
      >
        {hub.isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          <Badge
            variant="secondary"
            className={`${getAlertLevelColor(hub.alertLevel)} text-white`}
          >
            {getAlertLevelText(hub.alertLevel)}
          </Badge>
        </div>
        <div className="flex items-center space-x-1">
          <Button asChild size="sm" variant="outline">
            <Link to={`/hub/${hub.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              View
            </Link>
          </Button>
          {onRefresh && (
            <Button size="sm" variant="ghost" onClick={onRefresh}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {getStatusBadge()}
        <Badge
          variant="secondary"
          className={`${getAlertLevelColor(hub.alertLevel)} text-white`}
        >
          {getAlertLevelText(hub.alertLevel)}
        </Badge>
      </div>

      <div className="flex items-center space-x-2">
        <Button asChild size="sm" className="flex-1">
          <Link to={`/hub/${hub.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Link>
        </Button>
        
        {onRefresh && (
          <Button size="sm" variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
        
        {onUpdateAlertLevel && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              const nextLevel = hub.alertLevel === AlertLevel.NORMAL 
                ? AlertLevel.WARNING 
                : hub.alertLevel === AlertLevel.WARNING 
                ? AlertLevel.SEVERE 
                : AlertLevel.NORMAL;
              onUpdateAlertLevel(hub.id, nextLevel);
            }}
          >
            <AlertTriangle className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default HubQuickActions;
