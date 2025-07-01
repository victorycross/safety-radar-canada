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

interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  description: string;
}

interface TableInfo {
  name: string;
  description: string;
  columns: TableColumn[];
  relationships: string[];
  component: string;
  template: string;
  special?: string;
}

const DatabaseSchemaDocumentation = () => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => ({
      ...prev,
      [tableName]: !prev[tableName]
    }));
  };

  const coreEntities: TableInfo[] = [
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
        { name: 'is_major_city', type: 'boolean', nullable: false, description: 'Major city flag' },
        { name: 'population', type: 'integer', nullable: true, description: 'City population' },
        { name: 'coordinates', type: 'point', nullable: true, description: 'Geographic coordinates' }
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
        { name: 'is_active', type: 'boolean', nullable: true, description: 'Hub active status' },
        { name: 'flag_emoji', type: 'text', nullable: true, description: 'Country flag emoji' },
        { name: 'coordinates', type: 'point', nullable: true, description: 'Geographic coordinates' }
      ],
      relationships: ['hub_employee_locations', 'hub_incidents'],
      component: 'InternationalHubs.tsx, HubDetailPage.tsx',
      template: 'InternationalHubDataTemplate'
    }
  ];

  const securityEntities: TableInfo[] = [
    {
      name: 'national_security_risks',
      description: 'National security threat assessment and risk management registry',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'threat_category', type: 'text', nullable: false, description: 'Type of security threat' },
        { name: 'likelihood', type: 'integer', nullable: false, description: 'Probability score (1-5)' },
        { name: 'impact', type: 'integer', nullable: false, description: 'Impact severity (1-5)' },
        { name: 'preparedness_gap', type: 'integer', nullable: false, description: 'Preparedness gap (1-5)' },
        { name: 'rpn', type: 'integer', nullable: false, description: 'Risk Priority Number (auto-calculated)' },
        { name: 'priority', type: 'risk_priority', nullable: false, description: 'high | medium | low (auto-assigned)' },
        { name: 'assigned_lead', type: 'text', nullable: true, description: 'Responsible person/team' },
        { name: 'current_alerts', type: 'text', nullable: true, description: 'Active alerts/situations' },
        { name: 'notes', type: 'text', nullable: true, description: 'Additional notes' },
        { name: 'playbook', type: 'text', nullable: true, description: 'Response procedures (Markdown)' },
        { name: 'live_feeds', type: 'jsonb', nullable: true, description: 'Real-time data sources' },
        { name: 'last_reviewed', type: 'date', nullable: true, description: 'Last review date' }
      ],
      relationships: [],
      component: 'SecurityRiskRegisterTab.tsx, RiskDetailModal.tsx, RiskEditModal.tsx',
      template: 'SecurityRiskDataTemplate',
      special: 'Auto-calculates RPN and priority via database trigger'
    },
    {
      name: 'security_alerts_ingest',
      description: 'Cybersecurity and physical security alerts from external sources',
      columns: [
        { name: 'id', type: 'text', nullable: false, description: 'Required unique identifier' },
        { name: 'title', type: 'text', nullable: false, description: 'Alert title' },
        { name: 'category', type: 'text', nullable: false, description: 'cybersecurity | physical_security | intelligence | other' },
        { name: 'location', type: 'text', nullable: true, description: 'Default: Global' },
        { name: 'source', type: 'text', nullable: false, description: 'Default: CSE, never test' },
        { name: 'summary', type: 'text', nullable: true, description: 'Alert summary' },
        { name: 'link', type: 'text', nullable: true, description: 'Source URL' }
      ],
      relationships: [],
      component: 'SecurityDashboard.tsx',
      template: 'SecurityAlertDataTemplate'
    },
    {
      name: 'security_audit_log',
      description: 'Security audit trail for system actions and changes',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'user_id', type: 'uuid', nullable: true, description: 'User who performed action' },
        { name: 'action', type: 'text', nullable: false, description: 'Action performed' },
        { name: 'table_name', type: 'text', nullable: true, description: 'Affected table' },
        { name: 'record_id', type: 'text', nullable: true, description: 'Affected record ID' },
        { name: 'old_values', type: 'jsonb', nullable: true, description: 'Previous values' },
        { name: 'new_values', type: 'jsonb', nullable: true, description: 'New values' },
        { name: 'ip_address', type: 'inet', nullable: true, description: 'User IP address' },
        { name: 'user_agent', type: 'text', nullable: true, description: 'User browser/client' }
      ],
      relationships: [],
      component: 'SecurityDashboard.tsx',
      template: 'AuditLogTemplate'
    }
  ];

  const incidentEntities: TableInfo[] = [
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
        { name: 'verification_status', type: 'text', nullable: false, description: 'unverified | verified | false_alarm' },
        { name: 'confidence_score', type: 'double precision', nullable: true, description: 'Confidence level (0.0-1.0)' },
        { name: 'geographic_scope', type: 'text', nullable: true, description: 'Geographic impact scope' }
      ],
      relationships: ['provinces', 'geospatial_data', 'alert_correlations'],
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
        { name: 'source', type: 'text', nullable: true, description: 'Never test/empty' },
        { name: 'verification_status', type: 'text', nullable: true, description: 'Verification status' },
        { name: 'confidence_score', type: 'numeric', nullable: true, description: 'Confidence level' }
      ],
      relationships: ['international_hubs'],
      component: 'HubDetailPage.tsx',
      template: 'HubIncidentDataTemplate'
    },
    {
      name: 'geospatial_data',
      description: 'Geographic information for incidents and locations',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'incident_id', type: 'uuid', nullable: true, description: 'Related incident' },
        { name: 'latitude', type: 'double precision', nullable: true, description: 'Latitude coordinate' },
        { name: 'longitude', type: 'double precision', nullable: true, description: 'Longitude coordinate' },
        { name: 'affected_radius_km', type: 'double precision', nullable: true, description: 'Impact radius in km' },
        { name: 'population_impact', type: 'integer', nullable: true, description: 'Estimated affected population' },
        { name: 'administrative_area', type: 'text', nullable: true, description: 'Administrative region' },
        { name: 'geohash', type: 'text', nullable: true, description: 'Geospatial hash' }
      ],
      relationships: ['incidents'],
      component: 'GeoSpatialVisualization.tsx',
      template: 'GeospatialDataTemplate'
    },
    {
      name: 'alert_correlations',
      description: 'Relationships and correlations between different alerts and incidents',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'primary_incident_id', type: 'uuid', nullable: true, description: 'Primary incident' },
        { name: 'related_incident_id', type: 'uuid', nullable: true, description: 'Related incident' },
        { name: 'correlation_type', type: 'text', nullable: false, description: 'Type of correlation' },
        { name: 'confidence_score', type: 'double precision', nullable: false, description: 'Correlation confidence' }
      ],
      relationships: ['incidents'],
      component: 'AlertCorrelationAnalysis.tsx',
      template: 'CorrelationDataTemplate'
    }
  ];

  const alertEntities: TableInfo[] = [
    {
      name: 'weather_alerts_ingest',
      description: 'Weather-related emergency alerts and warnings',
      columns: [
        { name: 'id', type: 'text', nullable: false, description: 'Required unique identifier' },
        { name: 'event_type', type: 'text', nullable: true, description: 'Storm, flood, etc.' },
        { name: 'severity', type: 'text', nullable: true, description: 'minor | moderate | severe | extreme' },
        { name: 'onset', type: 'timestamp', nullable: true, description: 'ISO date string' },
        { name: 'expires', type: 'timestamp', nullable: true, description: 'ISO date string' },
        { name: 'description', type: 'text', nullable: true, description: 'Alert description' },
        { name: 'geometry_coordinates', type: 'jsonb', nullable: true, description: 'Geographic boundaries' }
      ],
      relationships: [],
      component: 'WeatherAlertsTab.tsx',
      template: 'WeatherAlertDataTemplate'
    },
    {
      name: 'immigration_travel_announcements',
      description: 'Immigration and travel policy announcements from government sources',
      columns: [
        { name: 'id', type: 'text', nullable: false, description: 'Required unique identifier' },
        { name: 'title', type: 'text', nullable: false, description: 'Announcement title' },
        { name: 'location', type: 'text', nullable: true, description: 'Default: Canada' },
        { name: 'source', type: 'text', nullable: false, description: 'Default: IRCC' },
        { name: 'announcement_type', type: 'text', nullable: true, description: 'policy_change | service_update | travel_advisory | other' },
        { name: 'content', type: 'text', nullable: true, description: 'Full announcement content' },
        { name: 'summary', type: 'text', nullable: true, description: 'Brief summary' },
        { name: 'category', type: 'text', nullable: true, description: 'Announcement category' }
      ],
      relationships: [],
      component: 'ImmigrationTravelTab.tsx',
      template: 'ImmigrationTravelDataTemplate'
    },
    {
      name: 'alert_sources',
      description: 'Configuration for external alert data sources and feeds',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'name', type: 'text', nullable: false, description: 'Source name' },
        { name: 'source_type', type: 'text', nullable: false, description: 'RSS | API | webhook' },
        { name: 'api_endpoint', type: 'text', nullable: false, description: 'Source URL/endpoint' },
        { name: 'is_active', type: 'boolean', nullable: false, description: 'Source enabled status' },
        { name: 'polling_interval', type: 'integer', nullable: false, description: 'Check frequency (seconds)' },
        { name: 'health_status', type: 'text', nullable: false, description: 'healthy | degraded | failed' },
        { name: 'configuration', type: 'jsonb', nullable: true, description: 'Source-specific config' }
      ],
      relationships: ['source_health_metrics'],
      component: 'SourceManagement.tsx',
      template: 'AlertSourceTemplate'
    },
    {
      name: 'alert_ingestion_queue',
      description: 'Processing queue for incoming alert data',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'source_id', type: 'uuid', nullable: true, description: 'Source that generated alert' },
        { name: 'raw_payload', type: 'jsonb', nullable: false, description: 'Raw alert data' },
        { name: 'processing_status', type: 'text', nullable: false, description: 'pending | processing | completed | failed' },
        { name: 'processing_attempts', type: 'integer', nullable: false, description: 'Number of processing attempts' },
        { name: 'error_message', type: 'text', nullable: true, description: 'Processing error details' },
        { name: 'processed_at', type: 'timestamp', nullable: true, description: 'Processing completion time' }
      ],
      relationships: ['alert_sources'],
      component: 'AlertProcessingDashboard.tsx',
      template: 'IngestionQueueTemplate'
    },
    {
      name: 'source_health_metrics',
      description: 'Health monitoring data for alert sources',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'source_id', type: 'uuid', nullable: true, description: 'Related alert source' },
        { name: 'timestamp', type: 'timestamp', nullable: false, description: 'Metric timestamp' },
        { name: 'success', type: 'boolean', nullable: false, description: 'Check success status' },
        { name: 'response_time_ms', type: 'integer', nullable: true, description: 'Response time in milliseconds' },
        { name: 'http_status_code', type: 'integer', nullable: true, description: 'HTTP response code' },
        { name: 'records_processed', type: 'integer', nullable: true, description: 'Number of records processed' },
        { name: 'error_message', type: 'text', nullable: true, description: 'Error details if failed' }
      ],
      relationships: ['alert_sources'],
      component: 'SourceHealthDashboard.tsx',
      template: 'HealthMetricsTemplate'
    },
    {
      name: 'alert_archive_log',
      description: 'Audit log for archived alerts and related actions',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'alert_id', type: 'text', nullable: false, description: 'Archived alert ID' },
        { name: 'alert_table', type: 'text', nullable: false, description: 'Source table name' },
        { name: 'action', type: 'text', nullable: false, description: 'Action performed' },
        { name: 'performed_by', type: 'uuid', nullable: false, description: 'User who performed action' },
        { name: 'reason', type: 'text', nullable: true, description: 'Reason for archiving' },
        { name: 'metadata', type: 'jsonb', nullable: true, description: 'Additional context' }
      ],
      relationships: [],
      component: 'AlertArchiveDashboard.tsx',
      template: 'ArchiveLogTemplate'
    }
  ];

  const employeeEntities: TableInfo[] = [
    {
      name: 'employee_locations',
      description: 'Employee distribution across Canadian cities with travel tracking',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'city_id', type: 'uuid', nullable: false, description: 'Foreign key to cities' },
        { name: 'province_id', type: 'uuid', nullable: false, description: 'Foreign key to provinces' },
        { name: 'home_base_count', type: 'integer', nullable: false, description: 'Employees based here (>= 0)' },
        { name: 'current_location_count', type: 'integer', nullable: false, description: 'Currently here (>= 0)' },
        { name: 'travel_away_count', type: 'integer', nullable: false, description: 'Traveling away (>= 0)' },
        { name: 'updated_by', type: 'text', nullable: true, description: 'Last updated by user/system' }
      ],
      relationships: ['cities', 'provinces', 'location_history'],
      component: 'BulkEmployeeManagement.tsx',
      template: 'EmployeeLocationDataTemplate'
    },
    {
      name: 'hub_employee_locations',
      description: 'Employee distribution at international hub locations',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'hub_id', type: 'uuid', nullable: false, description: 'Foreign key to international_hubs' },
        { name: 'home_base_count', type: 'integer', nullable: true, description: 'Home-based employees' },
        { name: 'current_location_count', type: 'integer', nullable: true, description: 'Currently present employees' },
        { name: 'travel_away_count', type: 'integer', nullable: true, description: 'Employees traveling away' },
        { name: 'updated_by', type: 'text', nullable: true, description: 'Last updated by' }
      ],
      relationships: ['international_hubs'],
      component: 'HubEmployeeManagement.tsx',
      template: 'HubEmployeeLocationTemplate'
    },
    {
      name: 'travel_records',
      description: 'Individual employee travel tracking and status',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'employee_id', type: 'text', nullable: false, description: 'Never TEST% or EMP00%' },
        { name: 'home_city_id', type: 'uuid', nullable: false, description: 'Home base city' },
        { name: 'current_city_id', type: 'uuid', nullable: true, description: 'Current location city' },
        { name: 'travel_status', type: 'text', nullable: false, description: 'home | traveling | away' },
        { name: 'travel_platform', type: 'text', nullable: true, description: 'Never test/manual' },
        { name: 'departure_date', type: 'timestamp', nullable: true, description: 'Travel start date' },
        { name: 'return_date', type: 'timestamp', nullable: true, description: 'Expected return date' },
        { name: 'emergency_contact_info', type: 'jsonb', nullable: true, description: 'Emergency contact details' }
      ],
      relationships: ['cities'],
      component: 'TravelIntegrationDashboard.tsx',
      template: 'TravelRecordDataTemplate'
    },
    {
      name: 'travel_integration_config',
      description: 'Configuration for travel platform integrations',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'platform_name', type: 'text', nullable: false, description: 'Integration platform name' },
        { name: 'api_endpoint', type: 'text', nullable: true, description: 'Platform API endpoint' },
        { name: 'is_active', type: 'boolean', nullable: false, description: 'Integration enabled status' },
        { name: 'sync_status', type: 'text', nullable: true, description: 'pending | syncing | completed | failed' },
        { name: 'sync_frequency_minutes', type: 'integer', nullable: true, description: 'Sync interval in minutes' },
        { name: 'last_sync_at', type: 'timestamp', nullable: true, description: 'Last successful sync' },
        { name: 'authentication_config', type: 'jsonb', nullable: true, description: 'Auth configuration' }
      ],
      relationships: [],
      component: 'TravelIntegrationDashboard.tsx',
      template: 'TravelIntegrationTemplate'
    }
  ];

  const systemEntities: TableInfo[] = [
    {
      name: 'profiles',
      description: 'User profile information and preferences',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key (matches auth.users.id)' },
        { name: 'email', type: 'text', nullable: true, description: 'User email address' },
        { name: 'full_name', type: 'text', nullable: true, description: 'User full name' }
      ],
      relationships: ['user_roles'],
      component: 'UserProfile.tsx',
      template: 'UserProfileTemplate'
    },
    {
      name: 'user_roles',
      description: 'Role-based access control for users',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'user_id', type: 'uuid', nullable: false, description: 'Foreign key to profiles/auth.users' },
        { name: 'role', type: 'app_role', nullable: false, description: 'admin | power_user | regular_user' },
        { name: 'created_by', type: 'uuid', nullable: true, description: 'User who assigned role' }
      ],
      relationships: ['profiles'],
      component: 'RoleManagement.tsx',
      template: 'UserRoleTemplate'
    },
    {
      name: 'employee_history',
      description: 'Historical record of employee count changes',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'province_id', type: 'uuid', nullable: false, description: 'Related province' },
        { name: 'employee_count', type: 'integer', nullable: false, description: 'New employee count' },
        { name: 'previous_count', type: 'integer', nullable: true, description: 'Previous count' },
        { name: 'change_reason', type: 'text', nullable: true, description: 'Reason for change' },
        { name: 'changed_by', type: 'text', nullable: true, description: 'User who made change' }
      ],
      relationships: ['provinces'],
      component: 'EmployeeHistoryDashboard.tsx',
      template: 'EmployeeHistoryTemplate'
    },
    {
      name: 'location_history',
      description: 'Historical tracking of location-based employee changes',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key' },
        { name: 'city_id', type: 'uuid', nullable: false, description: 'Related city' },
        { name: 'home_base_count', type: 'integer', nullable: false, description: 'New home base count' },
        { name: 'current_location_count', type: 'integer', nullable: false, description: 'New current location count' },
        { name: 'travel_away_count', type: 'integer', nullable: false, description: 'New travel away count' },
        { name: 'previous_home_base_count', type: 'integer', nullable: true, description: 'Previous home base count' },
        { name: 'previous_current_location_count', type: 'integer', nullable: true, description: 'Previous current count' },
        { name: 'previous_travel_away_count', type: 'integer', nullable: true, description: 'Previous travel count' },
        { name: 'change_type', type: 'text', nullable: false, description: 'Type of change made' },
        { name: 'change_reason', type: 'text', nullable: true, description: 'Reason for change' },
        { name: 'changed_by', type: 'text', nullable: true, description: 'User who made change' },
        { name: 'data_source', type: 'text', nullable: true, description: 'Source of change' }
      ],
      relationships: ['cities'],
      component: 'LocationHistoryDashboard.tsx',
      template: 'LocationHistoryTemplate'
    },
    {
      name: 'data_sync_status',
      description: 'Synchronization status tracking for external data sources',
      columns: [
        { name: 'source', type: 'varchar', nullable: false, description: 'Data source identifier' },
        { name: 'status', type: 'varchar', nullable: true, description: 'Sync status' },
        { name: 'last_sync_time', type: 'timestamp', nullable: true, description: 'Last sync timestamp' },
        { name: 'message', type: 'text', nullable: true, description: 'Status message or error' }
      ],
      relationships: [],
      component: 'DataSyncDashboard.tsx',
      template: 'DataSyncTemplate'
    }
  ];

  const downloadSchemaCSV = () => {
    const allTables = [
      ...coreEntities,
      ...securityEntities,
      ...incidentEntities,
      ...alertEntities,
      ...employeeEntities,
      ...systemEntities
    ];

    const csvContent = `Table Name,Description,Primary Key,Foreign Keys,Component,Template,Special Features
${allTables
  .map(table => 
    `"${table.name}","${table.description}","id","${table.relationships.join(', ')}","${table.component}","${table.template}","${table.special || 'N/A'}"`
  ).join('\n')}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database-schema-overview-25-tables.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const TableCard = ({ table }: { table: TableInfo }) => (
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
                {table.special && <Badge variant="secondary">Special</Badge>}
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
                  {table.columns.map((col, idx) => (
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
                    {table.relationships.map((rel) => (
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
                  {table.special && (
                    <div className="text-sm">
                      <span className="font-medium">Special Features:</span> {table.special}
                    </div>
                  )}
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
            Comprehensive documentation of all 25 database tables with relationships, security policies, and code mappings
          </p>
        </div>
        <Button onClick={downloadSchemaCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Schema CSV
        </Button>
      </div>

      <Tabs defaultValue="core" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="core">Core Entities</TabsTrigger>
          <TabsTrigger value="security">Security & Risk</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="alerts">Alert Sources</TabsTrigger>
          <TabsTrigger value="employees">Employee Data</TabsTrigger>
          <TabsTrigger value="system">System & Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Core Geographic & Hub Entities (3 tables)</h3>
            <p className="text-sm text-muted-foreground">
              Primary location and organizational structure tables for provinces, cities, and international hubs
            </p>
          </div>
          {coreEntities.map(table => (
            <TableCard key={table.name} table={table} />
          ))}
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Security & Risk Management (3 tables)</h3>
            <p className="text-sm text-muted-foreground">
              National security risk assessment, security alerts, and audit trail management
            </p>
          </div>
          {securityEntities.map(table => (
            <TableCard key={table.name} table={table} />
          ))}
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Incident Management (4 tables)</h3>
            <p className="text-sm text-muted-foreground">
              Security incident tracking, geographic data, and correlation analysis
            </p>
          </div>
          {incidentEntities.map(table => (
            <TableCard key={table.name} table={table} />
          ))}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">External Alert Sources (7 tables)</h3>
            <p className="text-sm text-muted-foreground">
              External data ingestion, processing, monitoring, and archival from various alert sources
            </p>
          </div>
          {alertEntities.map(table => (
            <TableCard key={table.name} table={table} />
          ))}
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Employee & Travel Data (4 tables)</h3>
            <p className="text-sm text-muted-foreground">
              Employee location tracking, travel management, and integration platforms
            </p>
          </div>
          {employeeEntities.map(table => (
            <TableCard key={table.name} table={table} />
          ))}
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">System & Audit Tables (5 tables)</h3>
            <p className="text-sm text-muted-foreground">
              User management, role-based access control, historical tracking, and system synchronization
            </p>
          </div>
          {systemEntities.map(table => (
            <TableCard key={table.name} table={table} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseSchemaDocumentation;
