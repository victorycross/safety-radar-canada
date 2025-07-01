
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FeedManagementTab from './FeedManagementTab';
import FeedAuditDashboard from './FeedAuditDashboard';
import RSSFeedAuditTab from './RSSFeedAuditTab';

const DataSourcesTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('management');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Data Sources Management</h2>
        <p className="text-muted-foreground">Configure, monitor, and audit all data feeds and sources</p>
      </div>
      
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="management">Feed Management</TabsTrigger>
          <TabsTrigger value="audit">Feed Audit</TabsTrigger>
          <TabsTrigger value="rss-audit">RSS Audit</TabsTrigger>
        </TabsList>
        
        <TabsContent value="management" className="space-y-4">
          <FeedManagementTab />
        </TabsContent>
        
        <TabsContent value="audit" className="space-y-4">
          <FeedAuditDashboard />
        </TabsContent>
        
        <TabsContent value="rss-audit" className="space-y-4">
          <RSSFeedAuditTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataSourcesTab;
