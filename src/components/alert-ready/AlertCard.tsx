
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from 'lucide-react';
import { AlertItem, getSeverityBadge, getUrgencyBadge, formatAlertDate } from '@/utils/alertReadyUtils';

interface AlertCardProps {
  alert: AlertItem;
}

const AlertCard = ({ alert }: AlertCardProps) => {
  const renderSeverityBadge = (severity: string) => {
    const badgeInfo = getSeverityBadge(severity);
    return <Badge className={badgeInfo.color}>{badgeInfo.text}</Badge>;
  };
  
  const renderUrgencyBadge = (urgency: string) => {
    const badgeInfo = getUrgencyBadge(urgency);
    return <Badge className={badgeInfo.color}>{badgeInfo.text}</Badge>;
  };

  return (
    <Card key={alert.id} className="overflow-hidden">
      <div className={`h-2 ${alert.severity === 'Extreme' || alert.severity === 'Severe' ? 'bg-danger' : alert.urgency === 'Immediate' ? 'bg-warning' : 'bg-muted'}`}></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{alert.title}</CardTitle>
          <div className="flex space-x-2">
            {renderSeverityBadge(alert.severity)}
            {renderUrgencyBadge(alert.urgency)}
          </div>
        </div>
        <CardDescription>
          Published: {formatAlertDate(alert.published)}
          {alert.updated && ` • Updated: ${formatAlertDate(alert.updated)}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{alert.summary}</p>
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="font-medium">Category:</span> {alert.category}
            <span className="mx-2">•</span>
            <span className="font-medium">Status:</span> {alert.status}
          </div>
          <div>
            <span className="font-medium">Area:</span> {alert.area}
          </div>
        </div>
        {alert.url && (
          <div className="mt-4">
            <a 
              href={alert.url} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center"
            >
              More details <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertCard;
