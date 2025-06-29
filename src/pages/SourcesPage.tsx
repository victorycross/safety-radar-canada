
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useSourcesState } from "@/hooks/useSourcesState";
import { useToast } from "@/hooks/use-toast";
import SourcesPageHeader from "@/components/sources/SourcesPageHeader";
import SourcesDataProvider from "@/components/sources/SourcesDataProvider";
import SourcesAccordion from "@/components/sources/SourcesAccordion";
import { useSourcesStatistics } from "@/components/sources/SourcesStatistics";

const SourcesPage = () => {
  const { toast } = useToast();
  const { 
    state, 
    updateFilters, 
    clearFilters, 
    updateSorting, 
    toggleAutoRefresh, 
    getOpenSections,
    handleAccordionChange,
    expandAll,
    collapseAll,
    resetToDefault
  } = useSourcesState();

  const handleConfigure = (sourceId: string) => {
    console.log('Configure source:', sourceId);
    toast({
      title: 'Configuration',
      description: `Opening configuration for source: ${sourceId}`,
    });
  };

  const handleTest = (sourceId: string) => {
    console.log('Test source:', sourceId);
    toast({
      title: 'Testing Connection',
      description: `Testing connection for source: ${sourceId}`,
    });
  };

  return (
    <SourcesDataProvider 
      autoRefresh={state.autoRefresh} 
      refreshInterval={state.refreshInterval}
    >
      {({ sources, loading, error, refreshData }) => {
        const stats = useSourcesStatistics(sources);

        // Filter sources based on current filters
        const filteredSources = React.useMemo(() => {
          let filtered = [...sources];

          if (state.filters.search) {
            const searchTerm = state.filters.search.toLowerCase();
            filtered = filtered.filter(source => 
              source.name.toLowerCase().includes(searchTerm) ||
              source.description.toLowerCase().includes(searchTerm) ||
              source.type.toLowerCase().includes(searchTerm)
            );
          }

          if (state.filters.verificationStatus.length > 0) {
            filtered = filtered.filter(source => 
              state.filters.verificationStatus.includes(source.verificationStatus)
            );
          }

          if (state.filters.sourceTypes.length > 0) {
            filtered = filtered.filter(source => 
              state.filters.sourceTypes.includes(source.type)
            );
          }

          if (state.filters.healthStatus.length > 0) {
            filtered = filtered.filter(source => 
              state.filters.healthStatus.includes(source.healthStatus)
            );
          }

          return filtered;
        }, [sources, state.filters]);

        // Sort sources
        const sortedSources = React.useMemo(() => {
          const sorted = [...filteredSources];
          
          sorted.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (state.sortBy) {
              case 'name':
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
                break;
              case 'lastUpdate':
                aValue = a.lastUpdate;
                bValue = b.lastUpdate;
                break;
              case 'reliability':
                aValue = a.reliabilityScore;
                bValue = b.reliabilityScore;
                break;
              case 'type':
                aValue = a.type.toLowerCase();
                bValue = b.type.toLowerCase();
                break;
              default:
                return 0;
            }
            
            if (aValue < bValue) return state.sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return state.sortOrder === 'asc' ? 1 : -1;
            return 0;
          });
          
          return sorted;
        }, [filteredSources, state.sortBy, state.sortOrder]);

        if (loading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Loading data sources...</p>
              </div>
            </div>
          );
        }

        if (error) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <p className="text-red-600 mb-4">Error loading data sources: {error}</p>
                <Button onClick={refreshData}>Retry</Button>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <SourcesPageHeader
              autoRefresh={state.autoRefresh}
              onToggleAutoRefresh={toggleAutoRefresh}
              onExpandAll={expandAll}
              onCollapseAll={collapseAll}
              onReset={resetToDefault}
            />

            <SourcesAccordion
              sources={sources}
              filteredSources={filteredSources}
              sortedSources={sortedSources}
              stats={stats}
              openSections={getOpenSections()}
              onAccordionChange={handleAccordionChange}
              filters={state.filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
              sortBy={state.sortBy}
              sortOrder={state.sortOrder}
              onSortingChange={updateSorting}
              onConfigure={handleConfigure}
              onTest={handleTest}
              onRefreshData={refreshData}
            />
          </div>
        );
      }}
    </SourcesDataProvider>
  );
};

export default SourcesPage;
