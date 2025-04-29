
import React from 'react';
import { useSecurity } from '@/context/SecurityContext';
import { AlertLevel } from '@/types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const CanadaMap = () => {
  const { provinces } = useSecurity();
  
  const getProvinceClass = (provinceId: string) => {
    const province = provinces.find(p => p.id === provinceId);
    if (!province) return '';
    
    switch (province.alertLevel) {
      case AlertLevel.SEVERE:
        return 'severe';
      case AlertLevel.WARNING:
        return 'warning';
      case AlertLevel.NORMAL:
        return 'normal';
      default:
        return '';
    }
  };

  const getAlertLevelBadge = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
      case AlertLevel.SEVERE:
        return (
          <Badge className="bg-danger hover:bg-danger/90">Severe</Badge>
        );
      case AlertLevel.WARNING:
        return (
          <Badge className="bg-warning hover:bg-warning/90">Warning</Badge>
        );
      case AlertLevel.NORMAL:
        return (
          <Badge className="bg-success hover:bg-success/90">Normal</Badge>
        );
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Canada Security Map</h2>
        <p className="text-sm text-muted-foreground">Provincial security status overview</p>
      </div>
      
      <div className="map-container border rounded-lg relative">
        <svg viewBox="0 0 1000 800" className="w-full h-full">
          {/* More accurate Canada map */}
          <g>
            {/* British Columbia */}
            <path 
              className={`map-province ${getProvinceClass("bc")}`}
              d="M100,260 L120,200 L160,180 L180,140 L170,100 L200,80 L220,100 L230,140 L270,180 L270,220 L220,280 L200,340 L170,380 L140,370 L120,320 z"
            />
            <text x="170" y="240" className="font-medium text-xs">BC</text>
            
            {/* Alberta */}
            <path 
              className={`map-province ${getProvinceClass("ab")}`}
              d="M270,180 L270,220 L220,280 L220,380 L280,380 L280,180 z"
            />
            <text x="250" y="280" className="font-medium text-xs">AB</text>
            
            {/* Saskatchewan */}
            <path 
              className={`map-province ${getProvinceClass("sk")}`}
              d="M280,180 L280,380 L340,380 L340,180 z"
            />
            <text x="310" y="280" className="font-medium text-xs">SK</text>
            
            {/* Manitoba */}
            <path 
              className={`map-province ${getProvinceClass("mb")}`}
              d="M340,180 L340,380 L400,380 L420,340 L410,280 L420,240 L400,180 z"
            />
            <text x="370" y="280" className="font-medium text-xs">MB</text>
            
            {/* Ontario */}
            <path 
              className={`map-province ${getProvinceClass("on")}`}
              d="M400,180 L420,240 L410,280 L420,340 L400,380 L450,380 L500,340 L520,300 L560,280 L580,240 L540,200 L500,180 L480,150 L440,140 z"
            />
            <text x="480" y="280" className="font-medium text-xs">ON</text>
            
            {/* Quebec */}
            <path 
              className={`map-province ${getProvinceClass("qc")}`}
              d="M500,180 L480,150 L440,140 L460,100 L500,80 L540,60 L580,80 L620,120 L650,140 L680,180 L670,220 L640,240 L620,280 L580,240 L540,200 z"
            />
            <text x="580" y="180" className="font-medium text-xs">QC</text>
            
            {/* New Brunswick */}
            <path 
              className={`map-province ${getProvinceClass("nb")}`}
              d="M640,240 L670,220 L690,240 L680,280 L650,290 L630,270 z"
            />
            <text x="660" y="260" className="font-medium text-xs">NB</text>
            
            {/* Nova Scotia */}
            <path 
              className={`map-province ${getProvinceClass("ns")}`}
              d="M680,280 L710,280 L740,300 L720,320 L690,320 L670,310 L650,290 z"
            />
            <text x="700" y="300" className="font-medium text-xs">NS</text>
            
            {/* PEI */}
            <path 
              className={`map-province ${getProvinceClass("pe")}`}
              d="M675,265 L695,260 L700,270 L680,275 z"
            />
            <text x="685" y="270" className="font-medium text-xs">PE</text>
            
            {/* Newfoundland and Labrador */}
            <path 
              className={`map-province ${getProvinceClass("nl")}`}
              d="M680,180 L710,160 L750,160 L770,180 L760,200 L730,210 L700,220 L690,240 L670,220 z"
            />
            <text x="730" y="190" className="font-medium text-xs">NL</text>
            
            {/* Yukon */}
            <path 
              className={`map-province ${getProvinceClass("yt")}`}
              d="M170,100 L200,80 L190,40 L150,20 L120,40 L130,80 z"
            />
            <text x="160" y="60" className="font-medium text-xs">YT</text>
            
            {/* Northwest Territories */}
            <path 
              className={`map-province ${getProvinceClass("nt")}`}
              d="M200,80 L220,100 L230,140 L270,180 L280,180 L340,180 L380,150 L360,100 L330,70 L280,60 L240,40 L190,40 z"
            />
            <text x="280" y="120" className="font-medium text-xs">NT</text>
            
            {/* Nunavut */}
            <path 
              className={`map-province ${getProvinceClass("nu")}`}
              d="M380,150 L340,180 L400,180 L440,140 L460,100 L500,80 L520,40 L490,30 L440,20 L400,30 L360,50 L330,70 L360,100 z"
            />
            <text x="420" y="100" className="font-medium text-xs">NU</text>
          </g>
        </svg>
      </div>
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <Info className="mr-1 h-4 w-4" />
                View Details
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CanadaMap;
