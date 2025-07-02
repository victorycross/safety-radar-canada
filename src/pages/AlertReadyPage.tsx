
import React, { useState } from 'react';
import AlertsList from '@/components/alert-ready/AlertsList';
import CriticalAlertsSummary from '@/components/alert-ready/CriticalAlertsSummary';
import UnifiedAlertControls from '@/components/alert-ready/UnifiedAlertControls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Filter, X, Settings } from 'lucide-react';
import { useAllAlertSources } from '@/hooks/useAllAlertSources';
import { useAlertManagement } from '@/hooks/useAlertManagement';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import AlertDetailModal from '@/components/alerts/AlertDetailModal';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'react-router-dom';
import LocationContext from '@/components/alert-ready/LocationContext';
import AlertLocationMap from '@/components/alert-ready/AlertLocationMap';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from 'react-router-dom';

const AlertReadyPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const { isPowerUserOrAdmin } = useAuth();
  
  const { alerts: allAlerts, loading: allLoading, error: allError, fetchAlerts: fetchAllAlerts } = useAllAlertSources();
  const { refreshData } = useSupabaseDataContext();

  const {
    filteredAlerts,
    selectedAlert,
    isDetailModalOpen,
    filters,
    openAlertDetail,
    closeAlertDetail,
    updateFilters,
    clearFilters,
    archiveAlert
  } = useAlertManagement(allAlerts);

  // Handle location filtering
  const handleLocationFilter = (location: string | null) => {
    setSelectedLocation(location);
    if (location) {
      updateFilters({ area: location });
    } else {
      // Clear area filter but keep other filters
      const { area, ...otherFilters } = filters;
      updateFilters(otherFilters);
    }
  };

  // Handle URL-based filtering for location-specific alerts
  React.useEffect(() => {
    const locationFilter = searchParams.get('location');
    const locationType = searchParams.get('type');
    
    if (locationFilter && locationType) {
      updateFilters({ 
        area: locationFilter,
        provinceId: locationType === 'province' ? locationFilter : undefined,
        hubId: locationType === 'hub' ? locationFilter : undefined 
      });
      setSelectedLocation(locationFilter);
    }
  }, [searchParams, updateFilters]);

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof typeof filters] !== undefined && filters[key as keyof typeof filters] !== ''
  );

  // Updated refresh handler to properly sync the main data source
  const handleRefreshIncidents = async () => {
    console.log('Refreshing main alert data source...');
    await fetchAllAlerts();
    refreshData(); // Keep this for any other data dependencies
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Alert Ready Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage all active alerts across different sources
          </p>
        </div>
        
        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Filtered
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={clearFilters}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          <Select
            value={filters.severity || 'all'}
            onValueChange={(value) => updateFilters({ severity: value === 'all' ? undefined : value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="Extreme">Extreme</SelectItem>
              <SelectItem value="Severe">Severe</SelectItem>
              <SelectItem value="Moderate">Moderate</SelectItem>
              <SelectItem value="Minor">Minor</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.source || 'all'}
            onValueChange={(value) => updateFilters({ source: value === 'all' ? undefined : value })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="Alert Ready">Alert Ready</SelectItem>
              <SelectItem value="BC Emergency">BC Emergency</SelectItem>
              <SelectItem value="Everbridge">Everbridge</SelectItem>
            </SelectContent>
          </Select>

          {/* Admin Link for Archive Management */}
          {isPowerUserOrAdmin() && (
            <Link to="/admin?tab=archive-management">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Archive Management
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Critical Alerts Summary */}
      <CriticalAlertsSummary 
        alerts={allAlerts} 
        loading={allLoading} 
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="alerts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="location">Location View</TabsTrigger>
          <TabsTrigger value="controls">System Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">All Alerts</h2>
            {filteredAlerts.length > 0 && (
              <Badge variant="secondary">{filteredAlerts.length} alerts</Badge>
            )}
          </div>
          
          <AlertsList 
            alerts={filteredAlerts}
            loading={allLoading}
            error={allError}
            fetchAlerts={fetchAllAlerts}
            activeView="all"
            onAlertClick={openAlertDetail}
          />
        </TabsContent>

        <TabsContent value="location" className="space-y-4">
          {/* Location Context and Mapping */}
          <LocationContext
            alerts={allAlerts}
            onLocationFilter={handleLocationFilter}
            selectedLocation={selectedLocation}
          />

          <AlertLocationMap
            alerts={allAlerts}
            onLocationClick={handleLocationFilter}
            selectedLocation={selectedLocation}
          />
        </TabsContent>

        <TabsContent value="controls">
          {/* Unified Alert Integration Controls */}
          <UnifiedAlertControls
            alerts={allAlerts}
            onRefreshIncidents={handleRefreshIncidents}
          />
        </TabsContent>
      </Tabs>

      <AlertDetailModal
        alert={selectedAlert}
        isOpen={isDetailModalOpen}
        onClose={closeAlertDetail}
        onArchive={archiveAlert}
      />
    </div>
  );
};

export default AlertReadyPage;
