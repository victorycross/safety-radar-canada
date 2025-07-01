
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RequirementsTab from './RequirementsTab';
import TechnicalTab from './TechnicalTab';
import DatabaseSchemaDocumentation from './DatabaseSchemaDocumentation';
import TemplateDownloader from './TemplateDownloader';

const DocumentationTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('requirements');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Documentation & Requirements</h2>
        <p className="text-muted-foreground">
          System requirements, technical documentation, database schema, and data templates
        </p>
      </div>
      
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="technical">Technical Docs</TabsTrigger>
          <TabsTrigger value="database">Database Schema</TabsTrigger>
          <TabsTrigger value="templates">Data Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="requirements" className="space-y-4">
          <RequirementsTab />
        </TabsContent>
        
        <TabsContent value="technical" className="space-y-4">
          <TechnicalTab />
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <DatabaseSchemaDocumentation />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplateDownloader />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentationTab;
