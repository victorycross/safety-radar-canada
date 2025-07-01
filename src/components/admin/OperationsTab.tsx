
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmployeeManagementTab from './EmployeeManagementTab';
import HubManagementTab from './HubManagementTab';

const OperationsTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('employees');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Operations Management</h2>
        <p className="text-muted-foreground">Manage employees, hubs, and operational activities</p>
      </div>
      
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees">Employee Management</TabsTrigger>
          <TabsTrigger value="hubs">Hub Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employees" className="space-y-4">
          <EmployeeManagementTab />
        </TabsContent>
        
        <TabsContent value="hubs" className="space-y-4">
          <HubManagementTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OperationsTab;
