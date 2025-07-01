
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Database, 
  Shield, 
  Key, 
  Download, 
  ChevronDown, 
  ChevronRight,
  Table,
  Link,
  FileText
} from 'lucide-react';

const DatabaseSchemaDocumentation = () => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const coreEntities = [
    {
      name: 'provinces',
      description: 'Canadian provinces and territories with employee counts and alert levels',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'name', type: 'text', nullable: false, description: 'Province/territory name' },
        { name: 'code', type: 'text', nullable: false, description: '2-letter code (ON, QC, etc.)' },
        { name: 'alert_level', type: 'text', nullable: false, description: 'normal | warning | severe' },
        { name: 'employee_count', type: 'integer', nullable: false, description: 'Total employees (0-50000)' }
      ],
      relationships: ['cities', 'employee_locations', 'incidents'],
      component: 'ProvinceCard.tsx, CanadianProvincesGrid',
      template: 'ProvinceDataTemplate'
    },
    {
      name: 'cities',
      description: 'Cities within provinces for employee location tracking',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'province_id', type: 'uuid', nullable: false, description: 'Foreign key to provinces' },
        { name: 'name', type: 'text', nullable: false, description: 'City name' },
        { name: 'code', type: 'text', nullable: false, description: 'City code' },
        { name: 'is_major_city', type: 'boolean', nullable: false, description: 'Major city flag' }
      ],
      relationships: ['provinces', 'employee_locations', 'travel_records'],
      component: 'CityLocationManagement.tsx',
      template: 'BulkEmployeeUpdateTemplate'
    },
    {
      name: 'international_hubs',
      description: 'International office locations outside Canada',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'name', type: 'text', nullable: false, description: 'Hub name' },
        { name: 'country', type: 'text', nullable: false, description: 'Country name' },
        { name: 'code', type: 'text', nullable: false, description: 'Hub identifier code' },
        { name: 'employee_count', type: 'integer', nullable: true, description: 'Hub employees (0-1000)' },
        { name: 'alert_level', type: 'text', nullable: true, description: 'normal | warning | severe' },
        { name: 'is_active', type: 'boolean', nullable: true, description: 'Hub active status' }
      ],
      relationships: ['hub_employee_locations', 'hub_incidents'],
      component: 'InternationalHubs.tsx, HubDetailPage.tsx',
      template: 'InternationalHubDataTemplate'
    }
  ];

  const incidentEntities = [
    {
      name: 'incidents',
      description: 'Security incidents within Canadian provinces',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'title', type: 'text', nullable: false, description: 'Incident title' },
        { name: 'description', type: 'text', nullable: false, description: 'Detailed description' },
        { name: 'alert_level', type: 'text', nullable: false, description: 'normal | warning | severe' },
        { name: 'province_id', type: 'uuid', nullable: false, description: 'Foreign key to provinces' },
        { name: 'source', type: 'text', nullable: false, description: 'Never test/unknown' },
        { name: 'verification_status', type: 'text', nullable: false, description: 'unverified | verified | false_alarm' }
      ],
      relationships: ['provinces', 'geospatial_data'],
      component: 'IncidentsList.tsx, IncidentForm.tsx',
      template: 'IncidentDataTemplate'
    },
    {
      name: 'hub_incidents',
      description: 'Security incidents at international hubs',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'hub_id', type: 'uuid', nullable: false, description: 'Foreign key to international_hubs' },
        { name: 'title', type: 'text', nullable: false, description: 'Incident title' },
        { name: 'alert_level', type: 'text', nullable: true, description: 'normal | warning | severe' },
        { name: 'source', type: 'text', nullable: true, description: 'Never test/empty' }
      ],
      relationships: ['international_hubs'],
      component: 'HubDetailPage.tsx',
      template: 'HubIncidentDataTemplate'
    }
  ];

  const alertEntities = [
    {
      name: 'security_alerts_ingest',
      description: 'Cybersecurity and physical security alerts',
      columns: [
        { name: 'id', type: 'text', nullable: false, description: 'Required unique identifier' },
        { name: 'title', type: 'text', nullable: false, description: 'Alert title' },
        { name: 'category', type: 'text', nullable: false, description: 'cybersecurity | physical_security | intelligence | other' },
        { name: 'location', type: 'text', nullable: true, description: 'Default: Global' },
        { name: 'source', type: 'text', nullable: false, description: 'Default: CSE, never test' }
      ],
      relationships: [],
      component: 'SecurityDashboard.tsx',
      template: 'SecurityAlertDataTemplate'
    },
    {
      name: 'weather_alerts_ingest',
      description: 'Weather-related emergency alerts',
      columns: [
        { name: 'id', type: 'text', nullable: false, description: 'Required unique identifier' },
        { name: 'event_type', type: 'text', nullable: true, description: 'Storm, flood, etc.' },
        { name: 'severity', type: 'text', nullable: true, description: 'minor | moderate | severe | extreme' },
        { name: 'onset', type: 'timestamp', nullable: true, description: 'ISO date string' },
        { name: 'expires', type: 'timestamp', nullable: true, description: 'ISO date string' }
      ],
      relationships: [],
      component: 'WeatherAlertsTab.tsx',
      template: 'WeatherAlertDataTemplate'
    },
    {
      name: 'immigration_travel_announcements',
      description: 'Immigration and travel policy announcements',
      columns: [
        { name: 'id', type: 'text', nullable: false, description: 'Required unique identifier' },
        { name: 'title', type: 'text', nullable: false, description: 'Announcement title' },
        { name: 'location', type: 'text', nullable: true, description: 'Default: Canada' },
        { name: 'source', type: 'text', nullable: false, description: 'Default: IRCC' },
        { name: 'announcement_type', type: 'text', nullable: true, description: 'policy_change | service_update | travel_advisory | other' }
      ],
      relationships: [],
      component: 'ImmigrationTravelTab.tsx',
      template: 'ImmigrationTravelDataTemplate'
    }
  ];

  const employeeEntities = [
    {
      name: 'employee_locations',
      description: 'Employee distribution across Canadian cities',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'city_id', type: 'text', nullable: false, description: 'Foreign key to cities' },
        { name: 'province_id', type: 'text', nullable: false, description: 'Foreign key to provinces' },
        { name: 'home_base_count', type: 'integer', nullable: false, description: 'Employees based here (>= 0)' },
        { name: 'current_location_count', type: 'integer', nullable: false, description: 'Currently here (>= 0)' },
        { name: 'travel_away_count', type: 'integer', nullable: false, description: 'Traveling away (>= 0)' }
      ],
      relationships: ['cities', 'provinces'],
      component: 'BulkEmployeeManagement.tsx',
      template: 'EmployeeLocationDataTemplate'
    },
    {
      name: 'travel_records',
      description: 'Individual employee travel tracking',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'employee_id', type: 'text', nullable: false, description: 'Never TEST% or EMP00%' },
        { name: 'home_city_id', type: 'text', nullable: false, description: 'Home base city' },
        { name: 'travel_status', type: 'text', nullable: false, description: 'home | traveling | away' },
        { name: 'travel_platform', type: 'text', nullable: true, description: 'Never test/manual' }
      ],
      relationships: ['cities'],
      component: 'TravelIntegrationDashboard.tsx',
      template: 'TravelRecordDataTemplate'
    }
  ];

  const downloadSchemaCSV = () => {
    const csvContent = `Table Name,Description,Primary Key,Foreign Keys,Component,Template
${coreEntities.concat(incidentEntities, alertEntities, employeeEntities)
  .map(table => 
    `"${table.name}","${table.description}","id","${table.relationships.join(', ')}","${table.component}","${table.template}"`
  ).join('\n')}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database-schema-overview.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const TableCard = ({ table }: { table: any }) => (
    <Card className="mb-4">
      <Collapsible
        open={expandedTables[table.name]}
        onOpenChange={() => toggleTable(table.name)}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Table className="h-5 w-5" />
                <div>
                  <CardTitle className="text-lg">{table.name}</CardTitle>
                  <CardDescription>{table.description}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{table.columns.length} columns</Badge>
                {expandedTables[table.name] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Columns
                </h4>
                <div className="space-y-2">
                  {table.columns.map((col: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <Badge variant={col.nullable ? "secondary" : "default"}>
                          {col.name}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{col.type}</span>
                      </div>
                      <span className="text-sm">{col.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {table.relationships.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Relationships
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {table.relationships.map((rel: string) => (
                      <Badge key={rel} variant="outline">
                        {rel}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Code References
                </h4>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">Component:</span> {table.component}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Template:</span> {table.template}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Database Schema Documentation</h2>
          <p className="text-muted-foreground">
            Comprehensive documentation of all 24 database tables with relationships and code mappings
          </p>
        </div>
        <Button onClick={downloadSchemaCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Schema CSV
        </Button>
      </div>

      <Tabs defaultValue="core" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="core">Core Entities</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="alerts">Alert Sources</TabsTrigger>
          <TabsTrigger value="employees">Employee Data</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Core Geographic & Hub Entities</h3>
            <p className="text-sm text-muted-foreground">
              Primary location and organizational structure tables
            </p>
          </div>
          {coreEntities.map(table => (
            <TableCard key={table.name} table={table} />
          ))}
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Incident Management</h3>
            <p className="text-sm text-muted-foreground">
              Security incident tracking and management tables
            </p>
          </div>
          {incidentEntities.map(table => (
            <TableCard key={table.name} table={table} />
          ))}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">External Alert Sources</h3>
            <p className="text-sm text-muted-foreground">
              External data ingestion from various alert sources
            </p>
          </div>
          {alertEntities.map(table => (
            <TableCard key={table.name} table={table} />
          ))}
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Employee & Travel Data</h3>
            <p className="text-sm text-muted-foreground">
              Employee location tracking and travel management
            </p>
          </div>
          {employeeEntities.map(table => (
            <TableCard key={table.name} table={table} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseSchemaDocumentation;
