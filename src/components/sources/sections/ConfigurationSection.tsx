
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Settings, Plus, Database, TrendingUp, RefreshCw } from "lucide-react";

interface ConfigurationSectionProps {
  onAddSource: () => void;
}

const ConfigurationSection: React.FC<ConfigurationSectionProps> = ({ onAddSource }) => {
  return (
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
  );
};

export default ConfigurationSection;
