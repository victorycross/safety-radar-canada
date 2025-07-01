
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Database, 
  Shield, 
  Users, 
  Globe, 
  AlertTriangle,
  Cloud,
  Plane,
  MapPin,
  Download,
  Copy
} from 'lucide-react';
import { TemplateMetadata } from '@/types/dataTemplates';

const DataTemplateDocumentation = () => {
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const templates: TemplateMetadata[] = [
    {
      name: 'Province Data',
      description: 'Canadian province information with employee counts and alert levels',
      requiredFields: ['name', 'code', 'employee_count'],
      optionalFields: ['alert_level'],
      validationRules: {
        'code': '2-letter uppercase province code (ON, QC, BC, etc.)',
        'employee_count': 'Must be between 0 and 50,000',
        'alert_level': 'Must be normal, warning, or severe'
      },
      permissions: {
        admin: { canView: true, canCreate: true, canUpdate: true, canDelete: true, canBulkUpdate: true, canArchive: true },
        power_user: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canBulkUpdate: true, canArchive: false },
        regular_user: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canBulkUpdate: false, canArchive: false }
      },
      relatedComponents: ['HomePage.tsx', 'LocationStatusPage.tsx', 'ProvinceCard.tsx'],
      exampleData: {
        name: 'Ontario',
        code: 'ON',
        alert_level: 'normal',
        employee_count: 2500
      }
    },
    {
      name: 'International Hub Data',
      description: 'International office locations with employee counts and status',
      requiredFields: ['name', 'country', 'code', 'employee_count', 'is_active'],
      optionalFields: ['flag_emoji', 'alert_level', 'coordinates'],
      validationRules: {
        'employee_count': 'Must be between 0 and 1,000',
        'alert_level': 'Must be normal, warning, or severe',
        'coordinates': 'Array of [longitude, latitude]'
      },
      permissions: {
        admin: { canView: true, canCreate: true, canUpdate: true, canDelete: true, canBulkUpdate: true, canArchive: true },
        power_user: { canView: true, canCreate: false, canUpdate: true, canDelete: false, canBulkUpdate: true, canArchive: false },
        regular_user: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canBulkUpdate: false, canArchive: false }
      },
      relatedComponents: ['HubsPage.tsx', 'HubDetailPage.tsx', 'InternationalHubs.tsx'],
      exampleData: {
        name: 'London Office',
        country: 'United Kingdom',
        code: 'UK-LON',
        flag_emoji: '🇬🇧',
        alert_level: 'normal',
        employee_count: 100,
        is_active: true
      }
    },
    {
      name: 'Incident Data',
      description: 'Security incidents affecting Canadian provinces',
      requiredFields: ['title', 'description', 'source', 'alert_level'],
      optionalFields: ['province_id', 'geographic_scope', 'recommended_action', 'verification_status', 'confidence_score'],
      validationRules: {
        'source': 'Cannot be test, unknown, or empty',
        'alert_level': 'Must be normal, warning, or severe',
        'confidence_score': 'Must be between 0.0 and 1.0',
        'verification_status': 'Must be unverified, verified, or false_alarm'
      },
      permissions: {
        admin: { canView: true, canCreate: true, canUpdate: true, canDelete: true, canBulkUpdate: true, canArchive: true },
        power_user: { canView: true, canCreate: true, canUpdate: true, canDelete: false, canBulkUpdate: false, canArchive: true },
        regular_user: { canView: true, canCreate: true, canUpdate: false, canDelete: false, canBulkUpdate: false, canArchive: false }
      },
      relatedComponents: ['IncidentsPage.tsx', 'ReportIncidentPage.tsx', 'IncidentForm.tsx'],
      exampleData: {
        title: 'Severe Weather Warning',
        description: 'Blizzard conditions expected with high winds',
        source: 'Environment Canada',
        alert_level: 'warning',
        verification_status: 'verified',
        confidence_score: 0.9
      }
    },
    {
      name: 'Security Alert Data',
      description: 'Cybersecurity and physical security alerts',
      requiredFields: ['id', 'title', 'source'],
      optionalFields: ['summary', 'location', 'category', 'pub_date', 'link'],
      validationRules: {
        'id': 'Unique identifier, cannot be empty',
        'source': 'Cannot be "test"',
        'category': 'Must be cybersecurity, physical_security, intelligence, or other',
        'location': 'Defaults to "Global"'
      },
      permissions: {
        admin: { canView: true, canCreate: true, canUpdate: true, canDelete: true, canBulkUpdate: true, canArchive: true },
        power_user: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canBulkUpdate: false, canArchive: true },
        regular_user: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canBulkUpdate: false, canArchive: false }
      },
      relatedComponents: ['AlertReadyPage.tsx', 'SecurityDashboard.tsx'],
      exampleData: {
        id: 'CSE-2024-001',
        title: 'Critical Vulnerability in Common Software',
        source: 'Communications Security Establishment',
        category: 'cybersecurity',
        location: 'Global'
      }
    },
    {
      name: 'Weather Alert Data',
      description: 'Weather warnings and advisories',
      requiredFields: ['id'],
      optionalFields: ['event_type', 'severity', 'description', 'onset', 'expires', 'geometry_coordinates'],
      validationRules: {
        'id': 'Unique identifier, cannot contain "test"',
        'severity': 'Must be minor, moderate, severe, or extreme',
        'onset': 'ISO date string format',
        'expires': 'ISO date string format'
      },
      permissions: {
        admin: { canView: true, canCreate: true, canUpdate: true, canDelete: true, canBulkUpdate: true, canArchive: true },
        power_user: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canBulkUpdate: false, canArchive: true },
        regular_user: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canBulkUpdate: false, canArchive: false }
      },
      relatedComponents: ['AlertReadyPage.tsx', 'WeatherAlertsTab.tsx'],
      exampleData: {
        id: 'EC-STORM-2024-001',
        event_type: 'Blizzard',
        severity: 'severe',
        description: 'Heavy snow and high winds expected',
        onset: '2024-01-15T18:00:00Z',
        expires: '2024-01-16T06:00:00Z'
      }
    },
    {
      name: 'Immigration/Travel Data',
      description: 'Immigration and travel announcements from IRCC',
      requiredFields: ['id', 'title', 'source'],
      optionalFields: ['content', 'summary', 'location', 'category', 'announcement_type', 'pub_date', 'link'],
      validationRules: {
        'id': 'Unique identifier, cannot contain "test"',
        'source': 'Defaults to "Immigration, Refugees and Citizenship Canada"',
        'location': 'Defaults to "Canada"',
        'announcement_type': 'Must be policy_change, service_update, travel_advisory, or other'
      },
      permissions: {
        admin: { canView: true, canCreate: true, canUpdate: true, canDelete: true, canBulkUpdate: true, canArchive: true },
        power_user: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canBulkUpdate: false, canArchive: true },
        regular_user: { canView: true, canCreate: false, canUpdate: false, canDelete: false, canBulkUpdate: false, canArchive: false }
      },
      relatedComponents: ['ImmigrationTravelTab.tsx', 'TravelIntegrationDashboard.tsx'],
      exampleData: {
        id: 'IRCC-2024-001',
        title: 'New Express Entry Draw',
        source: 'Immigration, Refugees and Citizenship Canada',
        location: 'Canada',
        announcement_type: 'policy_change'
      }
    }
  ];

  const getTemplateIcon = (name: string) => {
    switch (name) {
      case 'Province Data': return <MapPin className="h-4 w-4" />;
      case 'International Hub Data': return <Globe className="h-4 w-4" />;
      case 'Incident Data': return <AlertTriangle className="h-4 w-4" />;
      case 'Security Alert Data': return <Shield className="h-4 w-4" />;
      case 'Weather Alert Data': return <Cloud className="h-4 w-4" />;
      case 'Immigration/Travel Data': return <Plane className="h-4 w-4" />;
      default: return <Database className="h-4 w-4" />;
    }
  };

  const copyToClipboard = async (data: any, templateName: string) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopiedTemplate(templateName);
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const downloadTemplate = (data: any, templateName: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}-template.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Data Templates & Documentation</h2>
        <p className="text-muted-foreground">
          Comprehensive guide to data structures, validation rules, and permissions for all system entities.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.name}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {getTemplateIcon(template.name)}
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                  </div>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Required:</span> {template.requiredFields.length}
                    </div>
                    <div>
                      <span className="font-medium">Optional:</span> {template.optionalFields.length}
                    </div>
                    <div>
                      <span className="font-medium">Components:</span> {template.relatedComponents.length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {templates.map((template) => (
            <Card key={template.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getTemplateIcon(template.name)}
                    <CardTitle>{template.name}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(template.exampleData, template.name)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      {copiedTemplate === template.name ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadTemplate(template.exampleData, template.name)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Required Fields</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.requiredFields.map(field => (
                      <Badge key={field} variant="destructive">{field}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Optional Fields</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.optionalFields.map(field => (
                      <Badge key={field} variant="secondary">{field}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Validation Rules</h4>
                  <div className="space-y-1 text-sm">
                    {Object.entries(template.validationRules).map(([field, rule]) => (
                      <div key={field} className="flex">
                        <span className="font-mono bg-muted px-1 rounded text-xs min-w-fit mr-2">
                          {field}
                        </span>
                        <span className="text-muted-foreground">{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Related Components</h4>
                  <div className="flex flex-wrap gap-1">
                    {template.relatedComponents.map(component => (
                      <Badge key={component} variant="outline">{component}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Example Data</h4>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    {JSON.stringify(template.exampleData, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          {templates.map((template) => (
            <Card key={template.name}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {getTemplateIcon(template.name)}
                  <CardTitle>{template.name} Permissions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Role</th>
                        <th className="text-center p-2">View</th>
                        <th className="text-center p-2">Create</th>
                        <th className="text-center p-2">Update</th>
                        <th className="text-center p-2">Delete</th>
                        <th className="text-center p-2">Bulk Update</th>
                        <th className="text-center p-2">Archive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(template.permissions).map(([role, perms]) => (
                        <tr key={role} className="border-b">
                          <td className="p-2 font-medium capitalize">{role.replace('_', ' ')}</td>
                          <td className="text-center p-2">
                            {perms.canView ? '✅' : '❌'}
                          </td>
                          <td className="text-center p-2">
                            {perms.canCreate ? '✅' : '❌'}
                          </td>
                          <td className="text-center p-2">
                            {perms.canUpdate ? '✅' : '❌'}
                          </td>
                          <td className="text-center p-2">
                            {perms.canDelete ? '✅' : '❌'}
                          </td>
                          <td className="text-center p-2">
                            {perms.canBulkUpdate ? '✅' : '❌'}
                          </td>
                          <td className="text-center p-2">
                            {perms.canArchive ? '✅' : '❌'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataTemplateDocumentation;
