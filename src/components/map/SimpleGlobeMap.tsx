
import React, { useState } from 'react';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { AlertLevel } from '@/types';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Circle, Map, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';

const SimpleGlobeMap = () => {
  const { provinces, incidents } = useSupabaseDataContext();
  const [activeProvinceId, setActiveProvinceId] = useState<string | null>(null);

  // Get all incidents for a specific province
  const getIncidentsForProvince = (provinceId: string) => {
    return incidents.filter(incident => incident.provinceId === provinceId);
  };

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

  // Show province information on hover
  const handleProvinceHover = (provinceId: string | null) => {
    setActiveProvinceId(provinceId);
  };

  // Province positions on the map (relative percentages)
  const provincePositions = {
    bc: { x: 12, y: 58, width: 10, height: 18 },
    ab: { x: 19, y: 61, width: 7, height: 15 },
    sk: { x: 27, y: 64, width: 7, height: 11 },
    mb: { x: 35, y: 64, width: 7, height: 12 },
    on: { x: 50, y: 72, width: 11, height: 16 },
    qc: { x: 60, y: 65, width: 13, height: 14 },
    nb: { x: 78, y: 72, width: 4, height: 5 },
    ns: { x: 84, y: 73, width: 4, height: 5 },
    pe: { x: 82, y: 70, width: 2, height: 2 },
    nl: { x: 83, y: 55, width: 7, height: 10 },
    yt: { x: 12, y: 35, width: 9, height: 10 },
    nt: { x: 23, y: 41, width: 13, height: 16 },
    nu: { x: 42, y: 36, width: 17, height: 25 },
  };

  // Alert level to color 
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

  const provinceLabelPositions = {
    bc: { x: 12, y: 58 },
    ab: { x: 19, y: 61 },
    sk: { x: 27, y: 64 },
    mb: { x: 35, y: 64 },
    on: { x: 50, y: 72 },
    qc: { x: 63, y: 65 },
    nb: { x: 78, y: 72 },
    ns: { x: 84, y: 73 },
    pe: { x: 82, y: 70 },
    nl: { x: 83, y: 56 },
    yt: { x: 12, y: 35 },
    nt: { x: 23, y: 45 },
    nu: { x: 48, y: 40 },
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <div className="mb-4 p-4 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Canada Security Map</h2>
            <p className="text-sm text-muted-foreground">Provincial security status overview</p>
          </div>
          <div className="flex items-center">
            <Map className="h-5 w-5 text-muted-foreground mr-1" />
            <span className="text-sm text-muted-foreground">Interactive Map</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-[500px] w-full overflow-hidden p-4">
        <div className="canada-map-container h-full w-full relative">
          {/* Base image of Canada */}
          <img 
            src="/lovable-uploads/baf68e9a-1d80-4327-ac1c-6ee360585f04.png" 
            alt="Map of Canada showing provinces and territories" 
            className="w-full h-full object-contain"
          />
          
          {/* Interactive province overlays */}
          <div className="absolute inset-0">
            {provinces.map(province => (
              <HoverCard key={province.id} openDelay={100} closeDelay={100}>
                <HoverCardTrigger asChild>
                  <div 
                    className="absolute cursor-pointer hover:opacity-75 transition-opacity"
                    style={{
                      left: `${provincePositions[province.id as keyof typeof provincePositions]?.x}%`,
                      top: `${provincePositions[province.id as keyof typeof provincePositions]?.y}%`,
                      width: `${provincePositions[province.id as keyof typeof provincePositions]?.width}%`,
                      height: `${provincePositions[province.id as keyof typeof provincePositions]?.height}%`,
                      backgroundColor: getAlertLevelColor(province.alertLevel),
                      borderRadius: '5px',
                      border: activeProvinceId === province.id ? '2px solid black' : 'none',
                    }}
                    onMouseEnter={() => handleProvinceHover(province.id)}
                    onMouseLeave={() => handleProvinceHover(null)}
                  >
                    {/* Province Label */}
                    <span className="font-medium text-xs text-slate-800 whitespace-nowrap">
                      {province.code}
                    </span>
                    
                    {/* Incident count badge */}
                    {getIncidentsForProvince(province.id).length > 0 && (
                      <div 
                        className="absolute bg-white rounded-full border-2 border-slate-700 flex items-center justify-center w-5 h-5"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <span className="text-xs font-bold">
                          {getIncidentsForProvince(province.id).length}
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
                    {getIncidentsForProvince(province.id).length} incidents reported
                  </p>
                  <Link to={`/province/${province.id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <MapPin className="mr-1 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>
        
        {/* Map legend */}
        <div className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-md shadow-sm text-xs">
          <div className="font-medium mb-1">Alert Level</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger"></div>
            <span>Severe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-4 h-4 rounded-full bg-white border border-slate-700 flex items-center justify-center text-[10px]">5</div>
            <span>Incident Count</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {provinces.filter(p => p.employeeCount > 0).map((province) => (
          <div key={province.id} className="border rounded-md p-3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{province.name}</h3>
              {getAlertLevelBadge(province.alertLevel)}
            </div>
            
            <div className="text-sm text-muted-foreground mb-2">
              {province.employeeCount.toLocaleString()} employees
            </div>
            
            <Link to={`/province/${province.id}`}>
              <Button variant="outline" size="sm" className="w-full">
                <Circle className="mr-1 h-4 w-4" />
                View Details
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SimpleGlobeMap;
