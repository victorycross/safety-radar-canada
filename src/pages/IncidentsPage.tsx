
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Expand, Minimize2, RotateCcw, Settings } from 'lucide-react';
import { useIncidentState } from '@/hooks/useIncidentState';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import IncidentFilters from '@/components/incidents/IncidentFilters';
import EnhancedIncidentsList from '@/components/incidents/EnhancedIncidentsList';
import IncidentForm from '@/components/forms/IncidentForm';
import { useSecurity } from '@/context/SecurityContext';
import { VerificationStatus } from '@/types';

const IncidentsPage = () => {
  const { 
    state, 
    updateFilters, 
    clearFilters, 
    updateSorting, 
    updatePagination, 
    toggleAutoRefresh, 
    setRefreshInterval,
    resetToDefault,
    getOpenSections,
    handleAccordionChange,
    expandAll,
    collapseAll 
  } = useIncidentState();
  
  const { incidents, provinces, refreshData } = useSupabaseDataContext();
  const { user } = useSecurity();

  // Filter incidents based on current filters
  const filteredIncidents = React.useMemo(() => {
    let filtered = [...incidents];

    // Search filter
    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      filtered = filtered.filter(incident => 
        incident.title.toLowerCase().includes(searchTerm) ||
        incident.description.toLowerCase().includes(searchTerm)
      );
    }

    // Alert level filter
    if (state.filters.alertLevels.length > 0) {
      filtered = filtered.filter(incident => 
        state.filters.alertLevels.includes(incident.alertLevel)
      );
    }

    // Verification status filter
    if (state.filters.verificationStatuses.length > 0) {
      filtered = filtered.filter(incident => 
        state.filters.verificationStatuses.includes(incident.verificationStatus)
      );
    }

    // Province filter
    if (state.filters.provinces.length > 0) {
      filtered = filtered.filter(incident => 
        state.filters.provinces.includes(incident.provinceId)
      );
    }

    // Source filter
    if (state.filters.sources.length > 0) {
      filtered = filtered.filter(incident => 
        state.filters.sources.includes(incident.source)
      );
    }

    // Date range filters
    if (state.filters.dateFrom) {
      const fromDate = new Date(state.filters.dateFrom);
      filtered = filtered.filter(incident => 
        new Date(incident.timestamp) >= fromDate
      );
    }

    if (state.filters.dateTo) {
      const toDate = new Date(state.filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(incident => 
        new Date(incident.timestamp) <= toDate
      );
    }

    return filtered;
  }, [incidents, state.filters]);

  // Sort incidents
  const sortedIncidents = React.useMemo(() => {
    const sorted = [...filteredIncidents];
    
    sorted.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (state.sortBy) {
        case 'timestamp':
          aValue = new Date(a.timestamp);
          bValue = new Date(b.timestamp);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'alertLevel':
          const alertOrder = { severe: 0, warning: 1, normal: 2 };
          aValue = alertOrder[a.alertLevel as keyof typeof alertOrder];
          bValue = alertOrder[b.alertLevel as keyof typeof alertOrder];
          break;
        case 'province':
          const provinceA = provinces.find(p => p.id === a.provinceId);
          const provinceB = provinces.find(p => p.id === b.provinceId);
          aValue = provinceA?.name.toLowerCase() || '';
          bValue = provinceB?.name.toLowerCase() || '';
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return state.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return state.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [filteredIncidents, state.sortBy, state.sortOrder, provinces]);

  // Paginate incidents
  const paginatedIncidents = React.useMemo(() => {
    const start = (state.currentPage - 1) * state.itemsPerPage;
    const end = start + state.itemsPerPage;
    return sortedIncidents.slice(start, end);
  }, [sortedIncidents, state.currentPage, state.itemsPerPage]);

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = filteredIncidents.length;
    const verified = filteredIncidents.filter(i => i.verificationStatus === VerificationStatus.VERIFIED).length;
    const severe = filteredIncidents.filter(i => i.alertLevel === 'severe').length;
    const warning = filteredIncidents.filter(i => i.alertLevel === 'warning').length;
    
    return { total, verified, severe, warning };
  }, [filteredIncidents]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Incidents</h1>
          <p className="text-muted-foreground">Monitor and manage security incidents</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            <Expand className="h-4 w-4 mr-2" />
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            <Minimize2 className="h-4 w-4 mr-2" />
            Collapse All
          </Button>
          <Button variant="outline" size="sm" onClick={resetToDefault}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      <Accordion 
        type="multiple" 
        value={getOpenSections()} 
        onValueChange={handleAccordionChange}
        className="space-y-4"
      >
        {/* Filters Section */}
        <AccordionItem value="filters" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              Filters & Search
              {(state.filters.search || 
                state.filters.alertLevels.length > 0 || 
                state.filters.verificationStatuses.length > 0 || 
                state.filters.provinces.length > 0 || 
                state.filters.sources.length > 0 || 
                state.filters.dateFrom || 
                state.filters.dateTo) && (
                <Badge variant="secondary">Active</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <IncidentFilters 
              filters={state.filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Incidents List Section */}
        <AccordionItem value="incidents-list" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              Incident Reports
              <Badge variant="outline">{stats.total}</Badge>
              {stats.severe > 0 && <Badge variant="destructive">{stats.severe} Severe</Badge>}
              {stats.warning > 0 && <Badge variant="secondary">{stats.warning} Warning</Badge>}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <EnhancedIncidentsList
              filters={state.filters}
              sortBy={state.sortBy}
              sortOrder={state.sortOrder}
              currentPage={state.currentPage}
              itemsPerPage={state.itemsPerPage}
              autoRefresh={state.autoRefresh}
              onSortChange={updateSorting}
              onPageChange={updatePagination}
              onToggleAutoRefresh={toggleAutoRefresh}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Add Incident Section */}
        {user?.isAuthorized && (
          <AccordionItem value="add-incident" className="border rounded-lg px-6">
            <AccordionTrigger className="text-lg font-semibold">
              Add New Incident
            </AccordionTrigger>
            <AccordionContent className="pt-4">
              <IncidentForm isAuthorized={true} />
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Data Management Section */}
        <AccordionItem value="data-management" className="border rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Data Management
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline">
                  Export CSV
                </Button>
                <Button variant="outline">
                  Export PDF Report
                </Button>
                <Button variant="outline">
                  Bulk Actions
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">Total Incidents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
                  <div className="text-sm text-muted-foreground">Verified</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.severe}</div>
                  <div className="text-sm text-muted-foreground">Severe</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
                  <div className="text-sm text-muted-foreground">Warning</div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default IncidentsPage;
