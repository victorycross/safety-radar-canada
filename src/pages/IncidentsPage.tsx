
import React, { useEffect } from 'react';
import IncidentForm from '@/components/forms/IncidentForm';
import IncidentFilters from '@/components/incidents/IncidentFilters';
import EnhancedIncidentsList from '@/components/incidents/EnhancedIncidentsList';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Expand, Minimize2, RotateCcw, FileText, Filter, Plus, Settings2, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useIncidentState } from '@/hooks/useIncidentState';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';

const IncidentsPage = () => {
  const { incidents, loading } = useSupabaseDataContext();
  const {
    state,
    updateFilters,
    clearFilters,
    updateSorting,
    updatePagination,
    toggleAutoRefresh,
    getOpenSections,
    handleAccordionChange,
    expandAll,
    collapseAll,
    resetToDefault
  } = useIncidentState();

  // Auto-refresh functionality
  useEffect(() => {
    if (!state.autoRefresh) return;

    const interval = setInterval(() => {
      // Auto refresh would be handled by the enhanced list component
    }, state.refreshInterval);

    return () => clearInterval(interval);
  }, [state.autoRefresh, state.refreshInterval]);

  // Calculate statistics
  const totalIncidents = incidents.length;
  const verifiedIncidents = incidents.filter(i => i.verificationStatus === 'verified').length;
  const severeIncidents = incidents.filter(i => i.alertLevel === 'severe').length;
  const recentIncidents = incidents.filter(i => {
    const incidentDate = new Date(i.timestamp);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return incidentDate > oneDayAgo;
  }).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Incident Reports</h1>
          <p className="text-muted-foreground">
            View, filter, and manage security incidents across all locations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={expandAll}
              className="flex items-center gap-1"
            >
              <Expand className="h-4 w-4" />
              Expand All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={collapseAll}
              className="flex items-center gap-1"
            >
              <Minimize2 className="h-4 w-4" />
              Collapse All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetToDefault}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalIncidents}</div>
            <p className="text-xs text-muted-foreground">All time reports</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent (24h)</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentIncidents}</div>
            <p className="text-xs text-muted-foreground">Past 24 hours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedIncidents}</div>
            <p className="text-xs text-muted-foreground">Verified reports</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Severe Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{severeIncidents}</div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>
      </div>

      <Accordion 
        type="multiple" 
        value={getOpenSections()} 
        onValueChange={handleAccordionChange}
        className="space-y-4"
      >
        {/* Filters Section */}
        <AccordionItem value="filters" className="border-0">
          <AccordionTrigger className="hover:no-underline p-0 pb-4">
            <div className="flex items-center justify-between w-full">
              <div className="text-left">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Search & Filters
                </h2>
                <p className="text-sm text-muted-foreground">
                  Filter incidents by criteria, date range, and search terms
                </p>
              </div>
              {(state.filters.search || 
                state.filters.alertLevels.length > 0 || 
                state.filters.verificationStatuses.length > 0 ||
                state.filters.provinces.length > 0 ||
                state.filters.sources.length > 0 ||
                state.filters.dateFrom ||
                state.filters.dateTo) && (
                <Badge variant="secondary" className="ml-2">
                  Active
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter Incidents</CardTitle>
                <CardDescription>
                  Use the filters below to narrow down the incident reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IncidentFilters
                  filters={state.filters}
                  onFiltersChange={updateFilters}
                  onClearFilters={clearFilters}
                />
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Incidents List Section */}
        <AccordionItem value="incidents-list" className="border-0">
          <AccordionTrigger className="hover:no-underline p-0 pb-4">
            <div className="text-left">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Incident Reports
              </h2>
              <p className="text-sm text-muted-foreground">
                Browse and manage all incident reports ({totalIncidents} total)
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <EnhancedIncidentsList
              filters={state.filters}
              sortBy={state.sortBy}
              sortOrder={state.sortOrder}
              currentPage={state.currentPage}
              itemsPerPage={state.itemsPerPage}
              onSortChange={updateSorting}
              onPageChange={updatePagination}
              autoRefresh={state.autoRefresh}
              onToggleAutoRefresh={toggleAutoRefresh}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Add Incident Section */}
        <AccordionItem value="add-incident" className="border-0">
          <AccordionTrigger className="hover:no-underline p-0 pb-4">
            <div className="text-left">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Report New Incident
              </h2>
              <p className="text-sm text-muted-foreground">
                Submit a new incident report (authorized users only)
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <div className="max-w-2xl">
              <IncidentForm isAuthorized={true} />
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Data Management Section */}
        <AccordionItem value="data-management" className="border-0">
          <AccordionTrigger className="hover:no-underline p-0 pb-4">
            <div className="text-left">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Settings2 className="h-5 w-5" />
                Data Management
              </h2>
              <p className="text-sm text-muted-foreground">
                Export data, manage settings, and bulk operations
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Management Options</CardTitle>
                <CardDescription>
                  Export data and manage incident reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Auto-refresh Settings</h4>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={state.autoRefresh ? "default" : "outline"}
                        size="sm"
                        onClick={toggleAutoRefresh}
                      >
                        {state.autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
                      </Button>
                      {state.autoRefresh && (
                        <Badge variant="secondary">
                          Every {state.refreshInterval / 1000}s
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Quick Actions</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        Clear All Filters
                      </Button>
                      <Button variant="outline" size="sm" onClick={resetToDefault}>
                        Reset All Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default IncidentsPage;
