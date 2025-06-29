
import React from 'react';
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import FeedTestingDashboard from "@/components/ingestion/FeedTestingDashboard";

const FeedTestingSection: React.FC = () => {
  return (
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
  );
};

export default FeedTestingSection;
