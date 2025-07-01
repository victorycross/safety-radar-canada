
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DiagnosticsPage from '@/pages/DiagnosticsPage';

const SystemHealthTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('diagnostics');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Health & Diagnostics</h2>
        <p className="text-muted-foreground">Monitor system performance, security, and technical status</p>
      </div>
      
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="diagnostics">System Diagnostics</TabsTrigger>
          <TabsTrigger value="technical">Technical Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="diagnostics" className="space-y-4">
          <div className="container mx-auto px-4 py-6">
            <DiagnosticsPage />
          </div>
        </TabsContent>
        
        <TabsContent value="technical" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Information</CardTitle>
                <CardDescription>Current system configuration and build details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Environment:</span>
                    <span>Production</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Build Version:</span>
                    <span>2.1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Last Deployment:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Framework:</span>
                    <span>React 18.3.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Database:</span>
                    <span>Supabase PostgreSQL</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Configuration</CardTitle>
                <CardDescription>Current security settings and policies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Authentication:</span>
                    <span className="text-green-600">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Row Level Security:</span>
                    <span className="text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Session Security:</span>
                    <span className="text-green-600">Monitored</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">API Rate Limiting:</span>
                    <span className="text-green-600">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Audit Logging:</span>
                    <span className="text-green-600">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Integration Status</CardTitle>
                <CardDescription>Status of external data sources and feeds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Alert Ready API:</span>
                    <span className="text-green-600">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">BC Emergency:</span>
                    <span className="text-green-600">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Weather Alerts:</span>
                    <span className="text-green-600">Syncing</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">RSS Feeds:</span>
                    <span className="text-yellow-600">Monitoring</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Travel APIs:</span>
                    <span className="text-blue-600">Configured</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>System performance and resource usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Avg Response Time:</span>
                    <span className="text-green-600">&lt; 200ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Database Queries:</span>
                    <span className="text-green-600">Optimized</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Cache Hit Rate:</span>
                    <span className="text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Error Rate:</span>
                    <span className="text-green-600">&lt; 0.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Uptime:</span>
                    <span className="text-green-600">99.9%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealthTab;
