import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RoleProtectedRoute from '@/components/auth/RoleProtectedRoute';
import { Download, Clock, FileText, BarChart3, Settings } from 'lucide-react';

const ReportingToolsPage = () => {
  const reportingCapabilities = [
    {
      title: 'Custom Report Builder',
      description: 'Create custom reports with drag-and-drop interface',
      status: 'Coming Soon',
      icon: FileText
    },
    {
      title: 'Automated Scheduling',
      description: 'Schedule reports to be delivered automatically',
      status: 'Coming Soon',
      icon: Clock
    },
    {
      title: 'Advanced Export Options',
      description: 'Export in PDF, Excel, CSV, and PowerPoint formats',
      status: 'Coming Soon',
      icon: Download
    },
    {
      title: 'Data Visualization Templates',
      description: 'Pre-built charts and dashboards for different audiences',
      status: 'Coming Soon',
      icon: BarChart3
    }
  ];

  const quickExports = [
    { name: 'Incident Summary Report', format: 'PDF' },
    { name: 'Weekly Security Briefing', format: 'PowerPoint' },
    { name: 'Monthly Analytics Export', format: 'Excel' },
    { name: 'Executive Dashboard', format: 'PDF' },
  ];

  return (
    <RoleProtectedRoute 
      allowedRoles={['admin', 'power_user', 'auditor']}
      fallbackMessage="Access to Reporting Tools requires Administrator, Power User, or Auditor privileges."
    >
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Reporting Tools</h1>
          <p className="text-muted-foreground">
            Advanced reporting and export capabilities for comprehensive analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Quick Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Quick Export Options
              </CardTitle>
              <CardDescription>
                Export current data in various formats
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickExports.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">{report.format} format</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Settings and Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Report Configuration
              </CardTitle>
              <CardDescription>
                Customize report templates and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4" />
                <p>Report configuration options will be available in a future update.</p>
                <p className="text-sm mt-2">Features in development: Template customization, branding options, and default preferences.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Future Capabilities */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Future Reporting Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportingCapabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {capability.title}
                      </div>
                      <Badge variant="outline">{capability.status}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {capability.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  );
};

export default ReportingToolsPage;