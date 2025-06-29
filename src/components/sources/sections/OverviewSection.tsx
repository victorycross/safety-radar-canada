
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import SourceAnalytics from "@/components/sources/SourceAnalytics";
import { EnhancedSource } from "@/components/sources/EnhancedSourceCard";
import { SourcesStats } from "../SourcesStatistics";

interface OverviewSectionProps {
  sources: EnhancedSource[];
  stats: SourcesStats;
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ sources, stats }) => {
  return (
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
  );
};

export default OverviewSection;
