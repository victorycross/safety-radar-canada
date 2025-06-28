import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertLevel } from '@/types';
import { Circle, Filter } from 'lucide-react';
import { useLocationVisibility } from '@/hooks/useLocationVisibility';
import LocationVisibilitySettings from './LocationVisibilitySettings';

interface InternationalHub {
  id: string;
  name: string;
  country: string;
  flag: string;
  alertLevel: AlertLevel;
  travelWarnings: number;
  localIncidents: number;
  lastUpdate: string;
}

const InternationalHubs = () => {
  const {
    getVisibleInternationalHubsCount,
    getTotalInternationalHubsCount,
    isInternationalHubVisible,
    isFiltered
  } = useLocationVisibility();

  // Mock data for international financial hubs
  const internationalHubs: InternationalHub[] = [
    {
      id: 'nyc',
      name: 'New York',
      country: 'United States',
      flag: '🇺🇸',
      alertLevel: AlertLevel.NORMAL,
      travelWarnings: 0,
      localIncidents: 2,
      lastUpdate: '2024-01-15'
    },
    {
      id: 'london',
      name: 'London',
      country: 'United Kingdom',
      flag: '🇬🇧',
      alertLevel: AlertLevel.WARNING,
      travelWarnings: 1,
      localIncidents: 3,
      lastUpdate: '2024-01-14'
    },
    {
      id: 'hk',
      name: 'Hong Kong',
      country: 'China',
      flag: '🇭🇰',
      alertLevel: AlertLevel.WARNING,
      travelWarnings: 2,
      localIncidents: 1,
      lastUpdate: '2024-01-13'
    },
    {
      id: 'singapore',
      name: 'Singapore',
      country: 'Singapore',
      flag: '🇸🇬',
      alertLevel: AlertLevel.NORMAL,
      travelWarnings: 0,
      localIncidents: 0,
      lastUpdate: '2024-01-15'
    },
    {
      id: 'tokyo',
      name: 'Tokyo',
      country: 'Japan',
      flag: '🇯🇵',
      alertLevel: AlertLevel.NORMAL,
      travelWarnings: 0,
      localIncidents: 1,
      lastUpdate: '2024-01-14'
    },
    {
      id: 'frankfurt',
      name: 'Frankfurt',
      country: 'Germany',
      flag: '🇩🇪',
      alertLevel: AlertLevel.NORMAL,
      travelWarnings: 0,
      localIncidents: 0,
      lastUpdate: '2024-01-15'
    },
    {
      id: 'zurich',
      name: 'Zurich',
      country: 'Switzerland',
      flag: '🇨🇭',
      alertLevel: AlertLevel.NORMAL,
      travelWarnings: 0,
      localIncidents: 0,
      lastUpdate: '2024-01-15'
    },
    {
      id: 'dubai',
      name: 'Dubai',
      country: 'UAE',
      flag: '🇦🇪',
      alertLevel: AlertLevel.WARNING,
      travelWarnings: 1,
      localIncidents: 2,
      lastUpdate: '2024-01-13'
    },
    {
      id: 'sydney',
      name: 'Sydney',
      country: 'Australia',
      flag: '🇦🇺',
      alertLevel: AlertLevel.NORMAL,
      travelWarnings: 0,
      localIncidents: 1,
      lastUpdate: '2024-01-14'
    },
    {
      id: 'toronto-intl',
      name: 'Toronto Financial District',
      country: 'Canada',
      flag: '🇨🇦',
      alertLevel: AlertLevel.NORMAL,
      travelWarnings: 0,
      localIncidents: 0,
      lastUpdate: '2024-01-15'
    }
  ];

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
        return <Badge className="bg-danger text-white text-xs">High Risk</Badge>;
      case AlertLevel.WARNING:
        return <Badge className="bg-warning text-white text-xs">Caution</Badge>;
      case AlertLevel.NORMAL:
        return <Badge className="bg-success text-white text-xs">Safe</Badge>;
      default:
        return <Badge className="bg-muted text-xs">Unknown</Badge>;
    }
  };

  const handleHubClick = (hub: InternationalHub) => {
    // For now, just log the click - in a real app this would navigate to a detailed view
    console.log(`Clicked on ${hub.name}:`, hub);
  };

  const visibleHubs = internationalHubs.filter(hub => isInternationalHubVisible(hub.id));

  const visibleCount = getVisibleInternationalHubsCount();
  const totalCount = getTotalInternationalHubsCount();
  const filtered = isFiltered();

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Major International Financial Hubs</h2>
              {filtered && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Filtered View</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-muted-foreground">Security status for key financial services locations</p>
              <span className="text-sm font-medium">
                Showing {visibleCount} of {totalCount} locations
              </span>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
          {visibleHubs.map((hub) => (
            <div 
              key={hub.id}
              onClick={() => handleHubClick(hub)}
              className={`
                ${getAlertColor(hub.alertLevel)} 
                rounded-lg p-4 transition-all duration-300 ease-in-out 
                hover:scale-105 hover:shadow-lg cursor-pointer
                flex flex-col items-center justify-center space-y-2
                min-h-[140px] group
              `}
              title={`${hub.name}, ${hub.country} - ${hub.travelWarnings} travel warnings, ${hub.localIncidents} local incidents`}
            >
              <div className="text-3xl mb-1">{hub.flag}</div>
              <Circle 
                size={36} 
                className="text-white/80 group-hover:text-white transition-colors duration-200"
              />
              <div className="text-center">
                <div className="text-white font-bold text-sm">
                  {hub.name}
                </div>
                <div className="text-white/90 text-xs">
                  {hub.country}
                </div>
              </div>
              <div className="mt-1">
                {getAlertBadge(hub.alertLevel)}
              </div>
              
              {/* Quick stats */}
              <div className="text-white/80 text-xs text-center mt-1">
                <div>{hub.travelWarnings} warnings</div>
                <div>{hub.localIncidents} incidents</div>
              </div>
            </div>
          ))}
        </div>

        {visibleHubs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No international hubs selected. Use the "Customize View" button to show locations.</p>
          </div>
        )}

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

export default InternationalHubs;
