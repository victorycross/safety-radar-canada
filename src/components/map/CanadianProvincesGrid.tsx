
import React from 'react';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { AlertLevel } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Link } from 'react-router-dom';
import { Circle } from 'lucide-react';

const CanadianProvincesGrid = () => {
  const { provinces } = useSupabaseDataContext();

  const provinceEmojis = {
    bc: '🏔️',
    ab: '🛢️',
    sk: '🌾',
    mb: '🦬',
    on: '🏙️',
    qc: '⚜️',
    nb: '🦞',
    ns: '⚓',
    pe: '🥔',
    nl: '🐟',
    yt: '❄️',
    nt: '💎',
    nu: '🐻‍❄️'
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
        return 'High Risk';
      case AlertLevel.WARNING:
        return 'Caution';
      case AlertLevel.NORMAL:
        return 'Safe';
      default:
        return 'Unknown';
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
            const emoji = provinceEmojis[province.id as keyof typeof provinceEmojis];
            
            return (
              <Link key={province.id} to={`/province/${province.id}`}>
                <div 
                  className={`
                    ${getAlertColor(province.alertLevel)} 
                    rounded-lg p-4 transition-all duration-300 ease-in-out 
                    hover:scale-105 hover:shadow-lg cursor-pointer
                    flex flex-col items-center justify-center space-y-3
                    min-h-[200px] group
                  `}
                  title={`${province.name} - ${province.employeeCount.toLocaleString()} employees`}
                >
                  {/* Flag/Emoji */}
                  <div className="text-3xl mb-2">{emoji}</div>
                  
                  {/* Circle Icon */}
                  <Circle 
                    size={48} 
                    className="text-white/80 group-hover:text-white transition-colors duration-200 stroke-2"
                  />
                  
                  {/* Location Name */}
                  <div className="text-center">
                    <div className="text-white font-bold text-lg">
                      {province.name}
                    </div>
                    <div className="text-white/90 text-sm">
                      {province.code.toUpperCase()}
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="text-white font-semibold text-lg">
                    {getAlertBadge(province.alertLevel)}
                  </div>
                  
                  {/* Stats */}
                  <div className="text-white/90 text-sm text-center space-y-1">
                    <div>0 warnings</div>
                    <div>{province.employeeCount.toLocaleString()} employees</div>
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
            <span className="text-sm">Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning"></div>
            <span className="text-sm">Caution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-danger"></div>
            <span className="text-sm">High Risk</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CanadianProvincesGrid;
