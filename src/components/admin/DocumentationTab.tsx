
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RequirementsTab from './RequirementsTab';
import TechnicalTab from './TechnicalTab';
import DatabaseSchemaDocumentation from './DatabaseSchemaDocumentation';
import TemplateDownloader from './TemplateDownloader';
import AIIntegrationTab from './AIIntegrationTab';
import AIOnboardingGuide from './AIOnboardingGuide';
import AISchemaDocumentation from './AISchemaDocumentation';
import UserManagementTab from './UserManagementTab';

const DocumentationTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('requirements');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Documentation & Settings</h2>
        <p className="text-muted-foreground">
          System requirements, technical documentation, user management, database schema, AI integration guides, and data templates
        </p>
      </div>
      
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="technical">Technical Docs</TabsTrigger>
          <TabsTrigger value="database">Database Schema</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="ai-integration">AI Integration</TabsTrigger>
          <TabsTrigger value="ai-onboarding">AI Onboarding</TabsTrigger>
          <TabsTrigger value="ai-schema">AI Schema</TabsTrigger>
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

        <TabsContent value="users" className="space-y-4">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="ai-integration" className="space-y-4">
          <AIIntegrationTab />
        </TabsContent>

        <TabsContent value="ai-onboarding" className="space-y-4">
          <AIOnboardingGuide />
        </TabsContent>

        <TabsContent value="ai-schema" className="space-y-4">
          <AISchemaDocumentation />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplateDownloader />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentationTab;
