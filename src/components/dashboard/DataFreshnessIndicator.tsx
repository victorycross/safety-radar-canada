
import React from 'react';
import { Clock } from 'lucide-react';

interface DataFreshnessIndicatorProps {
  lastUpdated?: Date;
  className?: string;
}

const DataFreshnessIndicator: React.FC<DataFreshnessIndicatorProps> = ({
  lastUpdated,
  className = ""
}) => {
  if (!lastUpdated) return null;

  const getTimeAgo = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just updated';
    if (diffMins < 60) return `Updated ${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Updated ${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Updated ${diffDays}d ago`;
  };

  const isStale = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours > 24; // Consider data stale after 24 hours
  };

  return (
    <div className={`flex items-center gap-1 text-xs ${isStale() ? 'text-yellow-600' : 'text-muted-foreground'} ${className}`}>
      <Clock className="h-3 w-3" />
      <span>{getTimeAgo()}</span>
    </div>
  );
};

export default DataFreshnessIndicator;
