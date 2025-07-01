
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Filter, Globe, AlertTriangle } from 'lucide-react';
import { UniversalAlert } from '@/types/alerts';

interface LocationContextProps {
  alerts: UniversalAlert[];
  onLocationFilter: (location: string | null) => void;
  selectedLocation: string | null;
}

const LocationContext: React.FC<LocationContextProps> = ({
  alerts,
  onLocationFilter,
  selectedLocation
}) => {
  const [showAllLocations, setShowAllLocations] = useState(false);

  // Extract and analyze location data
  const locationData = useMemo(() => {
    const locationMap = new Map<string, {
      count: number;
      severityBreakdown: Record<string, number>;
      mostRecentAlert: UniversalAlert;
    }>();

    alerts.forEach(alert => {
      if (!alert.area) return;
      
      const location = alert.area;
      const existing = locationMap.get(location);
      
      if (existing) {
        existing.count++;
        existing.severityBreakdown[alert.severity] = (existing.severityBreakdown[alert.severity] || 0) + 1;
        if (new Date(alert.published) > new Date(existing.mostRecentAlert.published)) {
          existing.mostRecentAlert = alert;
        }
      } else {
        locationMap.set(location, {
          count: 1,
          severityBreakdown: { [alert.severity]: 1 },
          mostRecentAlert: alert
        });
      }
    });

    return Array.from(locationMap.entries())
      .map(([location, data]) => ({ location, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [alerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Extreme': return 'bg-red-600 text-white';
      case 'Severe': return 'bg-red-500 text-white';
      case 'Moderate': return 'bg-orange-500 text-white';
      case 'Minor': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getHighestSeverity = (severityBreakdown: Record<string, number>) => {
    const severities = ['Extreme', 'Severe', 'Moderate', 'Minor'];
    for (const severity of severities) {
      if (severityBreakdown[severity] > 0) return severity;
    }
    return 'Minor';
  };

  const displayedLocations = showAllLocations ? locationData : locationData.slice(0, 6);

  return (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <CardTitle>Location Context</CardTitle>
            <Badge variant="outline">
              {locationData.length} location{locationData.length !== 1 ? 's' : ''} affected
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={selectedLocation || 'all'}
              onValueChange={(value) => onLocationFilter(value === 'all' ? null : value)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locationData.map(({ location }) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedLocation && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLocationFilter(null)}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {locationData.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-muted-foreground">No location data available for current alerts</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {displayedLocations.map(({ location, count, severityBreakdown, mostRecentAlert }) => {
                const highestSeverity = getHighestSeverity(severityBreakdown);
                const isSelected = selectedLocation === location;
                
                return (
                  <div
                    key={location}
                    className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => onLocationFilter(isSelected ? null : location)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <h4 className="font-medium text-sm truncate">{location}</h4>
                      </div>
                      <Badge className={`text-xs ${getSeverityColor(highestSeverity)}`}>
                        {highestSeverity}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {count} alert{count !== 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Latest: {new Date(mostRecentAlert.published).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {Object.keys(severityBreakdown).length > 1 && (
                      <div className="flex space-x-1 mt-2">
                        {Object.entries(severityBreakdown).map(([severity, severityCount]) => (
                          <Badge
                            key={severity}
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            {severity}: {severityCount}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {locationData.length > 6 && (
              <div className="text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllLocations(!showAllLocations)}
                >
                  {showAllLocations ? 'Show Less' : `Show All ${locationData.length} Locations`}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationContext;
