
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Users, 
  Shield, 
  Bell,
  Database,
  Key,
  FileText
} from 'lucide-react';
import DocumentationTab from './DocumentationTab';

const SettingsDocumentationTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('system');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings & Documentation</h2>
        <p className="text-muted-foreground">
          System configuration, user management, and comprehensive documentation resources
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>Core system settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Database Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="h-4 w-4 mr-2" />
                  Notification Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Key className="h-4 w-4 mr-2" />
                  API Configuration
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Security policies and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Policies
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Key className="h-4 w-4 mr-2" />
                  Access Controls
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Audit Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Users className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">User Accounts</div>
                    <div className="text-xs opacity-75">Manage user profiles</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Shield className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Roles & Permissions</div>
                    <div className="text-xs opacity-75">Configure access levels</div>
                  </div>
                </Button>

                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Key className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium">Authentication</div>
                    <div className="text-xs opacity-75">Login & security settings</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="docs" className="space-y-4">
          <DocumentationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsDocumentationTab;
