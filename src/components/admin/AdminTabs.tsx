
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OverviewTab from './OverviewTab';
import RequirementsTab from './RequirementsTab';
import TechnicalTab from './TechnicalTab';
import EmployeeManagementTab from './EmployeeManagementTab';
import FeedManagementTab from './FeedManagementTab';

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const AdminTabs = ({ activeTab, onTabChange }: AdminTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="employees">Employee Data</TabsTrigger>
        <TabsTrigger value="feeds">Feed Management</TabsTrigger>
        <TabsTrigger value="requirements">Business Requirements</TabsTrigger>
        <TabsTrigger value="technical">Technical Specs</TabsTrigger>
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
