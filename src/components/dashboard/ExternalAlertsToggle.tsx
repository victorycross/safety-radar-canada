
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Eye, EyeOff } from 'lucide-react';

interface ExternalAlertsToggleProps {
  showExternalAlerts: boolean;
  onToggle: (show: boolean) => void;
  externalAlertCount: number;
}

const ExternalAlertsToggle: React.FC<ExternalAlertsToggleProps> = ({
  showExternalAlerts,
  onToggle,
  externalAlertCount
}) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ExternalLink className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm font-medium">External Alert Integration</CardTitle>
            <Badge variant="outline">
              {externalAlertCount} alert{externalAlertCount !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {showExternalAlerts ? (
              <Eye className="h-4 w-4 text-green-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
            <Switch
              checked={showExternalAlerts}
              onCheckedChange={onToggle}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-muted-foreground">
          {showExternalAlerts 
            ? 'Showing incidents created from external alert sources'
            : 'Hiding external alert incidents from main dashboard'
          }
        </p>
      </CardContent>
    </Card>
  );
};

export default ExternalAlertsToggle;
