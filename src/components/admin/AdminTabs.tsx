
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import OperationsTab from './OperationsTab';
import DataManagementTab from './DataManagementTab';
import SystemHealthTab from './SystemHealthTab';
import SettingsDocumentationTab from './SettingsDocumentationTab';
import ArchiveManagementTab from './ArchiveManagementTab';
import UserManagementTab from './UserManagementTab';
import StaffReportReviewsTab from './StaffReportReviewsTab';

interface AdminTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminTabs = ({ activeTab, onTabChange }: AdminTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="operations">Operations</TabsTrigger>
        <TabsTrigger value="staff-reviews">Staff Reviews</TabsTrigger>
        <TabsTrigger value="data-management">Data Management</TabsTrigger>
        <TabsTrigger value="system-health">System Health</TabsTrigger>
        <TabsTrigger value="archive-management">Archive Management</TabsTrigger>
        <TabsTrigger value="user-management">User Management</TabsTrigger>
        <TabsTrigger value="documentation">Settings & Documentation</TabsTrigger>
      </TabsList>
      
      <TabsContent value="operations" className="space-y-4">
        <OperationsTab />
      </TabsContent>
      
      <TabsContent value="staff-reviews" className="space-y-4">
        <StaffReportReviewsTab />
      </TabsContent>
      
      <TabsContent value="data-management" className="space-y-4">
        <DataManagementTab />
      </TabsContent>
      
      <TabsContent value="system-health" className="space-y-4">
        <SystemHealthTab />
      </TabsContent>
      
      <TabsContent value="archive-management" className="space-y-4">
        <ArchiveManagementTab />
      </TabsContent>
      
      <TabsContent value="user-management" className="space-y-4">
        <UserManagementTab />
      </TabsContent>
      
      <TabsContent value="documentation" className="space-y-4">
        <SettingsDocumentationTab />
      </TabsContent>
    </Tabs>
  );
};

export default AdminTabs;
