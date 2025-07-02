
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Table, 
  Key, 
  Shield, 
  GitBranch, 
  Users, 
  Brain,
  Building2,
  Settings
} from 'lucide-react';

const AISchemaDocumentation = () => {
  const [selectedTable, setSelectedTable] = useState('organizations');

  const aiTables = [
    {
      name: 'organizations',
      description: 'Multi-tenant organization management',
      icon: Building2,
      columns: [
        { name: 'id', type: 'UUID', nullable: false, default: 'gen_random_uuid()', description: 'Primary key' },
        { name: 'name', type: 'TEXT', nullable: false, description: 'Organization display name' },
        { name: 'slug', type: 'TEXT', nullable: false, unique: true, description: 'URL-friendly identifier' },
        { name: 'description', type: 'TEXT', nullable: true, description: 'Organization description' },
        { name: 'contact_email', type: 'TEXT', nullable: true, description: 'Primary contact email' },
        { name: 'is_active', type: 'BOOLEAN', nullable: false, default: 'true', description: 'Organization status' },
        { name: 'subscription_tier', type: 'TEXT', nullable: false, default: 'basic', description: 'Subscription level (basic, standard, premium, enterprise)' },
        { name: 'max_users', type: 'INTEGER', nullable: true, default: '50', description: 'Maximum allowed users' },
        { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, default: 'now()', description: 'Creation timestamp' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false, default: 'now()', description: 'Last update timestamp' }
      ],
      relationships: [
        { type: 'One-to-Many', table: 'ai_configurations', description: 'Organization can have multiple AI configurations' },
        { type: 'One-to-Many', table: 'profiles', description: 'Organization can have multiple user profiles' },
        { type: 'One-to-Many', table: 'user_roles', description: 'Organization can have multiple user roles' }
      ],
      rlsPolicies: [
        { name: 'Users can view their organization', action: 'SELECT', condition: 'id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())' },
        { name: 'Admins can manage organizations', action: 'ALL', condition: 'is_admin()' }
      ]
    },
    {
      name: 'ai_configurations',
      description: 'AI provider configurations and settings',
      icon: Brain,
      columns: [
        { name: 'id', type: 'UUID', nullable: false, default: 'gen_random_uuid()', description: 'Primary key' },
        { name: 'organization_id', type: 'UUID', nullable: false, description: 'References organizations.id' },
        { name: 'provider', type: 'TEXT', nullable: false, description: 'AI provider (openai, anthropic, google, azure)' },
        { name: 'api_key_encrypted', type: 'TEXT', nullable: false, description: 'Encrypted API key' },
        { name: 'model_name', type: 'TEXT', nullable: false, description: 'AI model identifier' },
        { name: 'feature_flags', type: 'JSONB', nullable: false, default: '{}', description: 'Enabled AI features' },
        { name: 'cost_limits', type: 'JSONB', nullable: false, default: '{"daily_limit": 100, "monthly_limit": 1000}', description: 'Cost control settings' },
        { name: 'usage_stats', type: 'JSONB', nullable: false, default: '{"requests_today": 0, "requests_month": 0, "cost_today": 0, "cost_month": 0}', description: 'Usage tracking data' },
        { name: 'is_enabled', type: 'BOOLEAN', nullable: false, default: 'false', description: 'Configuration status' },
        { name: 'created_at', type: 'TIMESTAMPTZ', nullable: false, default: 'now()', description: 'Creation timestamp' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', nullable: false, default: 'now()', description: 'Last update timestamp' }
      ],
      relationships: [
        { type: 'Many-to-One', table: 'organizations', description: 'AI configuration belongs to an organization' }
      ],
      rlsPolicies: [
        { name: 'Org admins can manage AI configs', action: 'ALL', condition: 'organization_id IN (SELECT p.organization_id FROM profiles p JOIN user_roles ur ON p.id = ur.user_id WHERE p.id = auth.uid() AND (ur.role = \'admin\' OR ur.role = \'power_user\'))' },
        { name: 'Org members can view AI configs', action: 'SELECT', condition: 'organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())' }
      ]
    }
  ];

  const databaseFunctions = [
    {
      name: 'get_organization_ai_config',
      description: 'Retrieves AI configuration for an organization and provider',
      parameters: ['org_id UUID', 'ai_provider TEXT'],
      returns: 'TABLE(id UUID, provider TEXT, model_name TEXT, feature_flags JSONB, cost_limits JSONB, usage_stats JSONB, is_enabled BOOLEAN)',
      security: 'SECURITY DEFINER',
      usage: 'Used by AI processing functions to retrieve configuration safely'
    },
    {
      name: 'update_ai_usage_stats',
      description: 'Updates usage statistics for AI configuration',
      parameters: ['config_id UUID', 'requests_increment INTEGER DEFAULT 1', 'cost_increment DECIMAL DEFAULT 0'],
      returns: 'void',
      security: 'SECURITY DEFINER',
      usage: 'Called after each AI API request to track usage and costs'
    }
  ];

  const selectedTableData = aiTables.find(table => table.name === selectedTable);

  const sampleData = {
    organizations: [
      {
        id: 'org-123',
        name: 'Acme Corporation',
        slug: 'acme-corp',
        subscription_tier: 'enterprise',
        is_active: true
      }
    ],
    ai_configurations: [
      {
        id: 'config-456',
        organization_id: 'org-123',
        provider: 'openai',
        model_name: 'gpt-4o',
        feature_flags: { parsing: true, classification: true, correlation: false },
        cost_limits: { daily_limit: 500, monthly_limit: 10000 },
        is_enabled: true
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-600" />
          AI Configuration Schema
        </h2>
        <p className="text-muted-foreground mt-2">
          Database schema documentation for AI integration and multi-tenant configuration
        </p>
      </div>

      <Tabs defaultValue="tables" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="functions">Functions</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="samples">Sample Data</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Table List */}
            <div className="space-y-2">
              <h3 className="font-semibold">AI Configuration Entities</h3>
              {aiTables.map((table) => {
                const Icon = table.icon;
                return (
                  <Card 
                    key={table.name}
                    className={`cursor-pointer transition-all ${selectedTable === table.name ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedTable(table.name)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{table.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{table.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Table Details */}
            <div className="lg:col-span-2">
              {selectedTableData && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Table className="h-5 w-5" />
                      {selectedTableData.name}
                    </CardTitle>
                    <CardDescription>{selectedTableData.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Columns */}
                    <div>
                      <h4 className="font-semibold mb-3">Columns</h4>
                      <div className="space-y-2">
                        {selectedTableData.columns.map((column, index) => (
                          <div key={index} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{column.name}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{column.type}</Badge>
                                {!column.nullable && <Badge variant="secondary">NOT NULL</Badge>}
                                {column.unique && <Badge variant="secondary">UNIQUE</Badge>}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{column.description}</p>
                            {column.default && (
                              <p className="text-xs text-blue-600 mt-1">Default: {column.default}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Relationships */}
                    {selectedTableData.relationships.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Relationships</h4>
                        <div className="space-y-2">
                          {selectedTableData.relationships.map((rel, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <Badge variant="outline">{rel.type}</Badge>
                              <span>{rel.table}</span>
                              <span className="text-muted-foreground">- {rel.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="functions" className="space-y-4">
          <div className="space-y-4">
            {databaseFunctions.map((func, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {func.name}()
                  </CardTitle>
                  <CardDescription>{func.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h5 className="font-medium mb-2">Parameters</h5>
                    <code className="text-sm bg-gray-100 p-2 rounded block">
                      {func.parameters.join(', ')}
                    </code>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Returns</h5>
                    <code className="text-sm bg-gray-100 p-2 rounded block">
                      {func.returns}
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{func.security}</Badge>
                  </div>
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Usage:</strong> {func.usage}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Row Level Security (RLS) Policies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiTables.map((table) => (
                <div key={table.name}>
                  <h4 className="font-semibold mb-2">{table.name}</h4>
                  <div className="space-y-2 ml-4">
                    {table.rlsPolicies.map((policy, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{policy.name}</span>
                          <Badge variant="outline">{policy.action}</Badge>
                        </div>
                        <code className="text-xs bg-gray-100 p-1 rounded block">
                          {policy.condition}
                        </code>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="samples" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sample Data Examples</CardTitle>
              <CardDescription>
                Example records showing typical AI configuration data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(sampleData).map(([tableName, records]) => (
                <div key={tableName}>
                  <h4 className="font-semibold mb-2">{tableName}</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(records, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AISchemaDocumentation;
