
import React from 'react';
import { Accordion } from "@/components/ui/accordion";
import { EnhancedSource } from "@/components/sources/EnhancedSourceCard";
import { SourceFilter } from "@/components/sources/SourceFilters";
import { SourcesStats } from "./SourcesStatistics";
import FeedTestingSection from "./sections/FeedTestingSection";
import OverviewSection from "./sections/OverviewSection";
import FiltersSection from "./sections/FiltersSection";
import ActiveSourcesSection from "./sections/ActiveSourcesSection";
import ConfigurationSection from "./sections/ConfigurationSection";
import AnalyticsSection from "./sections/AnalyticsSection";
import DiagnosticsSection from "./sections/DiagnosticsSection";

interface SourcesAccordionProps {
  sources: EnhancedSource[];
  filteredSources: EnhancedSource[];
  sortedSources: EnhancedSource[];
  stats: SourcesStats;
  openSections: string[];
  onAccordionChange: (value: string[]) => void;
  filters: SourceFilter;
  onFiltersChange: (filters: SourceFilter) => void;
  onClearFilters: () => void;
  sortBy: string;
  sortOrder: string;
  onSortingChange: (sortBy: any, sortOrder: any) => void;
  onConfigure: (source: EnhancedSource) => void;
  onTest: (source: EnhancedSource) => void;
  onRefreshData: () => void;
  onAddSource: () => void;
}

const SourcesAccordion: React.FC<SourcesAccordionProps> = ({
  sources,
  filteredSources,
  sortedSources,
  stats,
  openSections,
  onAccordionChange,
  filters,
  onFiltersChange,
  onClearFilters,
  sortBy,
  sortOrder,
  onSortingChange,
  onConfigure,
  onTest,
  onRefreshData,
  onAddSource
}) => {
  return (
    <Accordion 
      type="multiple" 
      value={openSections} 
      onValueChange={onAccordionChange}
      className="space-y-4"
    >
      <FeedTestingSection />
      
      <OverviewSection 
        sources={sources}
        stats={stats}
      />
      
      <FiltersSection 
        filters={filters}
        onFiltersChange={onFiltersChange}
        onClearFilters={onClearFilters}
      />
      
      <ActiveSourcesSection 
        sortedSources={sortedSources}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortingChange={onSortingChange}
        onConfigure={onConfigure}
        onTest={onTest}
      />
      
      <ConfigurationSection 
        onAddSource={onAddSource}
      />
      
      <AnalyticsSection 
        sources={sources}
        stats={stats}
      />
      
      <DiagnosticsSection 
        stats={stats}
        onRefreshData={onRefreshData}
      />
    </Accordion>
  );
};

export default SourcesAccordion;
