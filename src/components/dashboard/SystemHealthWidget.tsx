
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Database, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from 'react-router-dom';

interface SystemHealthWidgetProps {
  dataSourcesCount?: number;
  healthySourcesCount?: number;
  processingQueueCount?: number;
  lastProcessingTime?: Date;
  systemErrors?: number;
}

const SystemHealthWidget: React.FC<SystemHealthWidgetProps> = ({
  dataSourcesCount = 0,
  healthySourcesCount = 0,
  processingQueueCount = 0,
  lastProcessingTime,
  systemErrors = 0
}) => {
  const { isAdmin } = useAuth();

  // Only show to admin users
  if (!isAdmin()) {
    return null;
  }

  const getSystemHealthStatus = () => {
    if (systemErrors > 0) return { status: 'error', color: 'destructive', text: 'Issues Detected' };
    if (healthySourcesCount < dataSourcesCount * 0.8) return { status: 'warning', color: 'secondary', text: 'Degraded' };
    return { status: 'healthy', color: 'default', text: 'Operational' };
  };

  const systemHealth = getSystemHealthStatus();

  const getLastProcessingText = () => {
    if (!lastProcessingTime) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - lastProcessingTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Data processing and source status</CardDescription>
          </div>
          <Badge variant={systemHealth.color as any} className="flex items-center gap-1">
            {systemHealth.status === 'healthy' && <CheckCircle className="h-3 w-3" />}
            {systemHealth.status === 'warning' && <AlertTriangle className="h-3 w-3" />}
            {systemHealth.status === 'error' && <AlertTriangle className="h-3 w-3" />}
            {systemHealth.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <span>Data Sources</span>
            </div>
            <span className="font-medium">{healthySourcesCount}/{dataSourcesCount}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>Queue</span>
            </div>
            <span className="font-medium">{processingQueueCount} items</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Last processing: {getLastProcessingText()}
        </div>

        {/* System Errors */}
        {systemErrors > 0 && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>{systemErrors} system error{systemErrors !== 1 ? 's' : ''} detected</span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <Button variant="outline" size="sm" asChild className="w-full">
            <Link to="/admin?tab=system-health" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              View System Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemHealthWidget;
