
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, AlertTriangle, MapPin, Grid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useHubData } from '@/hooks/useHubData';
import { useHubSearch } from '@/hooks/useHubSearch';
import { useHubFilters, HubFilterState } from '@/hooks/useHubFilters';
import { AlertLevel } from '@/types';
import { logger } from '@/utils/logger';
import HubBreadcrumb from '@/components/hub/HubBreadcrumb';
import HubSearch from '@/components/hub/HubSearch';
import HubFilters from '@/components/hub/HubFilters';
import HubQuickActions from '@/components/hub/HubQuickActions';

const HubsPage = () => {
  const { hubs, loading, metrics, refreshData, updateAlertLevel } = useHubData();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Apply search functionality
  const { searchTerm, setSearchTerm, filteredHubs: searchFilteredHubs } = useHubSearch(hubs);
  
  // Apply filters and sorting
  const { filters, setFilters, filteredHubs } = useHubFilters(searchFilteredHubs);

  logger.debug('HubsPage: Rendering', { 
    hubsCount: hubs.length, 
    filteredCount: filteredHubs.length,
    searchTerm,
    filters 
  });

  const getAlertLevelColor = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.SEVERE:
        return 'bg-red-500';
      case AlertLevel.WARNING:
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const getAlertLevelText = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.SEVERE:
        return 'High Risk';
      case AlertLevel.WARNING:
        return 'Caution';
      default:
        return 'Safe';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading international hubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
          <HubBreadcrumb />
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">International Hubs</h1>
              <p className="text-gray-600 mt-1">Monitor security status for global financial centers</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={refreshData} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Hubs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <span className="text-2xl font-bold">{metrics.totalHubs}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Alert Hubs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="text-2xl font-bold">{metrics.alertHubsCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold">{metrics.hubEmployeesCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Incidents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span className="text-2xl font-bold">{metrics.totalIncidents}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <HubSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          <HubFilters
            filters={filters}
            onFiltersChange={setFilters}
            totalHubs={hubs.length}
            filteredCount={filteredHubs.length}
          />
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredHubs.length} of {hubs.length} hubs
            {searchTerm && ` for "${searchTerm}"`}
          </span>
        </div>

        {/* Hubs Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHubs.map((hub) => (
              <Card key={hub.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{hub.flagEmoji}</span>
                      <div>
                        <CardTitle className="text-lg">{hub.name}</CardTitle>
                        <p className="text-sm text-gray-600">{hub.country}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{hub.employeeCount}</div>
                      <div className="text-xs text-gray-600">Employees</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{hub.travelWarnings}</div>
                      <div className="text-xs text-gray-600">Warnings</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{hub.localIncidents}</div>
                      <div className="text-xs text-gray-600">Incidents</div>
                    </div>
                  </div>
                  
                  <HubQuickActions
                    hub={hub}
                    onRefresh={refreshData}
                    onUpdateAlertLevel={updateAlertLevel}
                  />
                  
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Code: {hub.code}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHubs.map((hub) => (
              <Card key={hub.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{hub.flagEmoji}</span>
                      <div>
                        <h3 className="font-semibold text-lg">{hub.name}</h3>
                        <p className="text-sm text-gray-600">{hub.country} • {hub.code}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{hub.employeeCount}</div>
                        <div className="text-xs text-gray-600">Employees</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">{hub.travelWarnings}</div>
                        <div className="text-xs text-gray-600">Warnings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">{hub.localIncidents}</div>
                        <div className="text-xs text-gray-600">Incidents</div>
                      </div>
                      
                      <HubQuickActions
                        hub={hub}
                        onRefresh={refreshData}
                        onUpdateAlertLevel={updateAlertLevel}
                        compact={true}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredHubs.length === 0 && hubs.length > 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Hubs Found</h3>
            <p className="text-gray-600">
              {searchTerm 
                ? `No hubs match your search for "${searchTerm}"`
                : "No hubs match your current filters"
              }
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  alertLevel: 'all',
                  status: 'all',
                  sortBy: 'name',
                  sortOrder: 'asc'
                });
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}

        {hubs.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No International Hubs</h3>
            <p className="text-gray-600">No international hubs are currently configured.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HubsPage;
