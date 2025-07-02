
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Table, 
  GitBranch, 
  Info, 
  AlertTriangle, 
  CheckCircle2,
  Brain,
  Building2,
  Users,
  Shield
} from 'lucide-react';
import { SchemaVersionManager } from '@/utils/schemaVersioning';

const DatabaseSchemaDocumentation = () => {
  const [selectedVersion, setSelectedVersion] = useState('current');
  const currentVersion = SchemaVersionManager.getCurrentVersion();
  const versionHistory = SchemaVersionManager.getVersionHistory();
  const aiSchemaInfo = SchemaVersionManager.getAISchemaInfo();

  const schemaOverview = {
    totalTables: 27, // Updated to include new AI tables
    totalFunctions: 25, // Updated to include new AI functions
    totalPolicies: 45, // Updated to include new RLS policies
    currentVersion: currentVersion.version,
    lastUpdated: currentVersion.releaseDate
  };

  const tableCategories = [
    {
      name: 'Core Security Management',
      icon: Shield,
      tables: [
        'incidents', 'provinces', 'cities', 'employee_locations', 
        'security_alerts_ingest', 'weather_alerts_ingest', 'national_security_risks'
      ],
      description: 'Core tables for security incident management and geographic tracking'
    },
    {
      name: 'AI Configuration (New)',
      icon: Brain,
      tables: ['organizations', 'ai_configurations'],
      description: 'Multi-tenant AI provider configuration and management',
      isNew: true
    },
    {
      name: 'User Management',
      icon: Users,
      tables: ['profiles', 'user_roles', 'security_audit_log'],
      description: 'User authentication, authorization, and audit logging'
    },
    {
      name: 'International Operations',
      icon: Building2,
      tables: [
        'international_hubs', 'hub_employee_locations', 'hub_incidents',
        'travel_records', 'travel_integration_config'
      ],
      description: 'International hub management and travel integration'
    },
    {
      name: 'Data Integration',
      icon: Database,
      tables: [
        'alert_sources', 'alert_ingestion_queue', 'source_health_metrics',
        'immigration_travel_announcements', 'communication_templates'
      ],
      description: 'External data source management and integration'
    },
    {
      name: 'Analytics & Correlation',
      icon: Table,
      tables: [
        'alert_correlations', 'geospatial_data', 'employee_history',
        'location_history', 'alert_archive_log'
      ],
      description: 'Data analysis, correlation, and historical tracking'
    }
  ];

  const keyFeatures = [
    {
      feature: 'Multi-Tenant Architecture',
      description: 'Organization-based data isolation with comprehensive RLS policies',
      status: 'new',
      impact: 'high'
    },
    {
      feature: 'AI Provider Integration',
      description: 'Configurable AI processing with encrypted API key storage',
      status: 'new',
      impact: 'high'
    },
    {
      feature: 'Cost Management',
      description: 'Built-in AI usage tracking and cost control mechanisms',
      status: 'new',
      impact: 'medium'
    },
    {
      feature: 'Row Level Security',
      description: 'Comprehensive data access controls at the database level',
      status: 'enhanced',
      impact: 'high'
    },
    {
      feature: 'Real-time Processing',
      description: 'Trigger-based data synchronization and alert level management',
      status: 'stable',
      impact: 'medium'
    },
    {
      feature: 'Audit Trail',
      description: 'Complete security audit logging for all system operations',
      status: 'stable',
      impact: 'high'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'enhanced': return 'bg-blue-100 text-blue-800';
      case 'stable': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-600" />
          Database Schema Documentation
        </h3>
        <p className="text-muted-foreground">
          Comprehensive database schema with AI integration and multi-tenant architecture
        </p>
      </div>

      {/* Schema Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{schemaOverview.totalTables}</div>
            <div className="text-sm text-muted-foreground">Tables</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{schemaOverview.totalFunctions}</div>
            <div className="text-sm text-muted-foreground">Functions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{schemaOverview.totalPolicies}</div>
            <div className="text-sm text-muted-foreground">RLS Policies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-orange-600">v{schemaOverview.currentVersion}</div>
            <div className="text-sm text-muted-foreground">Current Version</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Schema Highlight */}
      <Alert>
        <Brain className="h-4 w-4" />
        <AlertDescription>
          <strong>New in v{currentVersion.version}:</strong> Multi-tenant AI configuration with support for {aiSchemaInfo.tables.length} new tables, 
          {aiSchemaInfo.functions.length} new functions, and comprehensive organization-level data isolation.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Schema Overview</TabsTrigger>
          <TabsTrigger value="categories">Table Categories</TabsTrigger>
          <TabsTrigger value="features">Key Features</TabsTrigger>
          <TabsTrigger value="versions">Version History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Schema Information</CardTitle>
              <CardDescription>
                Version {currentVersion.version} - {currentVersion.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Recent Changes</h4>
                  <ul className="space-y-1 text-sm">
                    {currentVersion.changes.slice(0, 5).map((change, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          change.impact === 'high' ? 'bg-red-500' : 
                          change.impact === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        {change.description}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Schema Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Core Security Tables:</span>
                      <span className="font-medium">7</span>
                    </div>
                    <div className="flex justify-between">
                      <span>AI Configuration Tables:</span>
                      <span className="font-medium text-green-600">2 (New)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>User Management Tables:</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>International Hub Tables:</span>
                      <span className="font-medium">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Integration Tables:</span>
                      <span className="font-medium">5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Analytics Tables:</span>
                      <span className="font-medium">5</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {tableCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.name} className={category.isNew ? 'ring-2 ring-green-500' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-blue-600" />
                      {category.name}
                      {category.isNew && <Badge className="bg-green-100 text-green-800">New</Badge>}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {category.tables.map((table) => (
                        <Badge key={table} variant="outline" className="text-xs">
                          {table}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4">
            {keyFeatures.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{item.feature}</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      <Badge className={getImpactColor(item.impact)}>
                        {item.impact} impact
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="versions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-blue-600" />
                Schema Version History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {versionHistory.slice(0, 5).map((version, index) => (
                  <div key={version.version} className="border-l-2 border-blue-200 pl-4 pb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">v{version.version}</h4>
                      <Badge variant="outline">{version.releaseDate}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{version.description}</p>
                    <div className="text-xs text-muted-foreground">
                      {version.changes.length} changes • 
                      {version.breakingChanges ? ' Breaking changes' : ' Non-breaking'}
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  const changelog = SchemaVersionManager.generateChangeLog();
                  const blob = new Blob([changelog], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `schema-changelog-v${currentVersion.version}.md`;
                  a.click();
                }}
              >
                Download Full Changelog
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseSchemaDocumentation;
