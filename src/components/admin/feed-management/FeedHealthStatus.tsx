
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface FeedHealthStatusProps {
  status: string;
}

const FeedHealthStatus: React.FC<FeedHealthStatusProps> = ({ status }) => {
  const getHealthStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default' as const,
      degraded: 'secondary' as const,
      error: 'destructive' as const,
      unknown: 'outline' as const
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {getHealthStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    );
  };

  return getHealthStatusBadge(status);
};

export default FeedHealthStatus;
