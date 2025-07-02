
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useUnifiedAlerts } from '@/hooks/useUnifiedAlerts';
import { UniversalAlert } from '@/types/alerts';
import { useAuth } from '@/components/auth/AuthProvider';

interface UnifiedAlertControlsProps {
  alerts: UniversalAlert[];
  onRefreshIncidents?: () => void;
}

const UnifiedAlertControls: React.FC<UnifiedAlertControlsProps> = ({ 
  alerts, 
  onRefreshIncidents 
}) => {
  const { 
    isProcessing, 
    integrationEnabled, 
    processAlertsToIncidents, 
    toggleIntegration 
  } = useUnifiedAlerts();
  const { isAdmin } = useAuth();

  const handleProcessAlerts = async () => {
    const processedIds = await processAlertsToIncidents(alerts);
    if (processedIds.length > 0 && onRefreshIncidents) {
      onRefreshIncidents();
    }
  };

  const getIntegrationStatus = () => {
    if (!integrationEnabled) return { color: 'secondary', text: 'Disabled' };
    if (isProcessing) return { color: 'default', text: 'Processing' };
    return { color: 'default', text: 'Active' };
  };

  const status = getIntegrationStatus();

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ArrowLeftRight className="h-5 w-5 text-blue-600" />
            <CardTitle>Unified Alert Integration</CardTitle>
            <Badge variant={status.color as any}>{status.text}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            {/* Only allow admins to toggle integration */}
            <Switch
              checked={integrationEnabled}
              onCheckedChange={isAdmin() ? toggleIntegration : undefined}
              disabled={!isAdmin()}
            />
            <Settings className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <CardDescription>
          Automatically convert external alerts into internal incidents for unified monitoring
          {!isAdmin() && (
            <span className="block text-sm text-orange-600 mt-1">
              Administrator privileges required to modify settings
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {integrationEnabled ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
              <span className="text-sm text-muted-foreground">
                {integrationEnabled 
                  ? 'External alerts will create internal incidents'
                  : 'Integration is currently disabled'
                }
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {alerts.length} alert{alerts.length !== 1 ? 's' : ''} available
            </span>
            {/* Only show Process Now button to admins */}
            {isAdmin() && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleProcessAlerts}
                disabled={!integrationEnabled || isProcessing || alerts.length === 0}
              >
                {isProcessing ? 'Processing...' : 'Process Now'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedAlertControls;
