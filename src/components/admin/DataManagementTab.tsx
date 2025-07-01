
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Database, 
  Users, 
  Building, 
  Download, 
  Upload, 
  Settings,
  ChevronDown,
  Rss,
  Globe
} from 'lucide-react';
import FeedManagementTab from './FeedManagementTab';
import EmployeeManagementTab from './EmployeeManagementTab';
import HubManagementTab from './HubManagementTab';

const DataManagementTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('feeds');
  const [showBulkOperations, setShowBulkOperations] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Data Management</h2>
        <p className="text-muted-foreground">
          Manage all data sources, employees, hubs, and bulk operations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Rss className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Feeds</p>
              <p className="text-lg font-bold">12</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Users className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Employees</p>
              <p className="text-lg font-bold">2,847</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Globe className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Hubs</p>
              <p className="text-lg font-bold">8</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Database className="h-8 w-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data Sources</p>
              <p className="text-lg font-bold">24</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Data Management Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feeds">Data Sources & Feeds</TabsTrigger>
          <TabsTrigger value="employees">Employee Management</TabsTrigger>
          <TabsTrigger value="hubs">Hub Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feeds" className="space-y-4">
          <FeedManagementTab />
        </TabsContent>
        
        <TabsContent value="employees" className="space-y-4">
          <EmployeeManagementTab />
        </TabsContent>
        
        <TabsContent value="hubs" className="space-y-4">
          <HubManagementTab />
        </TabsContent>
      </Tabs>

      {/* Bulk Operations - Collapsible */}
      <Collapsible open={showBulkOperations} onOpenChange={setShowBulkOperations}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full">
            <Database className="h-4 w-4 mr-2" />
            Bulk Operations & Data Import/Export
            <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showBulkOperations ? 'rotate-180' : ''}`} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Operations</CardTitle>
              <CardDescription>Large-scale data operations and management</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Bulk Employee Updates</div>
                    <div className="text-xs opacity-75">Import/export employee data</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Building className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Hub Bulk Operations</div>
                    <div className="text-xs opacity-75">Manage multiple hubs</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Download className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Data Export</div>
                    <div className="text-xs opacity-75">Export system data</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default DataManagementTab;
