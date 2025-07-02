import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Shield, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { AlertWithConfidence } from '@/services/confidenceFilteringService';

interface ConfidenceIndicatorProps {
  alert: AlertWithConfidence;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  alert,
  size = 'md',
  showLabel = true
}) => {
  const getConfidenceDisplay = () => {
    if (alert.isFromAuthoritativeSource) {
      return {
        icon: Shield,
        label: 'Authoritative',
        description: 'From verified government source',
        variant: 'default' as const,
        color: 'text-green-600'
      };
    }

    switch (alert.confidenceLevel) {
      case 'high':
        return {
          icon: CheckCircle,
          label: 'High Confidence',
          description: `${Math.round(alert.dataQualityScore * 100)}% confidence - Complete and verified data`,
          variant: 'default' as const,
          color: 'text-green-600'
        };
      case 'medium':
        return {
          icon: Info,
          label: 'Medium Confidence',
          description: `${Math.round(alert.dataQualityScore * 100)}% confidence - Good quality data`,
          variant: 'secondary' as const,
          color: 'text-blue-600'
        };
      case 'low':
        return {
          icon: AlertTriangle,
          label: 'Low Confidence',
          description: `${Math.round(alert.dataQualityScore * 100)}% confidence - Incomplete or unverified data`,
          variant: 'outline' as const,
          color: 'text-orange-600'
        };
      case 'very-low':
        return {
          icon: AlertTriangle,
          label: 'Very Low Confidence',
          description: `${Math.round(alert.dataQualityScore * 100)}% confidence - Poor quality or unreliable data`,
          variant: 'destructive' as const,
          color: 'text-red-600'
        };
    }
  };

  const display = getConfidenceDisplay();
  const Icon = display.icon;

  const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={display.variant} className={`flex items-center gap-1 ${textSize}`}>
            <Icon className={`${iconSize} ${display.color}`} />
            {showLabel && <span>{display.label}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">{display.label}</p>
            <p className="text-xs text-muted-foreground">{display.description}</p>
            <p className="text-xs">Source: {alert.source}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConfidenceIndicator;