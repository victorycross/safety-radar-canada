
export interface SchemaVersion {
  version: string;
  releaseDate: string;
  description: string;
  changes: SchemaChange[];
  breakingChanges: boolean;
}

export interface SchemaChange {
  type: 'table_added' | 'table_modified' | 'table_removed' | 'column_added' | 'column_modified' | 'column_removed' | 'constraint_added' | 'constraint_removed' | 'trigger_added' | 'trigger_modified' | 'trigger_removed' | 'function_added' | 'function_modified' | 'function_removed' | 'rls_policy_added' | 'rls_policy_modified' | 'rls_policy_removed';
  table?: string;
  column?: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export const SCHEMA_VERSIONS: SchemaVersion[] = [
  {
    version: '2.0.0',
    releaseDate: '2025-01-01',
    description: 'Major security enhancement and comprehensive documentation update',
    breakingChanges: false,
    changes: [
      {
        type: 'table_modified',
        table: 'security_audit_log',
        description: 'Enhanced security audit logging with improved field tracking',
        impact: 'medium'
      },
      {
        type: 'function_added',
        description: 'Added comprehensive security validation functions',
        impact: 'high'
      },
      {
        type: 'trigger_added',
        table: 'provinces',
        description: 'Enhanced employee count validation with percentage change warnings',
        impact: 'medium'
      },
      {
        type: 'rls_policy_added',
        description: 'Strengthened RLS policies across all security-sensitive tables',
        impact: 'high'
      },
      {
        type: 'table_modified',
        table: 'national_security_risks',
        description: 'Added automatic RPN calculation and priority assignment',
        impact: 'medium'
      },
      {
        type: 'column_added',
        table: 'security_alerts_ingest',
        description: 'Added archive tracking fields for better audit trail',
        impact: 'low'
      },
      {
        type: 'function_added',
        description: 'Added schema health monitoring functions',
        impact: 'medium'
      }
    ]
  },
  {
    version: '1.9.0',
    releaseDate: '2024-12-15',
    description: 'International hub management and travel integration',
    breakingChanges: false,
    changes: [
      {
        type: 'table_added',
        table: 'international_hubs',
        description: 'Added support for international office locations',
        impact: 'high'
      },
      {
        type: 'table_added',
        table: 'hub_employee_locations',
        description: 'Employee tracking for international hubs',
        impact: 'medium'
      },
      {
        type: 'table_added',
        table: 'hub_incidents',
        description: 'Incident management for international locations',
        impact: 'medium'
      },
      {
        type: 'table_added',
        table: 'travel_integration_config',
        description: 'Travel platform integration configuration',
        impact: 'medium'
      },
      {
        type: 'trigger_added',
        table: 'international_hubs',
        description: 'Auto-sync hub totals and alert levels',
        impact: 'medium'
      }
    ]
  },
  {
    version: '1.8.0',
    releaseDate: '2024-12-01',
    description: 'Enhanced security and alert management',
    breakingChanges: false,
    changes: [
      {
        type: 'table_added',
        table: 'national_security_risks',
        description: 'National security risk assessment registry',
        impact: 'high'
      },
      {
        type: 'table_added',
        table: 'alert_sources',
        description: 'External alert source configuration',
        impact: 'medium'
      },
      {
        type: 'table_added',
        table: 'alert_ingestion_queue',
        description: 'Alert processing queue management',
        impact: 'medium'
      },
      {
        type: 'table_added',
        table: 'source_health_metrics',
        description: 'Health monitoring for alert sources',
        impact: 'low'
      }
    ]
  },
  {
    version: '1.7.0',
    releaseDate: '2024-11-15',
    description: 'Weather and immigration alert integration',
    breakingChanges: false,
    changes: [
      {
        type: 'table_added',
        table: 'weather_alerts_ingest',
        description: 'Weather alert data ingestion',
        impact: 'medium'
      },
      {
        type: 'table_added',
        table: 'immigration_travel_announcements',
        description: 'Immigration and travel announcement tracking',
        impact: 'medium'
      },
      {
        type: 'table_added',
        table: 'alert_archive_log',
        description: 'Alert archival audit trail',
        impact: 'low'
      }
    ]
  },
  {
    version: '1.6.0',
    releaseDate: '2024-11-01',
    description: 'Enhanced incident management and correlation',
    breakingChanges: false,
    changes: [
      {
        type: 'table_added',
        table: 'alert_correlations',
        description: 'Alert and incident correlation tracking',
        impact: 'medium'
      },
      {
        type: 'table_added',
        table: 'geospatial_data',
        description: 'Geographic data for incidents',
        impact: 'medium'
      },
      {
        type: 'column_added',
        table: 'incidents',
        column: 'correlation_id',
        description: 'Link incidents to correlation analysis',
        impact: 'low'
      }
    ]
  }
];

export class SchemaVersionManager {
  static getCurrentVersion(): SchemaVersion {
    return SCHEMA_VERSIONS[0]; // Latest version first
  }

  static getVersionHistory(): SchemaVersion[] {
    return SCHEMA_VERSIONS;
  }

  static getChangesSince(version: string): SchemaChange[] {
    const currentIndex = SCHEMA_VERSIONS.findIndex(v => v.version === version);
    if (currentIndex === -1) return [];
    
    const changes: SchemaChange[] = [];
    for (let i = 0; i < currentIndex; i++) {
      changes.push(...SCHEMA_VERSIONS[i].changes);
    }
    return changes;
  }

  static hasBreakingChangesSince(version: string): boolean {
    const currentIndex = SCHEMA_VERSIONS.findIndex(v => v.version === version);
    if (currentIndex === -1) return false;
    
    for (let i = 0; i < currentIndex; i++) {
      if (SCHEMA_VERSIONS[i].breakingChanges) return true;
    }
    return false;
  }

  static getImpactLevel(changes: SchemaChange[]): 'low' | 'medium' | 'high' {
    if (changes.some(c => c.impact === 'high')) return 'high';
    if (changes.some(c => c.impact === 'medium')) return 'medium';
    return 'low';
  }

  static generateChangeLog(fromVersion?: string): string {
    const changes = fromVersion ? this.getChangesSince(fromVersion) : this.getCurrentVersion().changes;
    
    const changesByType = changes.reduce((acc, change) => {
      if (!acc[change.type]) acc[change.type] = [];
      acc[change.type].push(change);
      return acc;
    }, {} as Record<string, SchemaChange[]>);

    let changelog = `# Schema Changes\n\n`;
    
    Object.entries(changesByType).forEach(([type, typeChanges]) => {
      const readableType = type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      changelog += `## ${readableType}\n\n`;
      
      typeChanges.forEach(change => {
        const tableInfo = change.table ? ` (${change.table})` : '';
        changelog += `- ${change.description}${tableInfo} [${change.impact.toUpperCase()}]\n`;
      });
      
      changelog += '\n';
    });

    return changelog;
  }
}
