
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Database, RefreshCw, Users, MapPin, Globe } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import CityLocationManagement from './CityLocationManagement';
import HubEmployeeManagement from './HubEmployeeManagement';
import BulkEmployeeManagement from './BulkEmployeeManagement';
import DataConsistencyValidator from './DataConsistencyValidator';
import HubDataConsistencyValidator from './HubDataConsistencyValidator';
import { recalculateProvincesTotals, recalculateHubTotals } from '@/services/employeeService';

const UnifiedEmployeeManagement = () => {
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculateAllTotals = async () => {
    setIsRecalculating(true);
    try {
      await Promise.all([
        recalculateProvincesTotals(),
        recalculateHubTotals()
      ]);
      toast({
        title: "All Totals Recalculated",
        description: "Province and hub employee counts have been updated based on location-level data",
      });
    } catch (error) {
      console.error('Error recalculating totals:', error);
      toast({
        title: "Recalculation Failed",
        description: "Failed to recalculate employee totals. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleDataFixed = () => {
    // This will trigger a refresh of the parent components
    window.dispatchEvent(new CustomEvent('employeeDataUpdated'));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Employee Data Management</h2>
          <p className="text-muted-foreground">
            Manage employee distributions with location-level precision and automated totals synchronization
          </p>
        </div>
        <Button 
          onClick={handleRecalculateAllTotals}
          disabled={isRecalculating}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
          {isRecalculating ? 'Recalculating...' : 'Sync All Totals'}
        </Button>
      </div>

      {/* Data Consistency Validators */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DataConsistencyValidator onDataFixed={handleDataFixed} />
        <HubDataConsistencyValidator />
      </div>

      {/* Data Architecture Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Database className="h-5 w-5" />
            Data Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <div className="space-y-2 text-sm">
            <p><strong>Single Source of Truth:</strong> City and hub-level employee locations drive all totals</p>
            <p><strong>Automatic Sync:</strong> Province and hub totals are calculated automatically from location data</p>
            <p><strong>Data Integrity:</strong> Direct total updates are blocked to maintain consistency</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="city-management" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="city-management" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            City-Level Management
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Primary</span>
          </TabsTrigger>
          <TabsTrigger value="hub-management" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Hub-Level Management
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Primary</span>
          </TabsTrigger>
          <TabsTrigger value="bulk-operations" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Bulk Operations
            <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Legacy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="city-management" className="space-y-4">
          <CityLocationManagement onDataUpdated={handleDataFixed} />
        </TabsContent>

        <TabsContent value="hub-management" className="space-y-4">
          <HubEmployeeManagement onDataUpdated={handleDataFixed} />
        </TabsContent>

        <TabsContent value="bulk-operations" className="space-y-4">
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                Legacy Bulk Operations
              </CardTitle>
              <CardDescription className="text-yellow-700">
                These operations now work through location-level data to maintain consistency. 
                For detailed management, use the City-Level or Hub-Level Management tabs.
              </CardDescription>
            </CardHeader>
          </Card>
          <BulkEmployeeManagement onDataUpdated={handleDataFixed} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedEmployeeManagement;
