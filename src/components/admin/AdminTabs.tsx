
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from './OverviewTab';
import EmployeeManagementTab from './EmployeeManagementTab';
import FeedManagementTab from './FeedManagementTab';
import RSSFeedAuditTab from './RSSFeedAuditTab';
import RequirementsTab from './RequirementsTab';
import TechnicalTab from './TechnicalTab';
import FeedAuditDashboard from './FeedAuditDashboard';
import DataPipelineDiagnostics from './DataPipelineDiagnostics';
import WeatherAlertsTab from './WeatherAlertsTab';

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-9">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="employees">Employees</TabsTrigger>
        <TabsTrigger value="feeds">Feed Management</TabsTrigger>
        <TabsTrigger value="feed-audit">Feed Audit</TabsTrigger>
        <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        <TabsTrigger value="weather-alerts">Weather Alerts</TabsTrigger>
        <TabsTrigger value="rss-audit">RSS Audit</TabsTrigger>
        <TabsTrigger value="requirements">Requirements</TabsTrigger>
        <TabsTrigger value="technical">Technical</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-4">
        <OverviewTab />
      </TabsContent>
      
      <TabsContent value="employees" className="space-y-4">
        <EmployeeManagementTab />
      </TabsContent>
      
      <TabsContent value="feeds" className="space-y-4">
        <FeedManagementTab />
      </TabsContent>

      <TabsContent value="feed-audit" className="space-y-4">
        <FeedAuditDashboard />
      </TabsContent>

      <TabsContent value="pipeline" className="space-y-4">
        <DataPipelineDiagnostics />
      </TabsContent>

      <TabsContent value="weather-alerts" className="space-y-4">
        <WeatherAlertsTab />
      </TabsContent>

      <TabsContent value="rss-audit" className="space-y-4">
        <RSSFeedAuditTab />
      </TabsContent>
      
      <TabsContent value="requirements" className="space-y-4">
        <RequirementsTab />
      </TabsContent>
      
      <TabsContent value="technical" className="space-y-4">
        <TechnicalTab />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
