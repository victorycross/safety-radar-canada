
import React, { useState } from 'react';
import AlertsList from '@/components/alert-ready/AlertsList';
import BCAlertslist from '@/components/alert-ready/BCAlertslist';
import EverbridgeAlertsList from '@/components/alert-ready/EverbridgeAlertsList';
import CriticalAlertsSummary from '@/components/alert-ready/CriticalAlertsSummary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Filter, X } from 'lucide-react';
import { useAllAlertSources } from '@/hooks/useAllAlertSources';
import { useBCAlerts } from '@/hooks/useBCAlerts';
import { useEverbridgeAlerts } from '@/hooks/useEverbridgeAlerts';
import { useAlertManagement } from '@/hooks/useAlertManagement';
import AlertDetailModal from '@/components/alerts/AlertDetailModal';
import { Badge } from '@/components/ui/badge';
import { useSearchParams } from 'react-router-dom';

const AlertReadyPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all-alerts');
  
  const { alerts: allAlerts, loading: allLoading, error: allError, fetchAlerts: fetchAllAlerts } = useAllAlertSources();
  const { alerts: bcAlerts, loading: bcLoading, error: bcError, fetchAlerts: fetchBCAlerts } = useBCAlerts();
  const { alerts: everbridgeAlerts, loading: everbridgeLoading, error: everbridgeError, fetchAlerts: fetchEverbridgeAlerts } = useEverbridgeAlerts();

  // Use alert management hook for the current tab's alerts
  const getCurrentAlerts = () => {
    switch (activeTab) {
      case 'bc-alerts': return bcAlerts;
      case 'everbridge': return everbridgeAlerts;
      default: return allAlerts;
    }
  };

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
  } = useAlertManagement(getCurrentAlerts());

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
    }
  }, [searchParams, updateFilters]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Clear location-specific filters when switching tabs
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('location');
    newSearchParams.delete('type');
    setSearchParams(newSearchParams);
    clearFilters();
  };

  const hasActiveFilters = Object.keys(filters).some(key => 
    filters[key as keyof typeof filters] !== undefined && filters[key as keyof typeof filters] !== ''
  );

  // Get current loading state based on active tab
  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'bc-alerts': return bcLoading;
      case 'everbridge': return everbridgeLoading;
      default: return allLoading;
    }
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
        </div>
      </div>

      {/* Critical Alerts Summary - Always shows all alerts for overview */}
      <CriticalAlertsSummary 
        alerts={allAlerts} 
        loading={allLoading} 
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-alerts">
            All Alerts
            {activeTab === 'all-alerts' && filteredAlerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">{filteredAlerts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="bc-alerts">
            BC Alerts
            {activeTab === 'bc-alerts' && filteredAlerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">{filteredAlerts.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="everbridge">
            Everbridge
            {activeTab === 'everbridge' && filteredAlerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">{filteredAlerts.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all-alerts" className="space-y-4">
          <AlertsList 
            alerts={filteredAlerts}
            loading={allLoading}
            error={allError}
            fetchAlerts={fetchAllAlerts}
            activeView="all"
            onAlertClick={openAlertDetail}
          />
        </TabsContent>
        
        <TabsContent value="bc-alerts" className="space-y-4">
          <BCAlertslist 
            alerts={filteredAlerts}
            loading={bcLoading}
            error={bcError}
            fetchAlerts={fetchBCAlerts}
            onAlertClick={openAlertDetail}
          />
        </TabsContent>
        
        <TabsContent value="everbridge" className="space-y-4">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Everbridge Integration
              </CardTitle>
              <CardDescription>
                Everbridge alerts will appear here once the integration is configured with real API credentials.
              </CardDescription>
            </CardHeader>
          </Card>
          <EverbridgeAlertsList 
            alerts={filteredAlerts}
            loading={everbridgeLoading}
            error={everbridgeError}
            fetchAlerts={fetchEverbridgeAlerts}
            onAlertClick={openAlertDetail}
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
