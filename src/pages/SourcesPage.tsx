
import React, { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Expand, 
  Minimize2, 
  RotateCcw, 
  Settings, 
  RefreshCw, 
  Plus,
  Database,
  Activity,
  TrendingUp,
  Search
} from "lucide-react";
import { IncidentSource, VerificationStatus } from "@/types";
import { useSourcesState } from "@/hooks/useSourcesState";
import SourceFilters from "@/components/sources/SourceFilters";
import EnhancedSourceCard, { EnhancedSource } from "@/components/sources/EnhancedSourceCard";
import SourceAnalytics from "@/components/sources/SourceAnalytics";

const SourcesPage = () => {
  const { 
    state, 
    updateFilters, 
    clearFilters, 
    updateSorting, 
    toggleAutoRefresh, 
    setRefreshInterval,
    getOpenSections,
    handleAccordionChange,
    expandAll,
    collapseAll,
    resetToDefault
  } = useSourcesState();

  // Enhanced sources data with mock analytics
  const [sources] = useState<EnhancedSource[]>([
    {
      id: "alert-ready",
      name: "Alert Ready",
      description: "Canada's National Public Alerting System for emergency notifications",
      type: "police",
      verificationStatus: VerificationStatus.VERIFIED,
      lastUpdate: "real-time",
      route: "/alert-ready",
      healthStatus: "healthy",
      uptime: 99.8,
      dataVolume: 1250,
      responseTime: 145,
      errorRate: 0.2,
      reliabilityScore: 98
    },
    {
      id: "everbridge",
      name: "Everbridge Alerts",
      description: "Emergency notifications from Everbridge critical event management platform",
      type: "everbridge",
      verificationStatus: VerificationStatus.VERIFIED,
      lastUpdate: "real-time",
      route: "/alert-ready",
      healthStatus: "healthy",
      uptime: 99.5,
      dataVolume: 890,
      responseTime: 178,
      errorRate: 0.5,
      reliabilityScore: 96
    },
    {
      id: "police",
      name: "Police Reports",
      description: "Official reports from local and provincial police forces across Canada",
      type: "police",
      verificationStatus: VerificationStatus.VERIFIED,
      lastUpdate: "10 minutes ago",
      healthStatus: "degraded",
      uptime: 95.2,
      dataVolume: 2100,
      responseTime: 320,
      errorRate: 4.8,
      reliabilityScore: 88
    },
    {
      id: "global-security",
      name: "Global Security",
      description: "Internal security monitoring and reporting from corporate security team",
      type: "global_security",
      verificationStatus: VerificationStatus.VERIFIED,
      lastUpdate: "5 minutes ago",
      healthStatus: "healthy",
      uptime: 99.9,
      dataVolume: 1840,
      responseTime: 98,
      errorRate: 0.1,
      reliabilityScore: 99
    },
    {
      id: "us-soc",
      name: "US Security Operations Centre",
      description: "Intelligence from US-based security operations center",
      type: "us_soc",
      verificationStatus: VerificationStatus.VERIFIED,
      lastUpdate: "15 minutes ago",
      healthStatus: "healthy",
      uptime: 98.7,
      dataVolume: 1560,
      responseTime: 205,
      errorRate: 1.3,
      reliabilityScore: 94
    },
    {
      id: "news",
      name: "News Aggregator",
      description: "Selected news sources covering relevant security events",
      type: "news",
      verificationStatus: VerificationStatus.UNVERIFIED,
      lastUpdate: "3 minutes ago",
      healthStatus: "error",
      uptime: 87.4,
      dataVolume: 5600,
      responseTime: 890,
      errorRate: 12.6,
      reliabilityScore: 72
    },
    {
      id: "crowdsourced",
      name: "Crowdsourced Reports",
      description: "Aggregated data from social media and public reporting platforms",
      type: "crowdsourced",
      verificationStatus: VerificationStatus.UNVERIFIED,
      lastUpdate: "1 minute ago",
      healthStatus: "degraded",
      uptime: 92.1,
      dataVolume: 8900,
      responseTime: 445,
      errorRate: 7.9,
      reliabilityScore: 78
    }
  ]);

  // Auto-refresh logic
  useEffect(() => {
    if (!state.autoRefresh) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing sources data...');
      // Here you would typically refetch data
    }, state.refreshInterval);

    return () => clearInterval(interval);
  }, [state.autoRefresh, state.refreshInterval]);

  // Filter sources based on current filters
  const filteredSources = React.useMemo(() => {
    let filtered = [...sources];

    // Search filter
    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      filtered = filtered.filter(source => 
        source.name.toLowerCase().includes(searchTerm) ||
        source.description.toLowerCase().includes(searchTerm) ||
        source.type.toLowerCase().includes(searchTerm)
      );
    }

    // Verification status filter
    if (state.filters.verificationStatus.length > 0) {
      filtered = filtered.filter(source => 
        state.filters.verificationStatus.includes(source.verificationStatus)
      );
    }

    // Source type filter
    if (state.filters.sourceTypes.length > 0) {
      filtered = filtered.filter(source => 
        state.filters.sourceTypes.includes(source.type)
      );
    }

    // Health status filter
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
          // Simple sorting - in real app you'd parse the date strings
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

  const handleConfigure = (sourceId: string) => {
    console.log('Configure source:', sourceId);
    // Open configuration modal/panel
  };

  const handleTest = (sourceId: string) => {
    console.log('Test source:', sourceId);
    // Run connection test
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    const total = sources.length;
    const healthy = sources.filter(s => s.healthStatus === 'healthy').length;
    const verified = sources.filter(s => s.verificationStatus === 'verified').length;
    const avgUptime = sources.reduce((acc, s) => acc + s.uptime, 0) / total || 0;
    
    return { total, healthy, verified, avgUptime };
  }, [sources]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">External Sources</h1>
          <p className="text-muted-foreground">
            Monitor and manage connected information sources feeding the security dashboard
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={state.autoRefresh ? "default" : "outline"} 
            size="sm" 
            onClick={toggleAutoRefresh}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${state.autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh
          </Button>
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
              {(state.filters.search || 
                state.filters.verificationStatus.length > 0 || 
                state.filters.sourceTypes.length > 0 || 
                state.filters.healthStatus.length > 0 || 
                state.filters.lastUpdated !== 'all') && (
                <Badge variant="secondary">Active</Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <SourceFilters 
              filters={state.filters}
              onFiltersChange={updateFilters}
              onClearFilters={clearFilters}
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
                  <Select value={state.sortBy} onValueChange={(value: any) => updateSorting(value, state.sortOrder)}>
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
                  <Select value={state.sortOrder} onValueChange={(value: any) => updateSorting(state.sortBy, value)}>
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
                    onConfigure={handleConfigure}
                    onTest={handleTest}
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
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Source
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Database className="h-6 w-6" />
                  <span>Database Sources</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>API Endpoints</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
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
                    <Badge variant="secondary">94.2%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Source Reliability</span>
                    <Badge variant="secondary">91.8%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Update Frequency</span>
                    <Badge variant="secondary">98.5%</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Performance Trends</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Avg Response Time</span>
                    <Badge variant="secondary">247ms</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Error Rate</span>
                    <Badge variant="secondary">3.2%</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Uptime SLA</span>
                    <Badge variant="secondary">99.1%</Badge>
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
                <Button variant="outline">
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
                  All systems operational. Last full diagnostic: 2 hours ago
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default SourcesPage;
