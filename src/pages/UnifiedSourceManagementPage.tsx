
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Activity, Plus, Settings, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SourceOverviewTab from '@/components/source-management/SourceOverviewTab';
import ActiveSourcesTab from '@/components/source-management/ActiveSourcesTab';
import AddSourceTab from '@/components/source-management/AddSourceTab';
import SourceConfigurationTab from '@/components/source-management/SourceConfigurationTab';
import SourceMonitoringTab from '@/components/source-management/SourceMonitoringTab';

const UnifiedSourceManagementPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Database className="mr-2" />
            Source Management
          </h1>
          <p className="text-muted-foreground">
            Unified management for all data sources, feeds, and API connections
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="sources" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Active Sources
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Source
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Monitoring
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <SourceOverviewTab />
          </TabsContent>

          <TabsContent value="sources" className="mt-6">
            <ActiveSourcesTab />
          </TabsContent>

          <TabsContent value="add" className="mt-6">
            <AddSourceTab />
          </TabsContent>

          <TabsContent value="config" className="mt-6">
            <SourceConfigurationTab />
          </TabsContent>

          <TabsContent value="monitoring" className="mt-6">
            <SourceMonitoringTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UnifiedSourceManagementPage;
