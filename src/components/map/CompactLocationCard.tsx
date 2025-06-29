
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { AlertLevel } from '@/types';

interface CompactLocationCardProps {
  id: string;
  name: string;
  code?: string;
  country?: string;
  alertLevel: AlertLevel;
  employeeCount?: number;
  travelWarnings?: number;
  localIncidents?: number;
  emoji?: string;
  linkTo?: string;
  onClick?: () => void;
}

const CompactLocationCard = ({
  id,
  name,
  code,
  country,
  alertLevel,
  employeeCount,
  travelWarnings = 0,
  localIncidents = 0,
  emoji,
  linkTo,
  onClick
}: CompactLocationCardProps) => {
  const getAlertColor = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.SEVERE:
        return 'border-red-500 bg-red-50 hover:bg-red-100';
      case AlertLevel.WARNING:
        return 'border-yellow-500 bg-yellow-50 hover:bg-yellow-100';
      case AlertLevel.NORMAL:
        return 'border-green-500 bg-green-50 hover:bg-green-100';
      default:
        return 'border-gray-300 bg-gray-50 hover:bg-gray-100';
    }
  };

  const getAlertBadge = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.SEVERE:
        return <Badge variant="destructive" className="text-xs">High Risk</Badge>;
      case AlertLevel.WARNING:
        return <Badge className="bg-yellow-500 text-white text-xs">Caution</Badge>;
      case AlertLevel.NORMAL:
        return <Badge className="bg-green-500 text-white text-xs">Safe</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const cardContent = (
    <div 
      className={`
        ${getAlertColor(alertLevel)}
        border-2 rounded-lg p-3 transition-all duration-200 cursor-pointer
        hover:shadow-md min-h-[120px] flex flex-col justify-between
      `}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {emoji && <span className="text-lg">{emoji}</span>}
          <div>
            <h3 className="font-semibold text-sm leading-tight">{name}</h3>
            <p className="text-xs text-muted-foreground">
              {code ? code : country}
            </p>
          </div>
        </div>
        {getAlertBadge(alertLevel)}
      </div>

      {/* Stats */}
      <div className="space-y-1">
        {employeeCount && (
          <div className="text-xs text-muted-foreground">
            {employeeCount.toLocaleString()} employees
          </div>
        )}
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>{travelWarnings} warnings</span>
          <span>{localIncidents} incidents</span>
        </div>
      </div>
    </div>
  );

  // Use the provided linkTo or default to /province/:id
  const finalLinkTo = linkTo || `/province/${id}`;

  if (finalLinkTo) {
    return <Link to={finalLinkTo}>{cardContent}</Link>;
  }

  return cardContent;
};

export default CompactLocationCard;
