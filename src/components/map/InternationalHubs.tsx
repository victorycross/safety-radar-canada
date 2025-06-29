import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { AlertLevel } from '@/types';
import { Filter, RefreshCw } from 'lucide-react';
import { useSimpleLocationFilter } from '@/hooks/useSimpleLocationFilter';
import { Button } from '../ui/button';
import CompactLocationCard from './CompactLocationCard';

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

  const hubIds = internationalHubs.map(h => h.id);
  
  const {
    isHubVisible,
    resetFilters,
    visibleHubCount,
    totalHubs,
    hasFilters
  } = useSimpleLocationFilter([], hubIds);

  const handleHubClick = (hub: InternationalHub) => {
    console.log(`Clicked on ${hub.name}:`, hub);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const visibleHubs = internationalHubs.filter(hub => isHubVisible(hub.id));

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">International Financial Hubs</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                className="gap-1 h-8"
                title="Refresh view"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              {hasFilters && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Filter className="h-4 w-4" />
                  <span>Filtered</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1">
              <p className="text-sm text-muted-foreground">Security status for key financial services locations</p>
              <span className="text-sm font-medium">
                Showing {visibleHubCount} of {totalHubs} locations
              </span>
            </div>
          </div>
          {hasFilters && (
            <button 
              onClick={resetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Clear Filters
            </button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-6">
          {visibleHubs.map((hub) => (
            <CompactLocationCard
              key={hub.id}
              id={hub.id}
              name={hub.name}
              country={hub.country}
              alertLevel={hub.alertLevel}
              travelWarnings={hub.travelWarnings}
              localIncidents={hub.localIncidents}
              emoji={hub.flag}
              onClick={() => handleHubClick(hub)}
            />
          ))}
        </div>

        {visibleHubs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No international hubs match the current filters.</p>
            <button 
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 underline mt-2"
            >
              Show all hubs
            </button>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Safe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm">Caution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">High Risk</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InternationalHubs;
