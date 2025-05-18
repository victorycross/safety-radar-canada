
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from 'lucide-react';
import { BCAlertsItem, getSeverityClass, formatBCAlertDate } from '@/utils/bcAlertsUtils';

interface BCAlertsCardProps {
  alert: BCAlertsItem;
}

const BCAlertsCard = ({ alert }: BCAlertsCardProps) => {
  return (
    <Card key={alert.id} className="overflow-hidden">
      <div className={`h-2 ${getSeverityClass(alert.severity)}`}></div>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{alert.title}</CardTitle>
          <div className="flex space-x-2">
            <Badge className={getSeverityClass(alert.severity)}>{alert.severity}</Badge>
            <Badge variant="outline">{alert.status}</Badge>
          </div>
        </div>
        <CardDescription>
          {alert.type} • Updated: {formatBCAlertDate(alert.updated)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4">{alert.description}</p>
        <div className="flex justify-between items-center text-sm">
          <div className="font-medium">{alert.location}</div>
          {alert.url && (
            <a 
              href={alert.url} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center"
            >
              View Details <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BCAlertsCard;
