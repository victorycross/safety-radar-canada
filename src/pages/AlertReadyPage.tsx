
import React, { useState } from 'react';
import AlertsList from '@/components/alert-ready/AlertsList';
import CriticalAlertsSummary from '@/components/alert-ready/CriticalAlertsSummary';
import UnifiedAlertControls from '@/components/alert-ready/UnifiedAlertControls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Filter, X, Settings, RefreshCw, Database, Archive, Shield } from 'lucide-react';
import { useAllAlertSources } from '@/hooks/useAllAlertSources';
import { useEnhancedAlertManagement } from '@/hooks/useEnhancedAlertManagement';
import { unifiedDataProvider } from '@/services/unifiedDataProvider';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import AlertDetailModal from '@/components/alerts/AlertDetailModal';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'react-router-dom';
import LocationContext from '@/components/alert-ready/LocationContext';
import AlertLocationMap from '@/components/alert-ready/AlertLocationMap';
import { useAuth } from '@/components/auth/AuthProvider';
import { Link } from 'react-router-dom';
import DataFreshnessIndicator from '@/components/ui/DataFreshnessIndicator';
import { Switch } from '@/components/ui/switch';

const AlertReadyPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const { isAdmin, user } = useAuth();
  
  const { 
    alerts: allAlerts, 
    loading: allLoading, 
    error: allError, 
    fetchAlerts: fetchAllAlerts,
    triggerIngestion: triggerManualIngestion,
    sources 
  } = useAllAlertSources();
  const { refreshData } = useSupabaseDataContext();

  const {
    enhancedAlerts,
    filteredAlerts,
    alertStats,
    filters,
    updateFilters,
    clearFilters,
    executeAutomatedArchiving,
    isArchiving,
    getAlertDisplayConfig
  } = useEnhancedAlertManagement({
    alerts: allAlerts,
    enableAutomatedArchiving: isAdmin(),
    confidenceConfig: {
      minDisplayThreshold: 0.4, // Show more alerts to regular users
      autoHideBelow: 0.2 // Only hide very low quality data
    }
  });

  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const openAlertDetail = (alert: any) => {
    setSelectedAlert(alert);
    setIsDetailModalOpen(true);
  };

  const closeAlertDetail = () => {
    setSelectedAlert(null);
    setIsDetailModalOpen(false);
  };

  // Handle location filtering
  const handleLocationFilter = (location: string | null) => {
    setSelectedLocation(location);
    if (location) {
      updateFilters({ area: location });
    } else {
      // Clear area filter but keep other filters
      updateFilters({ area: undefined });
    }
  };

  // Handle URL-based filtering for location-specific alerts
  React.useEffect(() => {
    const locationFilter = searchParams.get('location');
    const locationType = searchParams.get('type');
    
    if (locationFilter && locationType) {
      updateFilters({ 
        area: locationFilter
      });
      setSelectedLocation(locationFilter);
    }
  }, [searchParams, updateFilters]);

  const hasActiveFilters = Object.keys(filters).some(key => {
    const value = filters[key as keyof typeof filters];
    return value !== undefined && value !== '' && value !== false;
  });

  // Updated refresh handler to use unified data provider
  const handleRefreshIncidents = async () => {
    console.log('Refreshing unified alert data source...');
    await unifiedDataProvider.forceRefresh();
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
          <div className="flex items-center gap-4 mt-3">
            <DataFreshnessIndicator 
              lastUpdated={new Date()} 
              isProcessing={allLoading}
              hasErrors={!!allError}
            />
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              {alertStats.authoritative} Authoritative
            </Badge>
            <Badge variant="secondary">
              {alertStats.highConfidence} High Confidence
            </Badge>
            {alertStats.requiresVerification > 0 && (
              <Badge variant="destructive">
                {alertStats.requiresVerification} Need Review
              </Badge>
            )}
          </div>
        </div>
        
        {/* Enhanced Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasActiveFilters && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              Filtered ({alertStats.displayed}/{alertStats.total})
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
            value={filters.confidenceLevel || 'all'}
            onValueChange={(value) => updateFilters({ confidenceLevel: value === 'all' ? undefined : value as any })}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Confidence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Confidence</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="very-low">Very Low</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center space-x-2">
            <Switch
              id="authoritative-only"
              checked={filters.showOnlyAuthoritative || false}
              onCheckedChange={(checked) => updateFilters({ showOnlyAuthoritative: checked })}
            />
            <label htmlFor="authoritative-only" className="text-sm font-medium">
              Authoritative Only
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="include-very-low"
              checked={filters.includeVeryLowConfidence || false}
              onCheckedChange={(checked) => updateFilters({ includeVeryLowConfidence: checked })}
            />
            <label htmlFor="include-very-low" className="text-sm font-medium">
              Include Low Quality
            </label>
          </div>

          {/* Manual Ingestion Trigger - Only for admins and power users */}
          {(isAdmin() || user?.app_metadata?.role === 'power_user') && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={triggerManualIngestion}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Trigger Ingestion
            </Button>
          )}

          {/* Automated Archiving - Only for admins */}
          {isAdmin() && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={executeAutomatedArchiving}
              disabled={isArchiving}
              className="flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              {isArchiving ? 'Archiving...' : 'Auto Archive'}
            </Button>
          )}

          {/* Admin Link for Archive Management - Only for admins */}
          {isAdmin() && (
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
        <TabsList className={`grid w-full ${isAdmin() ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="location">Location View</TabsTrigger>
          {/* System Controls tab - Only visible to admins */}
          {isAdmin() && (
            <TabsTrigger value="controls">System Controls</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold">All Alerts</h2>
              <Badge variant="secondary">{sources.length} sources</Badge>
            </div>
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

        {/* System Controls tab - Only rendered for admins */}
        {isAdmin() && (
          <TabsContent value="controls">
            {/* Unified Alert Integration Controls */}
            <UnifiedAlertControls
              alerts={allAlerts}
              onRefreshIncidents={handleRefreshIncidents}
            />
          </TabsContent>
        )}
      </Tabs>

      <AlertDetailModal
        alert={selectedAlert}
        isOpen={isDetailModalOpen}
        onClose={closeAlertDetail}
        onArchive={() => {}} // Placeholder for now
      />
    </div>
  );
};

export default AlertReadyPage;
