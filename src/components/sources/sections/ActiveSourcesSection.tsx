
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from "lucide-react";
import { EnhancedSource } from "@/components/sources/EnhancedSourceCard";
import EnhancedSourceCard from "@/components/sources/EnhancedSourceCard";

interface ActiveSourcesSectionProps {
  sortedSources: EnhancedSource[];
  sortBy: string;
  sortOrder: string;
  onSortingChange: (sortBy: any, sortOrder: any) => void;
  onConfigure: (source: EnhancedSource) => void;
  onTest: (source: EnhancedSource) => void;
}

const ActiveSourcesSection: React.FC<ActiveSourcesSectionProps> = ({
  sortedSources,
  sortBy,
  sortOrder,
  onSortingChange,
  onConfigure,
  onTest
}) => {
  return (
    <AccordionItem value="active-sources" className="border rounded-lg px-6">
      <AccordionTrigger className="text-lg font-semibold">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Active Data Sources
          <Badge variant="outline">{sortedSources.length} showing</Badge>
          {sortedSources.filter(s => s.verificationStatus === 'verified').length > 0 && (
            <Badge className="bg-success hover:bg-success/90">
              {sortedSources.filter(s => s.verificationStatus === 'verified').length} verified
            </Badge>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4">
        <div className="space-y-4">
          {/* Sorting Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <Select value={sortBy} onValueChange={(value: any) => onSortingChange(value, sortOrder)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="lastUpdate">Last Update</SelectItem>
                  <SelectItem value="reliability">Reliability</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(value: any) => onSortingChange(sortBy, value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedSources.map((source) => (
              <EnhancedSourceCard 
                key={source.id} 
                source={source}
                onConfigure={() => onConfigure(source)}
                onTest={() => onTest(source)}
              />
            ))}
          </div>

          {sortedSources.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Database className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-lg font-medium">No sources found</p>
              <p className="text-muted-foreground">
                Try adjusting your filters or search criteria
              </p>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default ActiveSourcesSection;
