
import React from 'react';
import { AlertLevel } from '@/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import { Incident, Province } from '@/types';

interface ProvincePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ProvinceOverlayProps {
  province: Province;
  position: ProvincePosition;
  incidents: Incident[];
  activeProvinceId: string | null;
  onHover: (provinceId: string | null) => void;
}

const ProvinceOverlay = ({ 
  province, 
  position, 
  incidents, 
  activeProvinceId, 
  onHover 
}: ProvinceOverlayProps) => {
  
  // Safety check - return null if position is undefined
  if (!position) {
    return null;
  }
  
  // Filter out any archived incidents (extra safety check)
  const activeIncidents = incidents.filter(incident => !incident.archived_at);
  
  // Get alert level color for the overlay
  const getAlertLevelColor = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
      case AlertLevel.SEVERE:
        return 'rgba(255, 0, 0, 0.5)'; // Semi-transparent red
      case AlertLevel.WARNING:
        return 'rgba(255, 165, 0, 0.5)'; // Semi-transparent orange
      case AlertLevel.NORMAL:
        return 'rgba(0, 255, 0, 0.3)'; // Semi-transparent green
      default:
        return 'rgba(200, 200, 200, 0.3)'; // Semi-transparent gray
    }
  };

  // Get appropriate badge for the alert level
  const getAlertLevelBadge = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
      case AlertLevel.SEVERE:
        return <Badge className="bg-danger hover:bg-danger/90">Severe</Badge>;
      case AlertLevel.WARNING:
        return <Badge className="bg-warning hover:bg-warning/90">Warning</Badge>;
      case AlertLevel.NORMAL:
        return <Badge className="bg-success hover:bg-success/90">Normal</Badge>;
    }
  };

  return (
    <HoverCard key={province.id} openDelay={100} closeDelay={100}>
      <HoverCardTrigger asChild>
        <div 
          className="absolute cursor-pointer hover:opacity-75 transition-opacity"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            width: `${position.width}%`,
            height: `${position.height}%`,
            backgroundColor: getAlertLevelColor(province.alertLevel),
            borderRadius: '5px',
            border: activeProvinceId === province.id ? '2px solid black' : 'none',
          }}
          onMouseEnter={() => onHover(province.id)}
          onMouseLeave={() => onHover(null)}
        >
          {/* Province Label */}
          <span className="font-medium text-xs text-slate-800 whitespace-nowrap">
            {province.code}
          </span>
          
          {/* Incident count badge - only show if there are active incidents */}
          {activeIncidents.length > 0 && (
            <div 
              className="absolute bg-white rounded-full border-2 border-slate-700 flex items-center justify-center w-5 h-5"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
            >
              <span className="text-xs font-bold">
                {activeIncidents.length}
              </span>
            </div>
          )}
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 p-2">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium">{province.name}</h3>
          {getAlertLevelBadge(province.alertLevel)}
        </div>
        <p className="text-sm mb-2">
          {activeIncidents.length} active incident{activeIncidents.length !== 1 ? 's' : ''} reported
        </p>
        <Link to={`/province/${province.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            <MapPin className="mr-1 h-4 w-4" />
            View Details
          </Button>
        </Link>
      </HoverCardContent>
    </HoverCard>
  );
};

export default ProvinceOverlay;
