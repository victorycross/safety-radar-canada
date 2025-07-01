
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
  FileText,
  Calendar,
  GitBranch,
  Activity
} from 'lucide-react';

interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  description: string;
  constraints?: string[];
}

interface TableInfo {
  name: string;
  description: string;
  columns: TableColumn[];
  relationships: string[];
  foreignKeys: string[];
  component: string;
  template: string;
  special?: string;
  rlsPolicies?: string[];
  triggers?: string[];
}

const DatabaseSchemaDocumentation = () => {
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({});

  const schemaVersion = "2.0.0";
  const lastUpdated = "January 2025";
  const totalTables = 25;

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
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'] },
        { name: 'name', type: 'text', nullable: false, description: 'Province/territory name', constraints: ['NOT NULL'] },
        { name: 'code', type: 'text', nullable: false, description: '2-letter code (ON, QC, etc.)', constraints: ['NOT NULL', 'UNIQUE'] },
        { name: 'alert_level', type: 'text', nullable: false, description: 'normal | warning | severe', constraints: ['NOT NULL', 'DEFAULT normal'] },
        { name: 'employee_count', type: 'integer', nullable: false, description: 'Total employees (0-50000)', constraints: ['NOT NULL', 'DEFAULT 0', 'CHECK >= 0'] },
        { name: 'created_at', type: 'timestamp with time zone', nullable: false, description: 'Creation timestamp', constraints: ['DEFAULT now()'] },
        { name: 'updated_at', type: 'timestamp with time zone', nullable: false, description: 'Last update timestamp', constraints: ['DEFAULT now()'] }
      ],
      relationships: ['cities', 'employee_locations', 'incidents', 'employee_history'],
      foreignKeys: [],
      component: 'CanadianProvincesGrid, ProvinceCard.tsx, ProvinceOverlay.tsx',
      template: 'ProvinceDataTemplate',
      rlsPolicies: ['Allow public read of provinces', 'Admins can manage provinces'],
      triggers: ['validate_employee_count_change', 'log_employee_count_change']
    },
    {
      name: 'cities',
      description: 'Cities within provinces for employee location tracking',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'province_id', type: 'uuid', nullable: false, description: 'Foreign key to provinces', constraints: ['NOT NULL', 'REFERENCES provinces(id)'] },
        { name: 'name', type: 'text', nullable: false, description: 'City name', constraints: ['NOT NULL'] },
        { name: 'code', type: 'text', nullable: false, description: 'City code', constraints: ['NOT NULL'] },
        { name: 'is_major_city', type: 'boolean', nullable: false, description: 'Major city flag', constraints: ['DEFAULT false'] },
        { name: 'population', type: 'integer', nullable: true, description: 'City population' },
        { name: 'coordinates', type: 'point', nullable: true, description: 'Geographic coordinates' },
        { name: 'created_at', type: 'timestamp with time zone', nullable: false, description: 'Creation timestamp', constraints: ['DEFAULT now()'] },
        { name: 'updated_at', type: 'timestamp with time zone', nullable: false, description: 'Last update timestamp', constraints: ['DEFAULT now()'] }
      ],
      relationships: ['provinces', 'employee_locations', 'travel_records', 'location_history'],
      foreignKeys: ['province_id -> provinces.id'],
      component: 'CityLocationManagement.tsx, CompactLocationCard.tsx',
      template: 'BulkEmployeeUpdateTemplate',
      rlsPolicies: ['Allow read access to cities', 'Admins can manage cities']
    },
    {
      name: 'international_hubs',
      description: 'International office locations outside Canada',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'name', type: 'text', nullable: false, description: 'Hub name', constraints: ['NOT NULL'] },
        { name: 'country', type: 'text', nullable: false, description: 'Country name', constraints: ['NOT NULL'] },
        { name: 'code', type: 'text', nullable: false, description: 'Hub identifier code', constraints: ['NOT NULL'] },
        { name: 'employee_count', type: 'integer', nullable: true, description: 'Hub employees (0-1000)', constraints: ['DEFAULT 0'] },
        { name: 'alert_level', type: 'text', nullable: true, description: 'normal | warning | severe', constraints: ['DEFAULT normal'] },
        { name: 'is_active', type: 'boolean', nullable: true, description: 'Hub active status', constraints: ['DEFAULT true'] },
        { name: 'flag_emoji', type: 'text', nullable: true, description: 'Country flag emoji' },
        { name: 'coordinates', type: 'point', nullable: true, description: 'Geographic coordinates' },
        { name: 'local_incidents', type: 'integer', nullable: true, description: 'Number of local incidents', constraints: ['DEFAULT 0'] },
        { name: 'travel_warnings', type: 'integer', nullable: true, description: 'Number of travel warnings', constraints: ['DEFAULT 0'] }
      ],
      relationships: ['hub_employee_locations', 'hub_incidents'],
      foreignKeys: [],
      component: 'InternationalHubs.tsx, HubDetailPage.tsx, GlobeMap.tsx, SimpleGlobeMap.tsx',
      template: 'InternationalHubDataTemplate',
      rlsPolicies: ['Allow authenticated users to view international hubs', 'Allow admin users to manage international hubs'],
      triggers: ['sync_hub_totals', 'update_hub_alert_level_on_incident']
    }
  ];

  const securityEntities: TableInfo[] = [
    {
      name: 'national_security_risks',
      description: 'National security threat assessment and risk management registry',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'threat_category', type: 'text', nullable: false, description: 'Type of security threat', constraints: ['NOT NULL'] },
        { name: 'likelihood', type: 'integer', nullable: false, description: 'Probability score (1-5)', constraints: ['NOT NULL', 'CHECK BETWEEN 1 AND 5'] },
        { name: 'impact', type: 'integer', nullable: false, description: 'Impact severity (1-5)', constraints: ['NOT NULL', 'CHECK BETWEEN 1 AND 5'] },
        { name: 'preparedness_gap', type: 'integer', nullable: false, description: 'Preparedness gap (1-5)', constraints: ['NOT NULL', 'CHECK BETWEEN 1 AND 5'] },
        { name: 'rpn', type: 'integer', nullable: false, description: 'Risk Priority Number (auto-calculated)', constraints: ['DEFAULT 0'] },
        { name: 'priority', type: 'risk_priority', nullable: false, description: 'high | medium | low (auto-assigned)', constraints: ['DEFAULT medium'] },
        { name: 'assigned_lead', type: 'text', nullable: true, description: 'Responsible person/team' },
        { name: 'current_alerts', type: 'text', nullable: true, description: 'Active alerts/situations' },
        { name: 'notes', type: 'text', nullable: true, description: 'Additional notes' },
        { name: 'playbook', type: 'text', nullable: true, description: 'Response procedures (Markdown)' },
        { name: 'live_feeds', type: 'jsonb', nullable: true, description: 'Real-time data sources', constraints: ['DEFAULT []'] },
        { name: 'last_reviewed', type: 'date', nullable: true, description: 'Last review date', constraints: ['DEFAULT CURRENT_DATE'] }
      ],
      relationships: [],
      foreignKeys: [],
      component: 'SecurityRiskRegisterTab.tsx, RiskDetailModal.tsx, RiskEditModal.tsx',
      template: 'SecurityRiskDataTemplate',
      special: 'Auto-calculates RPN and priority via database trigger',
      rlsPolicies: ['Authenticated users can view security risks', 'Admins can manage all security risks', 'Power users can read and update notes'],
      triggers: ['calculate_rpn_and_priority']
    },
    {
      name: 'security_alerts_ingest',
      description: 'Cybersecurity and physical security alerts from external sources',
      columns: [
        { name: 'id', type: 'text', nullable: false, description: 'Required unique identifier', constraints: ['PRIMARY KEY', 'NOT NULL'] },
        { name: 'title', type: 'text', nullable: false, description: 'Alert title', constraints: ['NOT NULL'] },
        { name: 'category', type: 'text', nullable: false, description: 'cybersecurity | physical_security | intelligence | other', constraints: ['NOT NULL', 'DEFAULT cybersecurity'] },
        { name: 'location', type: 'text', nullable: true, description: 'Alert location', constraints: ['DEFAULT Global'] },
        { name: 'source', type: 'text', nullable: false, description: 'Alert source', constraints: ['NOT NULL', 'DEFAULT CSE'] },
        { name: 'summary', type: 'text', nullable: true, description: 'Alert summary' },
        { name: 'link', type: 'text', nullable: true, description: 'Source URL' },
        { name: 'pub_date', type: 'timestamp with time zone', nullable: true, description: 'Publication date' },
        { name: 'raw_data', type: 'jsonb', nullable: true, description: 'Raw alert data' },
        { name: 'archived_at', type: 'timestamp with time zone', nullable: true, description: 'Archive timestamp' },
        { name: 'archived_by', type: 'uuid', nullable: true, description: 'User who archived' },
        { name: 'archive_reason', type: 'text', nullable: true, description: 'Reason for archiving' }
      ],
      relationships: [],
      foreignKeys: [],
      component: 'SecurityDashboard.tsx, AlertCard.tsx, UniversalAlertCard.tsx',
      template: 'SecurityAlertDataTemplate',
      rlsPolicies: ['Public read access (no RLS policies defined)']
    },
    {
      name: 'security_audit_log',
      description: 'Security audit trail for system actions and changes',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'user_id', type: 'uuid', nullable: true, description: 'User who performed action' },
        { name: 'action', type: 'text', nullable: false, description: 'Action performed', constraints: ['NOT NULL'] },
        { name: 'table_name', type: 'text', nullable: true, description: 'Affected table' },
        { name: 'record_id', type: 'text', nullable: true, description: 'Affected record ID' },
        { name: 'old_values', type: 'jsonb', nullable: true, description: 'Previous values' },
        { name: 'new_values', type: 'jsonb', nullable: true, description: 'New values' },
        { name: 'ip_address', type: 'inet', nullable: true, description: 'User IP address' },
        { name: 'user_agent', type: 'text', nullable: true, description: 'User browser/client' },
        { name: 'created_at', type: 'timestamp with time zone', nullable: true, description: 'Audit timestamp', constraints: ['DEFAULT now()'] }
      ],
      relationships: [],
      foreignKeys: [],
      component: 'SecurityDashboard.tsx',
      template: 'AuditLogTemplate',
      rlsPolicies: ['Admins can view security audit logs', 'System can insert audit logs'],
      special: 'Insert-only table for security auditing'
    }
  ];

  const incidentEntities: TableInfo[] = [
    {
      name: 'incidents',
      description: 'Security incidents within Canadian provinces',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'title', type: 'text', nullable: false, description: 'Incident title', constraints: ['NOT NULL'] },
        { name: 'description', type: 'text', nullable: false, description: 'Detailed description', constraints: ['NOT NULL'] },
        { name: 'alert_level', type: 'text', nullable: false, description: 'normal | warning | severe', constraints: ['NOT NULL', 'DEFAULT normal'] },
        { name: 'province_id', type: 'uuid', nullable: false, description: 'Foreign key to provinces', constraints: ['NOT NULL', 'REFERENCES provinces(id)'] },
        { name: 'source', type: 'text', nullable: false, description: 'Incident source', constraints: ['NOT NULL'] },
        { name: 'verification_status', type: 'text', nullable: false, description: 'unverified | verified | false_alarm', constraints: ['NOT NULL', 'DEFAULT unverified'] },
        { name: 'confidence_score', type: 'double precision', nullable: true, description: 'Confidence level (0.0-1.0)', constraints: ['DEFAULT 0.5'] },
        { name: 'geographic_scope', type: 'text', nullable: true, description: 'Geographic impact scope' },
        { name: 'severity_numeric', type: 'integer', nullable: true, description: 'Numeric severity (1-5)', constraints: ['DEFAULT 1'] },
        { name: 'correlation_id', type: 'uuid', nullable: true, description: 'Correlation identifier' },
        { name: 'recommended_action', type: 'text', nullable: true, description: 'Recommended response action' },
        { name: 'raw_payload', type: 'jsonb', nullable: true, description: 'Original data payload' },
        { name: 'archived_at', type: 'timestamp with time zone', nullable: true, description: 'Archive timestamp' },
        { name: 'archived_by', type: 'uuid', nullable: true, description: 'User who archived' },
        { name: 'archive_reason', type: 'text', nullable: true, description: 'Reason for archiving' }
      ],
      relationships: ['provinces', 'geospatial_data', 'alert_correlations'],
      foreignKeys: ['province_id -> provinces.id'],
      component: 'IncidentsList.tsx, EnhancedIncidentsList.tsx, IncidentForm.tsx, EnhancedIncidentForm.tsx',
      template: 'IncidentDataTemplate',
      rlsPolicies: ['Allow public read of incidents', 'Power users can manage incidents'],
      triggers: ['update_province_alert_level_on_incident', 'sync_province_alert_level_on_archive']
    },
    {
      name: 'hub_incidents',
      description: 'Security incidents at international hubs',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'hub_id', type: 'uuid', nullable: false, description: 'Foreign key to international_hubs', constraints: ['NOT NULL', 'REFERENCES international_hubs(id)'] },
        { name: 'title', type: 'text', nullable: false, description: 'Incident title', constraints: ['NOT NULL'] },
        { name: 'description', type: 'text', nullable: true, description: 'Incident description' },
        { name: 'alert_level', type: 'text', nullable: true, description: 'normal | warning | severe', constraints: ['DEFAULT normal'] },
        { name: 'source', type: 'text', nullable: true, description: 'Incident source', constraints: ['DEFAULT manual'] },
        { name: 'verification_status', type: 'text', nullable: true, description: 'Verification status', constraints: ['DEFAULT unverified'] },
        { name: 'confidence_score', type: 'numeric', nullable: true, description: 'Confidence level', constraints: ['DEFAULT 0.5'] },
        { name: 'geographic_scope', type: 'text', nullable: true, description: 'Geographic scope' },
        { name: 'recommended_action', type: 'text', nullable: true, description: 'Recommended action' },
        { name: 'raw_payload', type: 'jsonb', nullable: true, description: 'Raw incident data' },
        { name: 'archived_at', type: 'timestamp with time zone', nullable: true, description: 'Archive timestamp' },
        { name: 'archived_by', type: 'uuid', nullable: true, description: 'User who archived' },
        { name: 'archive_reason', type: 'text', nullable: true, description: 'Archive reason' }
      ],
      relationships: ['international_hubs'],
      foreignKeys: ['hub_id -> international_hubs.id'],
      component: 'HubDetailPage.tsx, RecentHubIncidentsCard.tsx',
      template: 'HubIncidentDataTemplate',
      rlsPolicies: ['Allow authenticated users to view hub incidents', 'Allow admin users to manage hub incidents'],
      triggers: ['update_hub_alert_level_on_incident', 'sync_hub_alert_level_on_archive']
    },
    {
      name: 'geospatial_data',
      description: 'Geographic information for incidents and locations',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'incident_id', type: 'uuid', nullable: true, description: 'Related incident', constraints: ['REFERENCES incidents(id)'] },
        { name: 'latitude', type: 'double precision', nullable: true, description: 'Latitude coordinate' },
        { name: 'longitude', type: 'double precision', nullable: true, description: 'Longitude coordinate' },
        { name: 'affected_radius_km', type: 'double precision', nullable: true, description: 'Impact radius in km' },
        { name: 'population_impact', type: 'integer', nullable: true, description: 'Estimated affected population' },
        { name: 'administrative_area', type: 'text', nullable: true, description: 'Administrative region' },
        { name: 'geohash', type: 'text', nullable: true, description: 'Geospatial hash' },
        { name: 'country_code', type: 'text', nullable: true, description: 'Country code', constraints: ['DEFAULT CA'] }
      ],
      relationships: ['incidents'],
      foreignKeys: ['incident_id -> incidents.id'],
      component: 'GeoSpatialVisualization.tsx, CanadaMap.tsx',
      template: 'GeospatialDataTemplate',
      rlsPolicies: ['Authenticated users can view geospatial data', 'Power users can manage geospatial data']
    },
    {
      name: 'alert_correlations',
      description: 'Relationships and correlations between different alerts and incidents',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'primary_incident_id', type: 'uuid', nullable: true, description: 'Primary incident', constraints: ['REFERENCES incidents(id)'] },
        { name: 'related_incident_id', type: 'uuid', nullable: true, description: 'Related incident', constraints: ['REFERENCES incidents(id)'] },
        { name: 'correlation_type', type: 'text', nullable: false, description: 'Type of correlation', constraints: ['NOT NULL'] },
        { name: 'confidence_score', type: 'double precision', nullable: false, description: 'Correlation confidence', constraints: ['NOT NULL', 'DEFAULT 0.0'] }
      ],
      relationships: ['incidents'],
      foreignKeys: ['primary_incident_id -> incidents.id', 'related_incident_id -> incidents.id'],
      component: 'AlertCorrelationAnalysis.tsx',
      template: 'CorrelationDataTemplate',
      rlsPolicies: ['Authenticated users can view alert correlations', 'Power users can manage alert correlations']
    }
  ];

  const alertEntities: TableInfo[] = [
    {
      name: 'weather_alerts_ingest',
      description: 'Weather-related emergency alerts and warnings',
      columns: [
        { name: 'id', type: 'text', nullable: false, description: 'Required unique identifier', constraints: ['PRIMARY KEY'] },
        { name: 'event_type', type: 'text', nullable: true, description: 'Storm, flood, etc.' },
        { name: 'severity', type: 'text', nullable: true, description: 'minor | moderate | severe | extreme' },
        { name: 'onset', type: 'timestamp with time zone', nullable: true, description: 'Event start time' },
        { name: 'expires', type: 'timestamp with time zone', nullable: true, description: 'Event expiration time' },
        { name: 'description', type: 'text', nullable: true, description: 'Alert description' },
        { name: 'geometry_coordinates', type: 'jsonb', nullable: true, description: 'Geographic boundaries' },
        { name: 'raw_data', type: 'jsonb', nullable: true, description: 'Raw weather data' },
        { name: 'archived_at', type: 'timestamp with time zone', nullable: true, description: 'Archive timestamp' },
        { name: 'archived_by', type: 'uuid', nullable: true, description: 'User who archived' },
        { name: 'archive_reason', type: 'text', nullable: true, description: 'Archive reason' }
      ],
      relationships: [],
      foreignKeys: [],
      component: 'WeatherAlertsTab.tsx, BCAlertsCard.tsx, BCAlertslist.tsx',
      template: 'WeatherAlertDataTemplate',
      rlsPolicies: ['Allow authenticated users to select weather alerts', 'Allow authenticated users to insert weather alerts', 'Allow authenticated users to update their own weather alerts', 'Allow authenticated users to delete their own weather alerts']
    },
    {
      name: 'immigration_travel_announcements',
      description: 'Immigration and travel policy announcements from government sources',
      columns: [
        { name: 'id', type: 'text', nullable: false, description: 'Required unique identifier', constraints: ['PRIMARY KEY'] },
        { name: 'title', type: 'text', nullable: false, description: 'Announcement title', constraints: ['NOT NULL'] },
        { name: 'location', type: 'text', nullable: true, description: 'Announcement location', constraints: ['DEFAULT Canada'] },
        { name: 'source', type: 'text', nullable: false, description: 'Announcement source', constraints: ['NOT NULL', 'DEFAULT IRCC'] },
        { name: 'announcement_type', type: 'text', nullable: true, description: 'policy_change | service_update | travel_advisory | other' },
        { name: 'content', type: 'text', nullable: true, description: 'Full announcement content' },
        { name: 'summary', type: 'text', nullable: true, description: 'Brief summary' },
        { name: 'category', type: 'text', nullable: true, description: 'Announcement category' },
        { name: 'link', type: 'text', nullable: true, description: 'Source URL' },
        { name: 'pub_date', type: 'timestamp with time zone', nullable: true, description: 'Publication date' },
        { name: 'raw_data', type: 'jsonb', nullable: true, description: 'Raw announcement data' },
        { name: 'archived_at', type: 'timestamp with time zone', nullable: true, description: 'Archive timestamp' },
        { name: 'archived_by', type: 'uuid', nullable: true, description: 'User who archived' },
        { name: 'archive_reason', type: 'text', nullable: true, description: 'Archive reason' }
      ],
      relationships: [],
      foreignKeys: [],
      component: 'ImmigrationTravelTab.tsx',
      template: 'ImmigrationTravelDataTemplate',
      rlsPolicies: ['Anyone can view immigration travel announcements', 'Admins can insert immigration travel announcements', 'Admins can update immigration travel announcements', 'Admins can delete immigration travel announcements']
    },
    {
      name: 'alert_sources',
      description: 'Configuration for external alert data sources and feeds',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'name', type: 'text', nullable: false, description: 'Source name', constraints: ['NOT NULL'] },
        { name: 'source_type', type: 'text', nullable: false, description: 'RSS | API | webhook', constraints: ['NOT NULL'] },
        { name: 'api_endpoint', type: 'text', nullable: false, description: 'Source URL/endpoint', constraints: ['NOT NULL'] },
        { name: 'is_active', type: 'boolean', nullable: false, description: 'Source enabled status', constraints: ['NOT NULL', 'DEFAULT true'] },
        { name: 'polling_interval', type: 'integer', nullable: false, description: 'Check frequency (seconds)', constraints: ['NOT NULL', 'DEFAULT 300'] },
        { name: 'health_status', type: 'text', nullable: false, description: 'healthy | degraded | failed', constraints: ['NOT NULL', 'DEFAULT unknown'] },
        { name: 'configuration', type: 'jsonb', nullable: true, description: 'Source-specific config' },
        { name: 'description', type: 'text', nullable: true, description: 'Source description' },
        { name: 'last_poll_at', type: 'timestamp with time zone', nullable: true, description: 'Last polling time' }
      ],
      relationships: ['source_health_metrics', 'alert_ingestion_queue'],
      foreignKeys: [],
      component: 'SourceManagement.tsx, AddSourceModal.tsx, EnhancedSourceCard.tsx',
      template: 'AlertSourceTemplate',
      rlsPolicies: ['Admins can manage alert sources', 'Admins can view alert sources'],
      triggers: ['update_source_health']
    },
    {
      name: 'alert_ingestion_queue',
      description: 'Processing queue for incoming alert data',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'source_id', type: 'uuid', nullable: true, description: 'Source that generated alert', constraints: ['REFERENCES alert_sources(id)'] },
        { name: 'raw_payload', type: 'jsonb', nullable: false, description: 'Raw alert data', constraints: ['NOT NULL'] },
        { name: 'processing_status', type: 'text', nullable: false, description: 'pending | processing | completed | failed', constraints: ['NOT NULL', 'DEFAULT pending'] },
        { name: 'processing_attempts', type: 'integer', nullable: false, description: 'Number of processing attempts', constraints: ['NOT NULL', 'DEFAULT 0'] },
        { name: 'error_message', type: 'text', nullable: true, description: 'Processing error details' },
        { name: 'processed_at', type: 'timestamp with time zone', nullable: true, description: 'Processing completion time' }
      ],
      relationships: ['alert_sources'],
      foreignKeys: ['source_id -> alert_sources.id'],
      component: 'AlertProcessingDashboard.tsx',
      template: 'IngestionQueueTemplate',
      rlsPolicies: ['Admins can manage alert ingestion queue']
    },
    {
      name: 'source_health_metrics',
      description: 'Health monitoring data for alert sources',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'source_id', type: 'uuid', nullable: true, description: 'Related alert source', constraints: ['REFERENCES alert_sources(id)'] },
        { name: 'timestamp', type: 'timestamp with time zone', nullable: false, description: 'Metric timestamp', constraints: ['NOT NULL', 'DEFAULT now()'] },
        { name: 'success', type: 'boolean', nullable: false, description: 'Check success status', constraints: ['NOT NULL'] },
        { name: 'response_time_ms', type: 'integer', nullable: true, description: 'Response time in milliseconds' },
        { name: 'http_status_code', type: 'integer', nullable: true, description: 'HTTP response code' },
        { name: 'records_processed', type: 'integer', nullable: true, description: 'Number of records processed', constraints: ['DEFAULT 0'] },
        { name: 'error_message', type: 'text', nullable: true, description: 'Error details if failed' }
      ],
      relationships: ['alert_sources'],
      foreignKeys: ['source_id -> alert_sources.id'],
      component: 'SourceHealthDashboard.tsx',
      template: 'HealthMetricsTemplate',
      rlsPolicies: ['Admins can view health metrics', 'System can insert health metrics']
    },
    {
      name: 'alert_archive_log',
      description: 'Audit log for archived alerts and related actions',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'alert_id', type: 'text', nullable: false, description: 'Archived alert ID', constraints: ['NOT NULL'] },
        { name: 'alert_table', type: 'text', nullable: false, description: 'Source table name', constraints: ['NOT NULL'] },
        { name: 'action', type: 'text', nullable: false, description: 'Action performed', constraints: ['NOT NULL'] },
        { name: 'performed_by', type: 'uuid', nullable: false, description: 'User who performed action', constraints: ['NOT NULL'] },
        { name: 'reason', type: 'text', nullable: true, description: 'Reason for archiving' },
        { name: 'metadata', type: 'jsonb', nullable: true, description: 'Additional context' }
      ],
      relationships: [],
      foreignKeys: [],
      component: 'AlertArchiveDashboard.tsx',
      template: 'ArchiveLogTemplate',
      rlsPolicies: ['Admin and power users can view archive log', 'Admin and power users can insert archive log']
    }
  ];

  const employeeEntities: TableInfo[] = [
    {
      name: 'employee_locations',
      description: 'Employee distribution across Canadian cities with travel tracking',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'city_id', type: 'uuid', nullable: false, description: 'Foreign key to cities', constraints: ['NOT NULL', 'REFERENCES cities(id)'] },
        { name: 'province_id', type: 'uuid', nullable: false, description: 'Foreign key to provinces', constraints: ['NOT NULL', 'REFERENCES provinces(id)'] },
        { name: 'home_base_count', type: 'integer', nullable: false, description: 'Employees based here (>= 0)', constraints: ['NOT NULL', 'DEFAULT 0', 'CHECK >= 0'] },
        { name: 'current_location_count', type: 'integer', nullable: false, description: 'Currently here (>= 0)', constraints: ['NOT NULL', 'DEFAULT 0', 'CHECK >= 0'] },
        { name: 'travel_away_count', type: 'integer', nullable: false, description: 'Traveling away (>= 0)', constraints: ['NOT NULL', 'DEFAULT 0', 'CHECK >= 0'] },
        { name: 'updated_by', type: 'text', nullable: true, description: 'Last updated by user/system', constraints: ['DEFAULT system'] },
        { name: 'last_updated_at', type: 'timestamp with time zone', nullable: false, description: 'Last update timestamp', constraints: ['DEFAULT now()'] }
      ],
      relationships: ['cities', 'provinces', 'location_history'],
      foreignKeys: ['city_id -> cities.id', 'province_id -> provinces.id'],
      component: 'BulkEmployeeManagement.tsx, BulkEmployeeUpdateSection.tsx',
      template: 'EmployeeLocationDataTemplate',
      rlsPolicies: ['Allow read access to employee locations', 'Power users can manage employee locations'],
      triggers: ['sync_province_totals', 'log_location_change']
    },
    {
      name: 'hub_employee_locations',
      description: 'Employee distribution at international hub locations',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'hub_id', type: 'uuid', nullable: false, description: 'Foreign key to international_hubs', constraints: ['NOT NULL', 'REFERENCES international_hubs(id)'] },
        { name: 'home_base_count', type: 'integer', nullable: true, description: 'Home-based employees', constraints: ['DEFAULT 0'] },
        { name: 'current_location_count', type: 'integer', nullable: true, description: 'Currently present employees', constraints: ['DEFAULT 0'] },
        { name: 'travel_away_count', type: 'integer', nullable: true, description: 'Employees traveling away', constraints: ['DEFAULT 0'] },
        { name: 'updated_by', type: 'text', nullable: true, description: 'Last updated by', constraints: ['DEFAULT system'] }
      ],
      relationships: ['international_hubs'],
      foreignKeys: ['hub_id -> international_hubs.id'],
      component: 'HubEmployeeManagement.tsx, BulkHubOperations.tsx',
      template: 'HubEmployeeLocationTemplate',
      rlsPolicies: ['Allow authenticated users to view hub employee locations', 'Allow admin users to manage hub employee locations'],
      triggers: ['sync_hub_totals']
    },
    {
      name: 'travel_records',
      description: 'Individual employee travel tracking and status',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'employee_id', type: 'text', nullable: false, description: 'Employee identifier', constraints: ['NOT NULL'] },
        { name: 'home_city_id', type: 'uuid', nullable: false, description: 'Home base city', constraints: ['NOT NULL', 'REFERENCES cities(id)'] },
        { name: 'current_city_id', type: 'uuid', nullable: true, description: 'Current location city', constraints: ['REFERENCES cities(id)'] },
        { name: 'travel_status', type: 'text', nullable: false, description: 'home | traveling | away', constraints: ['NOT NULL', 'DEFAULT home'] },
        { name: 'travel_platform', type: 'text', nullable: true, description: 'Travel booking platform' },
        { name: 'departure_date', type: 'timestamp with time zone', nullable: true, description: 'Travel start date' },
        { name: 'return_date', type: 'timestamp with time zone', nullable: true, description: 'Expected return date' },
        { name: 'emergency_contact_info', type: 'jsonb', nullable: true, description: 'Emergency contact details' },
        { name: 'external_booking_id', type: 'text', nullable: true, description: 'External booking reference' }
      ],
      relationships: ['cities'],
      foreignKeys: ['home_city_id -> cities.id', 'current_city_id -> cities.id'],
      component: 'TravelIntegrationDashboard.tsx',
      template: 'TravelRecordDataTemplate',
      rlsPolicies: ['Allow read access to travel records', 'Power users can manage travel records']
    },
    {
      name: 'travel_integration_config',
      description: 'Configuration for travel platform integrations',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'platform_name', type: 'text', nullable: false, description: 'Integration platform name', constraints: ['NOT NULL'] },
        { name: 'api_endpoint', type: 'text', nullable: true, description: 'Platform API endpoint' },
        { name: 'is_active', type: 'boolean', nullable: false, description: 'Integration enabled status', constraints: ['NOT NULL', 'DEFAULT false'] },
        { name: 'sync_status', type: 'text', nullable: true, description: 'pending | syncing | completed | failed', constraints: ['DEFAULT pending'] },
        { name: 'sync_frequency_minutes', type: 'integer', nullable: true, description: 'Sync interval in minutes', constraints: ['DEFAULT 60'] },
        { name: 'last_sync_at', type: 'timestamp with time zone', nullable: true, description: 'Last successful sync' },
        { name: 'authentication_config', type: 'jsonb', nullable: true, description: 'Auth configuration' },
        { name: 'error_message', type: 'text', nullable: true, description: 'Last error message' }
      ],
      relationships: [],
      foreignKeys: [],
      component: 'TravelIntegrationDashboard.tsx',
      template: 'TravelIntegrationTemplate',
      rlsPolicies: ['Allow read access to travel integration config', 'Admins can manage travel integration config']
    }
  ];

  const systemEntities: TableInfo[] = [
    {
      name: 'profiles',
      description: 'User profile information and preferences',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key (matches auth.users.id)', constraints: ['PRIMARY KEY'] },
        { name: 'email', type: 'text', nullable: true, description: 'User email address' },
        { name: 'full_name', type: 'text', nullable: true, description: 'User full name' },
        { name: 'created_at', type: 'timestamp with time zone', nullable: true, description: 'Creation timestamp', constraints: ['DEFAULT now()'] },
        { name: 'updated_at', type: 'timestamp with time zone', nullable: true, description: 'Last update timestamp', constraints: ['DEFAULT now()'] }
      ],
      relationships: ['user_roles'],
      foreignKeys: [],
      component: 'UserProfile.tsx, UserMenu.tsx',
      template: 'UserProfileTemplate',
      rlsPolicies: ['Users can view their own profile', 'Users can update their own profile', 'Admins can view all profiles'],
      triggers: ['handle_new_user (on auth.users)']
    },
    {
      name: 'user_roles',
      description: 'Role-based access control for users',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'user_id', type: 'uuid', nullable: false, description: 'Foreign key to profiles/auth.users', constraints: ['NOT NULL'] },
        { name: 'role', type: 'app_role', nullable: false, description: 'admin | power_user | regular_user', constraints: ['NOT NULL'] },
        { name: 'created_by', type: 'uuid', nullable: true, description: 'User who assigned role' },
        { name: 'created_at', type: 'timestamp with time zone', nullable: true, description: 'Role assignment timestamp', constraints: ['DEFAULT now()'] }
      ],
      relationships: ['profiles'],
      foreignKeys: ['user_id -> auth.users.id'],
      component: 'RoleManagement.tsx, SecureRoleManager.tsx, RoleProtectedRoute.tsx',
      template: 'UserRoleTemplate',
      rlsPolicies: ['Users can view their own roles', 'Admins can manage all user roles'],
      special: 'Uses custom app_role enum type'
    },
    {
      name: 'employee_history',
      description: 'Historical record of employee count changes',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'province_id', type: 'uuid', nullable: false, description: 'Related province', constraints: ['NOT NULL', 'REFERENCES provinces(id)'] },
        { name: 'employee_count', type: 'integer', nullable: false, description: 'New employee count', constraints: ['NOT NULL'] },
        { name: 'previous_count', type: 'integer', nullable: true, description: 'Previous count' },
        { name: 'change_reason', type: 'text', nullable: true, description: 'Reason for change' },
        { name: 'changed_by', type: 'text', nullable: true, description: 'User who made change' },
        { name: 'created_at', type: 'timestamp with time zone', nullable: false, description: 'Change timestamp', constraints: ['DEFAULT now()'] }
      ],
      relationships: ['provinces'],
      foreignKeys: ['province_id -> provinces.id'],
      component: 'EmployeeHistoryDashboard.tsx',
      template: 'EmployeeHistoryTemplate',
      rlsPolicies: ['Allow read access to employee history', 'Admins can manage employee history']
    },
    {
      name: 'location_history',
      description: 'Historical tracking of location-based employee changes',
      columns: [
        { name: 'id', type: 'uuid', nullable: false, description: 'Primary key', constraints: ['PRIMARY KEY'] },
        { name: 'city_id', type: 'uuid', nullable: false, description: 'Related city', constraints: ['NOT NULL', 'REFERENCES cities(id)'] },
        { name: 'home_base_count', type: 'integer', nullable: false, description: 'New home base count', constraints: ['NOT NULL'] },
        { name: 'current_location_count', type: 'integer', nullable: false, description: 'New current location count', constraints: ['NOT NULL'] },
        { name: 'travel_away_count', type: 'integer', nullable: false, description: 'New travel away count', constraints: ['NOT NULL'] },
        { name: 'previous_home_base_count', type: 'integer', nullable: true, description: 'Previous home base count' },
        { name: 'previous_current_location_count', type: 'integer', nullable: true, description: 'Previous current count' },
        { name: 'previous_travel_away_count', type: 'integer', nullable: true, description: 'Previous travel count' },
        { name: 'change_type', type: 'text', nullable: false, description: 'Type of change made', constraints: ['NOT NULL'] },
        { name: 'change_reason', type: 'text', nullable: true, description: 'Reason for change' },
        { name: 'changed_by', type: 'text', nullable: true, description: 'User who made change' },
        { name: 'data_source', type: 'text', nullable: true, description: 'Source of change', constraints: ['DEFAULT admin_interface'] }
      ],
      relationships: ['cities'],
      foreignKeys: ['city_id -> cities.id'],
      component: 'LocationHistoryDashboard.tsx',
      template: 'LocationHistoryTemplate',
      rlsPolicies: ['Allow read access to location history', 'Power users can insert location history']
    },
    {
      name: 'data_sync_status',
      description: 'Synchronization status tracking for external data sources',
      columns: [
        { name: 'source', type: 'varchar', nullable: false, description: 'Data source identifier', constraints: ['PRIMARY KEY'] },
        { name: 'status', type: 'varchar', nullable: true, description: 'Sync status' },
        { name: 'last_sync_time', type: 'timestamp with time zone', nullable: true, description: 'Last sync timestamp' },
        { name: 'message', type: 'text', nullable: true, description: 'Status message or error' }
      ],
      relationships: [],
      foreignKeys: [],
      component: 'DataSyncDashboard.tsx, DataStatusIndicator.tsx',
      template: 'DataSyncTemplate',
      rlsPolicies: ['Public read access (no RLS policies defined)']
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

    const csvContent = `Table Name,Description,Primary Key,Foreign Keys,Component,Template,RLS Policies,Triggers,Special Features
${allTables
  .map(table => 
    `"${table.name}","${table.description}","id","${table.foreignKeys.join('; ')}","${table.component}","${table.template}","${(table.rlsPolicies || []).join('; ')}","${(table.triggers || []).join('; ')}","${table.special || 'N/A'}"`
  ).join('\n')}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `database-schema-v${schemaVersion}-${new Date().toISOString().split('T')[0]}.csv`;
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
                {table.foreignKeys.length > 0 && <Badge variant="secondary">FK: {table.foreignKeys.length}</Badge>}
                {table.triggers && table.triggers.length > 0 && <Badge variant="default">Triggers</Badge>}
                {table.special && <Badge variant="destructive">Special</Badge>}
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
                        {col.constraints && col.constraints.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {col.constraints.map((constraint, cidx) => (
                              <Badge key={cidx} variant="outline" className="text-xs">
                                {constraint}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-sm flex-1 text-right">{col.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {table.foreignKeys.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Foreign Key Relationships
                  </h4>
                  <div className="space-y-1">
                    {table.foreignKeys.map((fk, idx) => (
                      <div key={idx} className="p-2 bg-blue-50 rounded text-sm">
                        <code className="text-blue-800">{fk}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {table.relationships.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    Table relationships
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

              {table.rlsPolicies && table.rlsPolicies.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Row Level Security Policies
                  </h4>
                  <div className="space-y-1">
                    {table.rlsPolicies.map((policy, idx) => (
                      <div key={idx} className="p-2 bg-green-50 rounded text-sm">
                        <span className="text-green-800">{policy}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {table.triggers && table.triggers.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Database Triggers
                  </h4>
                  <div className="space-y-1">
                    {table.triggers.map((trigger, idx) => (
                      <div key={idx} className="p-2 bg-purple-50 rounded text-sm">
                        <span className="text-purple-800">{trigger}</span>
                      </div>
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
                    <span className="font-medium">Components:</span> {table.component}
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
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">Database Schema Documentation</h2>
            <Badge variant="outline" className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              v{schemaVersion}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Comprehensive documentation of all {totalTables} database tables with relationships, security policies, and code mappings
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Last Updated: {lastUpdated}
            </span>
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              {totalTables} Tables
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              RLS Enabled
            </span>
          </div>
        </div>
        <Button onClick={downloadSchemaCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download Schema v{schemaVersion}
        </Button>
      </div>

      <Tabs defaultValue="core" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="core">Core Entities (3)</TabsTrigger>
          <TabsTrigger value="security">Security & Risk (3)</TabsTrigger>
          <TabsTrigger value="incidents">Incidents (4)</TabsTrigger>
          <TabsTrigger value="alerts">Alert Sources (7)</TabsTrigger>
          <TabsTrigger value="employees">Employee Data (4)</TabsTrigger>
          <TabsTrigger value="system">System & Audit (5)</TabsTrigger>
        </TabsList>

        <TabsContent value="core" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Core Geographic & Hub Entities</h3>
            <p className="text-sm text-muted-foreground">
              Primary location and organizational structure tables for provinces, cities, and international hubs. 
              These tables form the foundation for all geographic and organizational data relationships.
            </p>
          </div>
          {coreEntities.map(table => (
            <TableCard key={table.name} table={table} />
          ))}
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Security & Risk Management</h3>
            <p className="text-sm text-muted-foreground">
              National security risk assessment, security alerts, and comprehensive audit trail management. 
              Includes the new SecurityDashboard with real-time monitoring capabilities.
            </p>
          </div>
          {securityEntities.map(table => (
            <TableCard key={table.name} table={table} />
          ))}
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Incident Management</h3>
            <p className="text-sm text-muted-foreground">
              Security incident tracking, geographic data, and correlation analysis for both domestic and international locations.
              Includes automatic alert level synchronization via database triggers.
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
              External data ingestion, processing, monitoring, and archival from various alert sources including weather, 
              security, and immigration feeds. Features comprehensive health monitoring and queue management.
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
              Employee location tracking, travel management, and integration platforms for both domestic and international operations.
              Includes automatic province/hub total synchronization via triggers.
            </p>
          </div>
          {employeeEntities.map(table => (
            <TableCard key={table.name} table={table} />
          ))}
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">System & Audit Tables</h3>
            <p className="text-sm text-muted-foreground">
              User management, role-based access control, historical tracking, and system synchronization. 
              Features comprehensive audit trails and version control for all data changes.
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
