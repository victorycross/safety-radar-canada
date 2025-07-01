
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Map, Maximize2, Minimize2 } from 'lucide-react';
import { UniversalAlert } from '@/types/alerts';

interface AlertLocationMapProps {
  alerts: UniversalAlert[];
  onLocationClick?: (location: string) => void;
  selectedLocation?: string | null;
}

const AlertLocationMap: React.FC<AlertLocationMapProps> = ({
  alerts,
  onLocationClick,
  selectedLocation
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group alerts by location for visualization
  const locationGroups = alerts.reduce((acc, alert) => {
    if (!alert.area) return acc;
    
    if (!acc[alert.area]) {
      acc[alert.area] = [];
    }
    acc[alert.area].push(alert);
    return acc;
  }, {} as Record<string, UniversalAlert[]>);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Extreme': return 'bg-red-600';
      case 'Severe': return 'bg-red-500';
      case 'Moderate': return 'bg-orange-500';
      case 'Minor': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getCriticalityScore = (alerts: UniversalAlert[]) => {
    const severityWeights = { 'Extreme': 4, 'Severe': 3, 'Moderate': 2, 'Minor': 1 };
    return alerts.reduce((sum, alert) => sum + (severityWeights[alert.severity as keyof typeof severityWeights] || 1), 0);
  };

  // Simple visualization showing locations as dots sized by alert count and colored by severity
  const renderLocationDots = () => {
    const sortedLocations = Object.entries(locationGroups)
      .sort(([, a], [, b]) => getCriticalityScore(b) - getCriticalityScore(a));

    return (
      <div className="relative w-full h-64 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg overflow-hidden">
        {/* Background map representation */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 400 200" className="w-full h-full">
            {/* Simple Canada outline representation */}
            <path
              d="M50 100 Q100 80 150 90 Q200 85 250 95 Q300 90 350 100 Q340 130 300 140 Q250 145 200 140 Q150 135 100 130 Q60 125 50 100 Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Location dots */}
        <div className="absolute inset-4 flex flex-wrap items-start justify-start gap-2">
          {sortedLocations.map(([location, locationAlerts], index) => {
            const criticalityScore = getCriticalityScore(locationAlerts);
            const highestSeverity = locationAlerts.reduce((highest, alert) => {
              const severityOrder = ['Minor', 'Moderate', 'Severe', 'Extreme'];
              return severityOrder.indexOf(alert.severity) > severityOrder.indexOf(highest) ? alert.severity : highest;
            }, 'Minor');
            
            const dotSize = Math.min(12 + (criticalityScore * 2), 24);
            const isSelected = selectedLocation === location;

            return (
              <div
                key={location}
                className={`relative cursor-pointer transition-all hover:scale-110 ${
                  isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                }`}
                onClick={() => onLocationClick?.(location)}
                style={{
                  left: `${(index % 8) * 12 + 5}%`,
                  top: `${Math.floor(index / 8) * 25 + 10}%`
                }}
              >
                <div
                  className={`rounded-full ${getSeverityColor(highestSeverity)} flex items-center justify-center text-white text-xs font-bold shadow-lg`}
                  style={{ width: dotSize, height: dotSize }}
                >
                  {locationAlerts.length}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {location}: {locationAlerts.length} alert{locationAlerts.length !== 1 ? 's' : ''}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="absolute bottom-2 left-2 bg-white/90 rounded p-2 text-xs">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>Extreme</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span>Severe</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span>Moderate</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span>Minor</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (Object.keys(locationGroups).length === 0) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Map className="h-5 w-5 text-blue-600" />
            <span>Alert Location Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-muted-foreground">No location data available for mapping</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`mb-4 ${isExpanded ? 'fixed inset-4 z-50 bg-white' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Map className="h-5 w-5 text-blue-600" />
            <CardTitle>Alert Location Map</CardTitle>
            <Badge variant="outline">
              {Object.keys(locationGroups).length} location{Object.keys(locationGroups).length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderLocationDots()}
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Click on location dots to filter alerts. Dot size indicates alert count, color shows highest severity.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertLocationMap;
