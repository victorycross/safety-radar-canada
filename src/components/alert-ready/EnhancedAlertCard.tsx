
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { AlertItem, getSeverityBadge, getUrgencyBadge, formatAlertDate, formatTimeRange } from '@/utils/alertReadyUtils';

interface EnhancedAlertCardProps {
  alert: AlertItem;
}

const EnhancedAlertCard = ({ alert }: EnhancedAlertCardProps) => {
  const severityInfo = getSeverityBadge(alert.severity);
  const urgencyInfo = getUrgencyBadge(alert.urgency);
  const timeRange = formatTimeRange(alert.effectiveTime, alert.expiryTime);
  
  const isHighPriority = alert.severity === 'Extreme' || alert.severity === 'Severe' || alert.urgency === 'Immediate';
  
  return (
    <Card className={`overflow-hidden ${isHighPriority ? 'border-red-500 shadow-md' : ''}`}>
      <div className={`h-2 ${isHighPriority ? 'bg-red-500' : alert.urgency === 'Expected' ? 'bg-yellow-500' : 'bg-muted'}`}></div>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-lg leading-tight flex-1">{alert.title}</CardTitle>
          <div className="flex gap-2 flex-shrink-0">
            <Badge className={severityInfo.color}>{severityInfo.text}</Badge>
            <Badge className={urgencyInfo.color}>{urgencyInfo.text}</Badge>
          </div>
        </div>
        
        <CardDescription className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-3 w-3" />
            <span>Published: {formatAlertDate(alert.published)}</span>
            {alert.updated && (
              <span className="text-muted-foreground">• Updated: {formatAlertDate(alert.updated)}</span>
            )}
          </div>
          
          {alert.area && alert.area !== 'Unknown' && alert.area !== 'Area not specified' && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3 w-3" />
              <span>{alert.area}</span>
            </div>
          )}
          
          {timeRange && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{timeRange}</span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{alert.summary}</p>
        
        {alert.instructions && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <span className="font-medium">Recommended Action:</span> {alert.instructions}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between items-center pt-2 border-t">
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span><span className="font-medium">Category:</span> {alert.category}</span>
            <span><span className="font-medium">Status:</span> {alert.status}</span>
            {alert.author && (
              <span><span className="font-medium">Source:</span> {alert.author}</span>
            )}
          </div>
          
          {alert.url && (
            <a 
              href={alert.url} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center text-sm"
            >
              Details <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedAlertCard;
