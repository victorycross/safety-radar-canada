
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Bell,
  Database,
  Key,
  Activity,
  GitBranch
} from 'lucide-react';
import DocumentationTab from './DocumentationTab';
import SchemaHealthMonitor from './SchemaHealthMonitor';
import SecurityDashboard from '../security/SecurityDashboard';

const SettingsDocumentationTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('system');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings & Documentation</h2>
        <p className="text-muted-foreground">
          System configuration, security monitoring, and comprehensive documentation resources
        </p>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="security">Security Monitor</TabsTrigger>
          <TabsTrigger value="schema">Schema Health</TabsTrigger>
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
                <Button variant="outline" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  System Monitoring
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Version Information
                </CardTitle>
                <CardDescription>Current system version and schema information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold">Application Version</div>
                    <div className="text-sm text-muted-foreground">v1.0.0</div>
                  </div>
                  <div>
                    <div className="font-semibold">Database Schema</div>
                    <div className="text-sm text-muted-foreground">v2.0.0</div>
                  </div>
                  <div>
                    <div className="font-semibold">Total Tables</div>
                    <div className="text-sm text-muted-foreground">25 tables</div>
                  </div>
                  <div>
                    <div className="font-semibold">Last Updated</div>
                    <div className="text-sm text-muted-foreground">January 2025</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <SecurityDashboard />
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          <SchemaHealthMonitor />
        </TabsContent>
        
        <TabsContent value="docs" className="space-y-4">
          <DocumentationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsDocumentationTab;
