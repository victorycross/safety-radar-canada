
import React from 'react';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { AlertLevel } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';
import { Circle, Square, Hexagon, Triangle, Diamond } from 'lucide-react';

const CanadianProvincesGrid = () => {
  const { provinces } = useSupabaseDataContext();

  const provinceShapes = {
    bc: { shape: Diamond, color: 'text-blue-600' },
    ab: { shape: Square, color: 'text-green-600' },
    sk: { shape: Triangle, color: 'text-yellow-600' },
    mb: { shape: Hexagon, color: 'text-purple-600' },
    on: { shape: Circle, color: 'text-red-600' },
    qc: { shape: Circle, color: 'text-indigo-600' },
    nb: { shape: Square, color: 'text-orange-600' },
    ns: { shape: Triangle, color: 'text-pink-600' },
    pe: { shape: Diamond, color: 'text-teal-600' },
    nl: { shape: Hexagon, color: 'text-cyan-600' },
    yt: { shape: Triangle, color: 'text-amber-600' },
    nt: { shape: Diamond, color: 'text-lime-600' },
    nu: { shape: Hexagon, color: 'text-emerald-600' }
  };

  const getAlertColor = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
      case AlertLevel.SEVERE:
        return 'bg-danger hover:bg-danger/90';
      case AlertLevel.WARNING:
        return 'bg-warning hover:bg-warning/90';
      case AlertLevel.NORMAL:
        return 'bg-success hover:bg-success/90';
      default:
        return 'bg-muted hover:bg-muted/90';
    }
  };

  const getAlertBadge = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
      case AlertLevel.SEVERE:
        return <Badge className="bg-danger text-white text-xs">Severe</Badge>;
      case AlertLevel.WARNING:
        return <Badge className="bg-warning text-white text-xs">Warning</Badge>;
      case AlertLevel.NORMAL:
        return <Badge className="bg-success text-white text-xs">Normal</Badge>;
      default:
        return <Badge className="bg-muted text-xs">Unknown</Badge>;
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Canadian Provinces & Territories</h2>
            <p className="text-sm text-muted-foreground mt-1">Provincial security status overview</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
          {provinces.map((province) => {
            const shapeConfig = provinceShapes[province.id as keyof typeof provinceShapes];
            if (!shapeConfig) return null;
            
            const ShapeIcon = shapeConfig.shape;
            
            return (
              <Link key={province.id} to={`/province/${province.id}`}>
                <div className={`
                  ${getAlertColor(province.alertLevel)} 
                  rounded-lg p-4 transition-all duration-300 ease-in-out 
                  hover:scale-105 hover:shadow-lg cursor-pointer
                  flex flex-col items-center justify-center space-y-2
                  min-h-[120px]
                `}>
                  <ShapeIcon 
                    size={48} 
                    className={`${shapeConfig.color} transition-transform duration-200`}
                  />
                  <div className="text-center">
                    <div className="text-white font-bold text-sm">
                      {province.code.toUpperCase()}
                    </div>
                    <div className="text-white/90 text-xs">
                      {province.employeeCount.toLocaleString()} employees
                    </div>
                  </div>
                  <div className="mt-1">
                    {getAlertBadge(province.alertLevel)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success"></div>
            <span className="text-sm">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span className="text-sm">Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger"></div>
            <span className="text-sm">Severe</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CanadianProvincesGrid;
