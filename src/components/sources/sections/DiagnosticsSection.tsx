
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { SourcesStats } from "../SourcesStatistics";

interface DiagnosticsSectionProps {
  stats: SourcesStats;
  onRefreshData: () => void;
}

const DiagnosticsSection: React.FC<DiagnosticsSectionProps> = ({ stats, onRefreshData }) => {
  return (
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
  );
};

export default DiagnosticsSection;
