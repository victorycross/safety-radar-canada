
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import SourceFilters from "@/components/sources/SourceFilters";
import { SourceFilter } from "@/hooks/useSourcesState";

interface FiltersSectionProps {
  filters: SourceFilter;
  onFiltersChange: (filters: Partial<SourceFilter>) => void;
  onClearFilters: () => void;
}

const FiltersSection: React.FC<FiltersSectionProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const hasActiveFilters = filters.search || 
    filters.verificationStatus.length > 0 || 
    filters.sourceTypes.length > 0 || 
    filters.healthStatus.length > 0 || 
    filters.lastUpdated !== 'all';

  return (
    <AccordionItem value="filters" className="border rounded-lg px-6">
      <AccordionTrigger className="text-lg font-semibold">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Filters & Search
          {hasActiveFilters && (
            <Badge variant="secondary">Active</Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4">
        <SourceFilters 
          filters={filters}
          onFiltersChange={onFiltersChange}
          onClearFilters={onClearFilters}
        />
      </AccordionContent>
    </AccordionItem>
  );
};

export default FiltersSection;
