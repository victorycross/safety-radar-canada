
import React, { useState } from 'react';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { AlertLevel } from '@/types';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Circle, Map, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  // Get province fill color based on alert level
  const getProvinceColor = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
      case AlertLevel.SEVERE:
        return "fill-danger/70 stroke-danger";
      case AlertLevel.WARNING:
        return "fill-warning/70 stroke-warning";
      case AlertLevel.NORMAL:
        return "fill-success/70 stroke-success";
      default:
        return "fill-slate-200 stroke-slate-400";
    }
  };

  // Show province information on hover
  const handleProvinceHover = (provinceId: string | null) => {
    setActiveProvinceId(provinceId);
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
      
      <div className="relative h-[400px] w-full overflow-hidden p-4">
        <div className="north-america-map-container h-full w-full relative">
          {/* SVG Map of North America with focus on Canadian provinces */}
          <svg 
            viewBox="0 0 1000 600" 
            className="h-full w-full"
            aria-label="Map of North America focusing on Canadian provinces showing security incidents"
          >
            {/* United States (simplified background) */}
            <path 
              d="M100,400 L150,450 L250,470 L350,460 L450,470 L550,450 L600,430 L630,400 L600,350 L550,300 L500,280 L450,270 L400,280 L350,300 L300,320 L250,330 L200,350 L150,380 Z" 
              className="fill-slate-100 stroke-slate-300"
            />
            
            {/* Canadian Provinces */}
            {/* British Columbia */}
            <path 
              d="M100,240 L160,240 L180,300 L140,380 L100,400 L80,350 Z" 
              className={`${getProvinceColor(provinces.find(p => p.id === "bc")?.alertLevel || AlertLevel.NORMAL)} transition-colors hover:fill-opacity-80 cursor-pointer`}
              onMouseEnter={() => handleProvinceHover("bc")}
              onMouseLeave={() => handleProvinceHover(null)}
            />
            
            {/* Alberta */}
            <path 
              d="M180,300 L240,300 L240,400 L140,400 Z" 
              className={`${getProvinceColor(provinces.find(p => p.id === "ab")?.alertLevel || AlertLevel.NORMAL)} transition-colors hover:fill-opacity-80 cursor-pointer`}
              onMouseEnter={() => handleProvinceHover("ab")}
              onMouseLeave={() => handleProvinceHover(null)}
            />
            
            {/* Saskatchewan */}
            <path 
              d="M240,300 L300,300 L300,400 L240,400 Z" 
              className={`${getProvinceColor(provinces.find(p => p.id === "sk")?.alertLevel || AlertLevel.NORMAL)} transition-colors hover:fill-opacity-80 cursor-pointer`}
              onMouseEnter={() => handleProvinceHover("sk")}
              onMouseLeave={() => handleProvinceHover(null)}
            />
            
            {/* Manitoba */}
            <path 
              d="M300,300 L360,300 L370,350 L360,400 L300,400 Z" 
              className={`${getProvinceColor(provinces.find(p => p.id === "mb")?.alertLevel || AlertLevel.NORMAL)} transition-colors hover:fill-opacity-80 cursor-pointer`}
              onMouseEnter={() => handleProvinceHover("mb")}
              onMouseLeave={() => handleProvinceHover(null)}
            />
            
            {/* Ontario */}
            <path 
              d="M370,350 L440,330 L500,370 L480,450 L360,400 Z" 
              className={`${getProvinceColor(provinces.find(p => p.id === "on")?.alertLevel || AlertLevel.NORMAL)} transition-colors hover:fill-opacity-80 cursor-pointer`}
              onMouseEnter={() => handleProvinceHover("on")}
              onMouseLeave={() => handleProvinceHover(null)}
            />
            
            {/* Quebec */}
            <path 
              d="M500,370 L580,320 L600,400 L500,480 L480,450 Z" 
              className={`${getProvinceColor(provinces.find(p => p.id === "qc")?.alertLevel || AlertLevel.NORMAL)} transition-colors hover:fill-opacity-80 cursor-pointer`}
              onMouseEnter={() => handleProvinceHover("qc")}
              onMouseLeave={() => handleProvinceHover(null)}
            />
            
            {/* New Brunswick */}
            <circle 
              cx="600" cy="430" r="20"
              className={`${getProvinceColor(provinces.find(p => p.id === "nb")?.alertLevel || AlertLevel.NORMAL)} transition-colors hover:fill-opacity-80 cursor-pointer`}
              onMouseEnter={() => handleProvinceHover("nb")}
              onMouseLeave={() => handleProvinceHover(null)}
            />
            
            {/* Nova Scotia */}
            <circle 
              cx="630" cy="450" r="25"
              className={`${getProvinceColor(provinces.find(p => p.id === "ns")?.alertLevel || AlertLevel.NORMAL)} transition-colors hover:fill-opacity-80 cursor-pointer`}
              onMouseEnter={() => handleProvinceHover("ns")}
              onMouseLeave={() => handleProvinceHover(null)}
            />
            
            {/* Prince Edward Island */}
            <circle 
              cx="615" cy="420" r="10"
              className={`${getProvinceColor(provinces.find(p => p.id === "pe")?.alertLevel || AlertLevel.NORMAL)} transition-colors hover:fill-opacity-80 cursor-pointer`}
              onMouseEnter={() => handleProvinceHover("pe")}
              onMouseLeave={() => handleProvinceHover(null)}
            />
            
            {/* Newfoundland and Labrador */}
            <path 
              d="M650,370 L680,370 L690,390 L670,420 L650,410 Z" 
              className={`${getProvinceColor(provinces.find(p => p.id === "nl")?.alertLevel || AlertLevel.NORMAL)} transition-colors hover:fill-opacity-80 cursor-pointer`}
              onMouseEnter={() => handleProvinceHover("nl")}
              onMouseLeave={() => handleProvinceHover(null)}
            />
            
            {/* Northern territories */}
            {/* Yukon */}
            <path 
              d="M120,180 L170,180 L170,240 L120,240 Z" 
              className={`${getProvinceColor(provinces.find(p => p.id === "yt")?.alertLevel || AlertLevel.NORMAL)} transition-colors hover:fill-opacity-80 cursor-pointer`}
              onMouseEnter={() => handleProvinceHover("yt")}
              onMouseLeave={() => handleProvinceHover(null)}
            />
            
            {/* Northwest Territories */}
            <path 
              d="M170,180 L270,180 L270,240 L170,240 Z" 
              className={`${getProvinceColor(provinces.find(p => p.id === "nt")?.alertLevel || AlertLevel.NORMAL)} transition-colors hover:fill-opacity-80 cursor-pointer`}
              onMouseEnter={() => handleProvinceHover("nt")}
              onMouseLeave={() => handleProvinceHover(null)}
            />
            
            {/* Nunavut */}
            <path 
              d="M270,180 L370,180 L370,240 L270,240 Z" 
              className={`${getProvinceColor(provinces.find(p => p.id === "nu")?.alertLevel || AlertLevel.NORMAL)} transition-colors hover:fill-opacity-80 cursor-pointer`}
              onMouseEnter={() => handleProvinceHover("nu")}
              onMouseLeave={() => handleProvinceHover(null)}
            />
            
            {/* Add ocean/water */}
            <path 
              d="M0,0 L0,600 L100,600 L100,400 L80,350 L100,240 L120,180 L100,100 L0,100 Z" 
              className="fill-blue-100 stroke-blue-200"
            />
            <path 
              d="M650,410 L670,420 L690,390 L680,370 L700,350 L750,400 L800,350 L850,400 L900,350 L950,400 L1000,350 L1000,600 L0,600 L100,600 L100,400 L140,380 L140,400 L240,400 L300,400 L360,400 L480,450 L500,480 L600,430 L630,450 Z" 
              className="fill-blue-100 stroke-blue-200"
            />
            
            {/* Canada-US Border line */}
            <path 
              d="M100,400 L140,380 L140,400" 
              className="fill-none stroke-slate-400 stroke-dashed"
              strokeDasharray="5,5"
            />
            
            {/* Arctic/Northern waters */}
            <path 
              d="M0,0 L1000,0 L1000,100 L900,150 L800,120 L700,150 L600,120 L500,150 L400,120 L300,130 L200,100 L100,100 L120,180 L270,180 L370,180 L370,240 L360,300 L300,300 L240,300 L180,300 L160,240 L120,240 Z" 
              className="fill-blue-100 stroke-blue-200"
            />
            
            {/* Province labels */}
            <text x="130" y="320" className="fill-slate-900 text-xs font-medium">BC</text>
            <text x="210" y="350" className="fill-slate-900 text-xs font-medium">AB</text>
            <text x="270" y="350" className="fill-slate-900 text-xs font-medium">SK</text>
            <text x="330" y="350" className="fill-slate-900 text-xs font-medium">MB</text>
            <text x="420" y="400" className="fill-slate-900 text-xs font-medium">ON</text>
            <text x="540" y="400" className="fill-slate-900 text-xs font-medium">QC</text>
            <text x="600" y="430" className="fill-slate-900 text-xs font-medium">NB</text>
            <text x="630" y="450" className="fill-slate-900 text-xs font-medium">NS</text>
            <text x="615" y="420" className="fill-slate-900 text-xs font-medium">PE</text>
            <text x="670" y="390" className="fill-slate-900 text-xs font-medium">NL</text>
            <text x="145" y="210" className="fill-slate-900 text-xs font-medium">YT</text>
            <text x="220" y="210" className="fill-slate-900 text-xs font-medium">NT</text>
            <text x="320" y="210" className="fill-slate-900 text-xs font-medium">NU</text>
            
            {/* USA label */}
            <text x="350" y="380" className="fill-slate-400 text-xs font-medium opacity-70">UNITED STATES</text>
            
            {/* Ocean labels */}
            <text x="50" y="50" className="fill-blue-400 text-xs font-medium italic">ARCTIC OCEAN</text>
            <text x="800" y="450" className="fill-blue-400 text-xs font-medium italic">ATLANTIC OCEAN</text>
            <text x="50" y="500" className="fill-blue-400 text-xs font-medium italic">PACIFIC OCEAN</text>
            
            {/* Incident count circles */}
            {provinces.map(province => {
              const provinceIncidents = getIncidentsForProvince(province.id);
              if (provinceIncidents.length === 0) return null;
              
              // Position coordinates for incident counters
              const positionMap: Record<string, { x: number, y: number }> = {
                bc: { x: 120, y: 320 },
                ab: { x: 210, y: 350 },
                sk: { x: 270, y: 350 },
                mb: { x: 330, y: 350 },
                on: { x: 420, y: 380 },
                qc: { x: 540, y: 380 },
                nb: { x: 600, y: 430 },
                ns: { x: 630, y: 450 },
                pe: { x: 615, y: 420 },
                nl: { x: 670, y: 390 },
                yt: { x: 145, y: 210 },
                nt: { x: 220, y: 210 },
                nu: { x: 320, y: 210 }
              };
              
              const position = positionMap[province.id];
              if (!position) return null;
              
              return (
                <g key={province.id}>
                  <circle 
                    cx={position.x} 
                    cy={position.y} 
                    r={16} 
                    className="fill-white stroke-slate-700 stroke-2" 
                  />
                  <text 
                    x={position.x} 
                    y={position.y} 
                    textAnchor="middle" 
                    dominantBaseline="central" 
                    className="text-xs font-bold fill-slate-700"
                  >
                    {provinceIncidents.length}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* Province Info Popup when hovering */}
          {activeProvinceId && (
            <div className="absolute top-0 right-0 w-64 bg-white border rounded-lg shadow-lg p-4">
              {provinces.find(p => p.id === activeProvinceId) && (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">
                      {provinces.find(p => p.id === activeProvinceId)?.name}
                    </h3>
                    {getAlertLevelBadge(provinces.find(p => p.id === activeProvinceId)?.alertLevel || AlertLevel.NORMAL)}
                  </div>
                  <p className="text-sm mb-2">
                    {getIncidentsForProvince(activeProvinceId).length} incidents reported
                  </p>
                  <Link to={`/province/${activeProvinceId}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <MapPin className="mr-1 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}
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
