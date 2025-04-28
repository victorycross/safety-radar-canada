
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
        <svg viewBox="0 0 1000 500" className="w-full h-full">
          {/* Simplified Canada map with key provinces */}
          <g>
            {/* British Columbia */}
            <path 
              className={`map-province ${getProvinceClass("bc")}`}
              d="M100,150 L150,100 L170,150 L150,200 L170,250 L100,300 L50,250 z"
            />
            <text x="110" y="200" className="font-medium text-xs">BC</text>
            
            {/* Alberta */}
            <path 
              className={`map-province ${getProvinceClass("ab")}`}
              d="M170,150 L220,120 L240,200 L220,280 L170,250 z"
            />
            <text x="195" y="200" className="font-medium text-xs">AB</text>
            
            {/* Saskatchewan */}
            <path 
              className={`map-province ${getProvinceClass("sk")}`}
              d="M240,120 L290,120 L290,280 L240,280 z"
            />
            <text x="265" y="200" className="font-medium text-xs">SK</text>
            
            {/* Manitoba */}
            <path 
              className={`map-province ${getProvinceClass("mb")}`}
              d="M290,120 L340,120 L360,160 L360,260 L340,280 L290,280 z"
            />
            <text x="325" y="200" className="font-medium text-xs">MB</text>
            
            {/* Ontario */}
            <path 
              className={`map-province ${getProvinceClass("on")}`}
              d="M360,160 L420,120 L480,130 L500,180 L450,220 L430,260 L360,260 z"
            />
            <text x="420" y="190" className="font-medium text-xs">ON</text>
            
            {/* Quebec */}
            <path 
              className={`map-province ${getProvinceClass("qc")}`}
              d="M500,180 L550,150 L600,170 L620,210 L580,240 L520,260 L480,230 L450,220 z"
            />
            <text x="550" y="210" className="font-medium text-xs">QC</text>
            
            {/* New Brunswick */}
            <path 
              className={`map-province ${getProvinceClass("nb")}`}
              d="M620,210 L640,210 L650,230 L640,250 L620,250 L610,230 z"
            />
            <text x="630" y="230" className="font-medium text-xs">NB</text>
            
            {/* Nova Scotia */}
            <path 
              className={`map-province ${getProvinceClass("ns")}`}
              d="M650,230 L680,220 L690,240 L670,260 L650,250 z"
            />
            <text x="670" y="240" className="font-medium text-xs">NS</text>
            
            {/* PEI */}
            <path 
              className={`map-province ${getProvinceClass("pe")}`}
              d="M645,215 L660,215 L660,225 L645,225 z"
            />
            
            {/* Newfoundland */}
            <path 
              className={`map-province ${getProvinceClass("nl")}`}
              d="M670,180 L700,180 L710,200 L700,220 L670,220 L660,200 z"
            />
            <text x="685" y="200" className="font-medium text-xs">NL</text>
            
            {/* Territories (simplified) */}
            <path 
              className={`map-province ${getProvinceClass("yt")}`}
              d="M150,50 L200,50 L200,100 L150,100 z"
            />
            <text x="175" y="75" className="font-medium text-xs">YT</text>
            
            <path 
              className={`map-province ${getProvinceClass("nt")}`}
              d="M200,50 L300,50 L300,100 L200,100 z"
            />
            <text x="250" y="75" className="font-medium text-xs">NT</text>
            
            <path 
              className={`map-province ${getProvinceClass("nu")}`}
              d="M300,50 L400,50 L400,100 L300,100 z"
            />
            <text x="350" y="75" className="font-medium text-xs">NU</text>
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
