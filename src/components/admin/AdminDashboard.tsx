import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserManagementTab from '@/components/admin/UserManagementTab';
import { Users, Settings, Shield } from 'lucide-react';
import ConfigurationTab from '@/components/admin/ConfigurationTab';
import SecurityMonitoringDashboard from '@/components/security/SecurityMonitoringDashboard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Dashboard
          </CardTitle>
          <CardDescription>
            Manage users, system configurations, and monitor security events.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="configuration">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="security">Security Monitor</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagementTab />
        </TabsContent>

        <TabsContent value="configuration">
          <ConfigurationTab />
        </TabsContent>

        <TabsContent value="security">
          <SecurityMonitoringDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
