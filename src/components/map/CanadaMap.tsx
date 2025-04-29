
import React from 'react';
import { useSecurity } from '@/context/SecurityContext';
import { AlertLevel } from '@/types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Square, Hexagon, Triangle, Circle, Diamond } from 'lucide-react';
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
      
      <div className="map-container border rounded-lg p-4 relative">
        <div className="grid grid-cols-3 gap-6 md:grid-cols-4 lg:grid-cols-5 relative">
          {/* Western Provinces */}
          <div className={`province-shape ${getProvinceClass("bc")}`}>
            <div className="flex flex-col items-center justify-center p-4">
              <Diamond size={48} className="mb-2" />
              <span className="text-xs font-medium">BC</span>
            </div>
          </div>
          
          <div className={`province-shape ${getProvinceClass("ab")}`}>
            <div className="flex flex-col items-center justify-center p-4">
              <Square size={48} className="mb-2" />
              <span className="text-xs font-medium">AB</span>
            </div>
          </div>
          
          <div className={`province-shape ${getProvinceClass("sk")}`}>
            <div className="flex flex-col items-center justify-center p-4">
              <Triangle size={48} className="mb-2" />
              <span className="text-xs font-medium">SK</span>
            </div>
          </div>
          
          <div className={`province-shape ${getProvinceClass("mb")}`}>
            <div className="flex flex-col items-center justify-center p-4">
              <Hexagon size={48} className="mb-2" />
              <span className="text-xs font-medium">MB</span>
            </div>
          </div>
          
          {/* Ontario and Quebec */}
          <div className={`province-shape ${getProvinceClass("on")}`}>
            <div className="flex flex-col items-center justify-center p-4">
              <Circle size={56} className="mb-2" />
              <span className="text-xs font-medium">ON</span>
            </div>
          </div>
          
          <div className={`province-shape ${getProvinceClass("qc")}`}>
            <div className="flex flex-col items-center justify-center p-4">
              <Circle size={52} className="mb-2" />
              <span className="text-xs font-medium">QC</span>
            </div>
          </div>
          
          {/* Atlantic Provinces */}
          <div className={`province-shape ${getProvinceClass("nb")}`}>
            <div className="flex flex-col items-center justify-center p-4">
              <Square size={36} className="mb-2" />
              <span className="text-xs font-medium">NB</span>
            </div>
          </div>
          
          <div className={`province-shape ${getProvinceClass("ns")}`}>
            <div className="flex flex-col items-center justify-center p-4">
              <Triangle size={36} className="mb-2" />
              <span className="text-xs font-medium">NS</span>
            </div>
          </div>
          
          <div className={`province-shape ${getProvinceClass("pe")}`}>
            <div className="flex flex-col items-center justify-center p-4">
              <Diamond size={30} className="mb-2" />
              <span className="text-xs font-medium">PE</span>
            </div>
          </div>
          
          <div className={`province-shape ${getProvinceClass("nl")}`}>
            <div className="flex flex-col items-center justify-center p-4">
              <Hexagon size={36} className="mb-2" />
              <span className="text-xs font-medium">NL</span>
            </div>
          </div>
          
          {/* Northern territories */}
          <div className={`province-shape ${getProvinceClass("yt")}`}>
            <div className="flex flex-col items-center justify-center p-4">
              <Triangle size={36} className="mb-2" />
              <span className="text-xs font-medium">YT</span>
            </div>
          </div>
          
          <div className={`province-shape ${getProvinceClass("nt")}`}>
            <div className="flex flex-col items-center justify-center p-4">
              <Diamond size={36} className="mb-2" />
              <span className="text-xs font-medium">NT</span>
            </div>
          </div>
          
          <div className={`province-shape ${getProvinceClass("nu")}`}>
            <div className="flex flex-col items-center justify-center p-4">
              <Hexagon size={36} className="mb-2" />
              <span className="text-xs font-medium">NU</span>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 right-0 p-2 bg-white/80 rounded-tl-md text-xs">
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
        </div>
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
                <Circle className="mr-1 h-4 w-4" />
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
