import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  Database,
  Settings, 
  TrendingUp,
  Search,
  Plus,
  RefreshCw
} from "lucide-react";
import { EnhancedSource } from "@/components/sources/EnhancedSourceCard";
import EnhancedSourceCard from "@/components/sources/EnhancedSourceCard";
import SourceAnalytics from "@/components/sources/SourceAnalytics";
import SourceFilters from "@/components/sources/SourceFilters";
import FeedTestingDashboard from "@/components/ingestion/FeedTestingDashboard";
import { SourceFilter } from "@/hooks/useSourcesState";
import { SourcesStats } from "./SourcesStatistics";

interface SourcesAccordionProps {
  sources: EnhancedSource[];
  filteredSources: EnhancedSource[];
  sortedSources: EnhancedSource[];
  stats: SourcesStats;
  openSections: string[];
  onAccordionChange: (value: string[]) => void;
  filters: SourceFilter;
  onFiltersChange: (filters: Partial<SourceFilter>) => void;
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
      {/* Feed Testing Dashboard */}
      <AccordionItem value="feed-testing" className="border rounded-lg px-6">
        <AccordionTrigger className="text-lg font-semibold">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Feed Testing & Validation
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Phase 1
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <FeedTestingDashboard />
        </AccordionContent>
      </AccordionItem>

      {/* Overview & Statistics */}
      <AccordionItem value="overview" className="border rounded-lg px-6">
        <AccordionTrigger className="text-lg font-semibold">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Source Overview & Statistics
            <Badge variant="outline">{stats.total} sources</Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {stats.healthy} healthy
            </Badge>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <SourceAnalytics sources={sources} />
        </AccordionContent>
      </AccordionItem>

      {/* Filters & Search */}
      <AccordionItem value="filters" className="border rounded-lg px-6">
        <AccordionTrigger className="text-lg font-semibold">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filters & Search
            {(filters.search || 
              filters.verificationStatus.length > 0 || 
              filters.sourceTypes.length > 0 || 
              filters.healthStatus.length > 0 || 
              filters.lastUpdated !== 'all') && (
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

      {/* Active Sources */}
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

      {/* Configuration Management */}
      <AccordionItem value="configuration" className="border rounded-lg px-6">
        <AccordionTrigger className="text-lg font-semibold">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Source Configuration & Management
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Source Management</h3>
                <p className="text-muted-foreground">Add, configure, and manage data sources</p>
              </div>
              <Button onClick={onAddSource}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Source
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={onAddSource}>
                <Database className="h-6 w-6" />
                <span>Database Sources</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={onAddSource}>
                <TrendingUp className="h-6 w-6" />
                <span>API Endpoints</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={onAddSource}>
                <RefreshCw className="h-6 w-6" />
                <span>Polling Services</span>
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Analytics & Data Quality */}
      <AccordionItem value="analytics" className="border rounded-lg px-6">
        <AccordionTrigger className="text-lg font-semibold">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Data Quality & Analytics
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Quality Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span>Data Completeness</span>
                  <Badge variant="secondary">{((stats.healthy / stats.total) * 100).toFixed(1)}%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span>Source Reliability</span>
                  <Badge variant="secondary">{stats.avgUptime.toFixed(1)}%</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span>Update Frequency</span>
                  <Badge variant="secondary">Real-time</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Performance Trends</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span>Avg Response Time</span>
                  <Badge variant="secondary">
                    {sources.length > 0 ? Math.round(sources.reduce((acc, s) => acc + s.responseTime, 0) / sources.length) : 0}ms
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span>Error Rate</span>
                  <Badge variant="secondary">
                    {sources.length > 0 ? (sources.reduce((acc, s) => acc + s.errorRate, 0) / sources.length).toFixed(1) : 0}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span>Uptime SLA</span>
                  <Badge variant="secondary">{stats.avgUptime.toFixed(1)}%</Badge>
                </div>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Diagnostics & Testing */}
      <AccordionItem value="diagnostics" className="border rounded-lg px-6">
        <AccordionTrigger className="text-lg font-semibold">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Integration Testing & Diagnostics
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={onRefreshData}>
                Run Health Check
              </Button>
              <Button variant="outline">
                Test All Connections
              </Button>
              <Button variant="outline">
                View Error Logs
              </Button>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">System Status</h4>
              <div className="text-sm text-muted-foreground">
                {stats.healthy === stats.total ? 
                  `All ${stats.total} systems operational.` : 
                  `${stats.healthy}/${stats.total} systems operational. ${stats.total - stats.healthy} systems need attention.`
                } Last refresh: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default SourcesAccordion;
