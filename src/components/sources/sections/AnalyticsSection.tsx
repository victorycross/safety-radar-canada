
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { EnhancedSource } from "@/components/sources/EnhancedSourceCard";
import { SourcesStats } from "../SourcesStatistics";

interface AnalyticsSectionProps {
  sources: EnhancedSource[];
  stats: SourcesStats;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ sources, stats }) => {
  return (
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
  );
};

export default AnalyticsSection;
