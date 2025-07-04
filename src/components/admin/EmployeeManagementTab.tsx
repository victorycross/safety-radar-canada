
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UnifiedEmployeeManagement from './UnifiedEmployeeManagement';
import TravelIntegrationDashboard from './TravelIntegrationDashboard';
import EnhancedTravelManagement from './EnhancedTravelManagement';
import { Users, Plane, MapPin } from 'lucide-react';

const EmployeeManagementTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Employee Operations Management</h2>
        <p className="text-muted-foreground">
          Unified employee data management and travel integration systems
        </p>
      </div>

      <Tabs defaultValue="employee-data" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employee-data" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employee Data
          </TabsTrigger>
          <TabsTrigger value="travel-management" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Travel Management
          </TabsTrigger>
          <TabsTrigger value="travel-integration" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Platform Integration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employee-data" className="space-y-4">
          <UnifiedEmployeeManagement />
        </TabsContent>

        <TabsContent value="travel-management" className="space-y-4">
          <EnhancedTravelManagement />
        </TabsContent>

        <TabsContent value="travel-integration" className="space-y-4">
          <TravelIntegrationDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployeeManagementTab;
