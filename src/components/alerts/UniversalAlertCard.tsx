
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, MapPin, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { UniversalAlert } from '@/types/alerts';

interface UniversalAlertCardProps {
  alert: UniversalAlert;
}

const getSeverityColor = (severity: UniversalAlert['severity']) => {
  switch (severity) {
    case 'Extreme':
      return 'bg-red-600 text-white';
    case 'Severe':
      return 'bg-red-500 text-white';
    case 'Moderate':
      return 'bg-orange-500 text-white';
    case 'Minor':
      return 'bg-yellow-500 text-black';
    case 'Info':
      return 'bg-blue-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

const getUrgencyColor = (urgency: UniversalAlert['urgency']) => {
  switch (urgency) {
    case 'Immediate':
      return 'bg-red-600 text-white';
    case 'Expected':
      return 'bg-orange-500 text-white';
    case 'Future':
      return 'bg-blue-500 text-white';
    case 'Past':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-400 text-white';
  }
};

const formatAlertDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

const UniversalAlertCard = ({ alert }: UniversalAlertCardProps) => {
  const isHighPriority = alert.severity === 'Extreme' || alert.severity === 'Severe' || alert.urgency === 'Immediate';
  
  return (
    <Card className={`overflow-hidden ${isHighPriority ? 'border-red-500 shadow-md' : ''}`}>
      <div className={`h-2 ${isHighPriority ? 'bg-red-500' : alert.urgency === 'Expected' ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-lg leading-tight flex-1">{alert.title}</CardTitle>
          <div className="flex gap-2 flex-shrink-0">
            <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
            <Badge className={getUrgencyColor(alert.urgency)}>{alert.urgency}</Badge>
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
          
          {alert.area && alert.area !== 'Area not specified' && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3 w-3" />
              <span>{alert.area}</span>
            </div>
          )}
          
          {(alert.effective || alert.expires) && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                {alert.effective && `Effective: ${formatAlertDate(alert.effective)}`}
                {alert.effective && alert.expires && ' • '}
                {alert.expires && `Expires: ${formatAlertDate(alert.expires)}`}
              </span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{alert.description}</p>
        
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
            <span><span className="font-medium">Source:</span> {alert.source}</span>
            {alert.author && (
              <span><span className="font-medium">Author:</span> {alert.author}</span>
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

export default UniversalAlertCard;
