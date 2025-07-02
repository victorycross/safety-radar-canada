
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Archive, History, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import UnifiedBulkArchive from '@/components/alert-ready/UnifiedBulkArchive';
import ArchiveHistoryViewer from './archive-management/ArchiveHistoryViewer';

const ArchiveManagementTab = () => {
  const { isPowerUserOrAdmin } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Access control check
  if (!isPowerUserOrAdmin()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600">
            <Shield className="h-5 w-5" />
            Access Restricted
          </CardTitle>
          <CardDescription>
            Archive management requires Administrator or Power User privileges.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              Please contact your system administrator to request access to archive management features.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Archive className="h-6 w-6 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Archive Management</h2>
          <p className="text-muted-foreground">
            Secure bulk operations and archive history management for all alert sources
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Security Notice</h3>
            <p className="text-sm text-blue-800 mt-1">
              All archive operations are logged with user attribution and timestamps. 
              Bulk operations require confirmation and reason documentation.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="bulk-operations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bulk-operations" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Bulk Operations
          </TabsTrigger>
          <TabsTrigger value="archive-history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Archive History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bulk-operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Archive Operations</CardTitle>
              <CardDescription>
                Manage active alerts across all sources with bulk archiving capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnifiedBulkArchive onRefresh={handleRefresh} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archive-history" className="space-y-4">
          <ArchiveHistoryViewer key={refreshTrigger} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ArchiveManagementTab;
