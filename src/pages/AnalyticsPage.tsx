
import React, { useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useSecurity } from "@/context/SecurityContext";
import { AlertLevel, IncidentSource } from "@/types";
import { useAnalyticsState } from "@/hooks/useAnalyticsState";
import AnalyticsFilters from "@/components/analytics/AnalyticsFilters";
import ExecutiveSummary from "@/components/analytics/ExecutiveSummary";
import EnhancedCharts from "@/components/analytics/EnhancedCharts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ExpandIcon, ShrinkIcon } from "lucide-react";

const AnalyticsPage = () => {
  const { incidents, provinces } = useSecurity();
  const {
    state,
    accordionState,
    updateFilters,
    updateState,
    getOpenSections,
    handleAccordionChange,
    resetFilters,
    exportData
  } = useAnalyticsState();

  // Auto-refresh logic
  useEffect(() => {
    if (!state.autoRefresh) return;

    const interval = setInterval(() => {
      console.log('Auto-refreshing analytics data...');
      // In a real app, this would trigger data refetch
    }, state.filters.refreshInterval);

    return () => clearInterval(interval);
  }, [state.autoRefresh, state.filters.refreshInterval]);

  // Filter incidents based on current filters
  const filteredIncidents = incidents.filter(incident => {
    const incidentDate = new Date(incident.timestamp);
    const { dateRange, alertLevels, sources } = state.filters;
    
    return incidentDate >= dateRange.from && 
           incidentDate <= dateRange.to &&
           alertLevels.includes(incident.alertLevel) &&
           sources.includes(incident.source);
  });

  // Calculate analytics data
  const incidentsByAlertLevel = [
    {
      name: "Severe",
      value: filteredIncidents.filter(i => i.alertLevel === AlertLevel.SEVERE).length,
      color: "#e11d48"
    },
    {
      name: "Warning",
      value: filteredIncidents.filter(i => i.alertLevel === AlertLevel.WARNING).length,
      color: "#f59e0b"
    },
    {
      name: "Normal",
      value: filteredIncidents.filter(i => i.alertLevel === AlertLevel.NORMAL).length,
      color: "#10b981"
    }
  ];
  
  const incidentsBySource = Object.values(IncidentSource).map(source => ({
    name: source,
    value: filteredIncidents.filter(i => i.source === source).length,
    color: "#3b82f6"
  }));
  
  const provincesByAlertLevel = [
    {
      name: "Severe",
      value: provinces.filter(p => p.alertLevel === AlertLevel.SEVERE).length,
      color: "#e11d48"
    },
    {
      name: "Warning",
      value: provinces.filter(p => p.alertLevel === AlertLevel.WARNING).length,
      color: "#f59e0b"
    },
    {
      name: "Normal",
      value: provinces.filter(p => p.alertLevel === AlertLevel.NORMAL).length,
      color: "#10b981"
    }
  ];

  const latestIncident = filteredIncidents.length > 0 
    ? filteredIncidents.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0].title
    : "";

  const expandAll = () => {
    const allSections = ['executive-summary', 'incident-analytics', 'geographic-intelligence', 'source-performance', 'trend-analysis', 'data-quality'];
    handleAccordionChange(allSections);
  };

  const collapseAll = () => {
    handleAccordionChange([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Intelligence Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights for security operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            <ExpandIcon className="mr-1 h-4 w-4" />
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            <ShrinkIcon className="mr-1 h-4 w-4" />
            Collapse All
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <AnalyticsFilters
        filters={state.filters}
        onFiltersChange={updateFilters}
        onReset={resetFilters}
        onExport={exportData}
        autoRefresh={state.autoRefresh}
        onAutoRefreshToggle={() => updateState({ autoRefresh: !state.autoRefresh })}
      />
      
      <Accordion
        type="multiple"
        value={getOpenSections()}
        onValueChange={handleAccordionChange}
        className="space-y-4"
      >
        {/* Executive Summary */}
        <AccordionItem value="executive-summary" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center">
              <span className="font-semibold text-lg">Executive Summary</span>
              <span className="ml-2 text-sm text-muted-foreground">
                Risk assessment and key metrics
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <ExecutiveSummary
              totalIncidents={filteredIncidents.length}
              affectedProvinces={new Set(filteredIncidents.map(i => i.provinceId)).size}
              latestIncident={latestIncident}
              incidentsByAlertLevel={incidentsByAlertLevel}
              provinces={provinces}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Incident Analytics */}
        <AccordionItem value="incident-analytics" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center">
              <span className="font-semibold text-lg">Incident Analytics</span>
              <span className="ml-2 text-sm text-muted-foreground">
                Detailed incident analysis and trends
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <EnhancedCharts
              incidentsByAlertLevel={incidentsByAlertLevel}
              incidentsBySource={incidentsBySource}
              provincesByAlertLevel={provincesByAlertLevel}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Geographic Intelligence */}
        <AccordionItem value="geographic-intelligence" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center">
              <span className="font-semibold text-lg">Geographic Intelligence</span>
              <span className="ml-2 text-sm text-muted-foreground">
                Regional analysis and hotspot identification
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>Geographic intelligence dashboard coming soon...</p>
              <p className="text-sm mt-2">Will include heat maps, regional analysis, and incident clustering</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Source Performance */}
        <AccordionItem value="source-performance" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center">
              <span className="font-semibold text-lg">Source Performance</span>
              <span className="ml-2 text-sm text-muted-foreground">
                Data source reliability and metrics
              </span>
            </div>
          </AccordionContent>
          <AccordionContent className="px-6 pb-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>Source performance analytics coming soon...</p>
              <p className="text-sm mt-2">Will include uptime monitoring, data quality metrics, and alert performance</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Trend Analysis */}
        <AccordionItem value="trend-analysis" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center">
              <span className="font-semibold text-lg">Trend Analysis</span>
              <span className="ml-2 text-sm text-muted-foreground">
                Historical trends and predictions
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>Advanced trend analysis coming soon...</p>
              <p className="text-sm mt-2">Will include predictive analytics, seasonal patterns, and forecasting</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Data Quality & Reporting */}
        <AccordionItem value="data-quality" className="border rounded-lg">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center">
              <span className="font-semibold text-lg">Data Quality & Reporting</span>
              <span className="ml-2 text-sm text-muted-foreground">
                System health and data integrity
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="text-center py-8 text-muted-foreground">
              <p>Data quality monitoring coming soon...</p>
              <p className="text-sm mt-2">Will include data freshness, completeness metrics, and system health indicators</p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AnalyticsPage;
