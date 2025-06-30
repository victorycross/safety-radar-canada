
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AlertLevel } from '@/types';
import { Filter, RefreshCw } from 'lucide-react';
import { useSimpleLocationFilter } from '@/hooks/useSimpleLocationFilter';
import { useNavigate } from 'react-router-dom';
import CompactLocationCard from './CompactLocationCard';
import { InternationalHub } from '@/types/dashboard';

interface InternationalHubsProps {
  hubs: InternationalHub[];
  loading?: boolean;
  onRefresh?: () => void;
}

const InternationalHubs: React.FC<InternationalHubsProps> = ({ 
  hubs, 
  loading = false, 
  onRefresh 
}) => {
  const navigate = useNavigate();
  const hubIds = hubs.map(h => h.id);
  
  const {
    isHubVisible,
    resetFilters,
    visibleHubCount,
    totalHubs,
    hasFilters
  } = useSimpleLocationFilter([], hubIds);

  const handleHubClick = (hub: InternationalHub) => {
    navigate(`/hub/${hub.id}`);
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const visibleHubs = hubs.filter(hub => isHubVisible(hub.id));

  if (loading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle>International Financial Hubs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2 text-muted-foreground">Loading hubs...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              emoji={hub.flagEmoji || '🏢'}
              onClick={() => handleHubClick(hub)}
            />
          ))}
        </div>

        {visibleHubs.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {hasFilters ? 'No international hubs match the current filters.' : 'No international hubs configured.'}
            </p>
            {hasFilters && (
              <button 
                onClick={resetFilters}
                className="text-blue-600 hover:text-blue-800 underline mt-2"
              >
                Show all hubs
              </button>
            )}
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
