
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, AlertTriangle, XCircle, Clock } from 'lucide-react';
import SourceMetrics from './SourceMetrics';
import SourceActions from './SourceActions';

interface SourceCardProps {
  source: any;
  uptime: number;
  isTestingThis: boolean;
  onToggleStatus: (checked: boolean) => void;
  onTest: () => void;
  onDelete: () => void;
}

const SourceCard: React.FC<SourceCardProps> = ({
  source,
  uptime,
  isTestingThis,
  onToggleStatus,
  onTest,
  onDelete
}) => {
  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {source.name}
              {getHealthIcon(source.health_status)}
            </CardTitle>
            <CardDescription className="mt-1">
              {source.description || 'No description'}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {source.source_type}
            </Badge>
            <Switch
              checked={source.is_active}
              onCheckedChange={onToggleStatus}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <SourceMetrics
          uptime={uptime}
          pollingInterval={source.polling_interval}
          lastPollAt={source.last_poll_at}
        />

        <Badge 
          variant={source.health_status === 'healthy' ? 'default' : 'destructive'}
          className="w-full justify-center"
        >
          {source.health_status.toUpperCase()}
        </Badge>

        <SourceActions
          onTest={onTest}
          onDelete={onDelete}
          isTestingThis={isTestingThis}
        />
      </CardContent>
    </Card>
  );
};

export default SourceCard;
