
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RequirementsTab from './RequirementsTab';
import TechnicalTab from './TechnicalTab';

const DocumentationTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('requirements');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Documentation & Requirements</h2>
        <p className="text-muted-foreground">System requirements, technical documentation, and guidelines</p>
      </div>
      
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requirements">System Requirements</TabsTrigger>
          <TabsTrigger value="technical">Technical Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requirements" className="space-y-4">
          <RequirementsTab />
        </TabsContent>
        
        <TabsContent value="technical" className="space-y-4">
          <TechnicalTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentationTab;
