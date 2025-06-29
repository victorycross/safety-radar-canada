
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BulkEmployeeManagement from './BulkEmployeeManagement';
import CityLocationManagement from './CityLocationManagement';
import TravelIntegrationDashboard from './TravelIntegrationDashboard';
import TestingSampleData from './TestingSampleData';
import { Users, MapPin, Plane, FileSpreadsheet, TestTube } from 'lucide-react';

const EmployeeManagementTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Employee Data Management</h2>
        <p className="text-muted-foreground">
          Manage employee distributions, city-level data, and travel integration systems
        </p>
      </div>

      <Tabs defaultValue="testing" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testing
          </TabsTrigger>
          <TabsTrigger value="city-management" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            City Management
          </TabsTrigger>
          <TabsTrigger value="travel-integration" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Travel Integration
          </TabsTrigger>
          <TabsTrigger value="bulk-operations" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Bulk Operations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="testing" className="space-y-4">
          <TestingSampleData />
        </TabsContent>

        <TabsContent value="city-management" className="space-y-4">
          <CityLocationManagement />
        </TabsContent>

        <TabsContent value="travel-integration" className="space-y-4">
          <TravelIntegrationDashboard />
        </TabsContent>

        <TabsContent value="bulk-operations" className="space-y-4">
          <BulkEmployeeManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeManagementTab;
