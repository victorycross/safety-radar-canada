
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportActionsProps {
  activeTab: string;
}

const ExportActions = ({ activeTab }: ExportActionsProps) => {
  const exportCurrentTabData = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    let content = '';
    let filename = '';

    switch (activeTab) {
      case 'requirements':
        content = `SECURITY BAROMETER - SYSTEM REQUIREMENTS
=========================================
Generated: ${currentDate}

FUNCTIONAL REQUIREMENTS
----------------------
FR-001: Real-time Monitoring
- Display current alert levels for each province
- Update alert status within 5 minutes of source changes
- Provide visual indicators for different threat levels

FR-002: Incident Management
- Create new incident reports with required fields
- Assign incidents to appropriate personnel
- Track incident status through resolution
- Generate incident reports and analytics

FR-003: Employee Distribution
- Maintain employee location database
- Visualize employee distribution on map
- Support filtering and search capabilities

FR-004: Security Risk Management
- Comprehensive threat assessment registry
- Risk Priority Number (RPN) calculation
- Response playbook management
- Live feed integration and monitoring

NON-FUNCTIONAL REQUIREMENTS
--------------------------
NFR-001: Performance
- System response time < 3 seconds for all operations
- Support 100+ concurrent users
- 99.5% uptime availability

NFR-002: Security
- Role-based access control (admin, power_user, regular_user)
- Encrypted data transmission and storage
- Comprehensive audit trail for all system actions
- Compliance with government security standards
- National security risk assessment capabilities

NFR-003: Usability
- Intuitive user interface requiring minimal training
- Responsive design for desktop and mobile devices
- Accessibility compliance (WCAG 2.1)
- Advanced filtering and search capabilities`;
        filename = 'security-barometer-requirements.txt';
        break;

      case 'technical':
        content = `SECURITY BAROMETER - TECHNICAL DOCUMENTATION
==========================================
Generated: ${currentDate}

SYSTEM ARCHITECTURE
------------------
Frontend: React 18.3.1 with TypeScript, Tailwind CSS, shadcn/ui
Backend: Supabase with Edge Functions and PostgreSQL
Database: 25 comprehensive tables with Row Level Security
Integrations: Alert Ready RSS, BC Alerts, Everbridge, Travel Platforms

DATABASE SCHEMA OVERVIEW
------------------------
Core Entities (3): provinces, cities, international_hubs
Security & Risk (3): national_security_risks, security_alerts_ingest, security_audit_log
Incidents (4): incidents, hub_incidents, geospatial_data, alert_correlations
Alert Sources (7): weather_alerts_ingest, immigration_travel_announcements, alert_sources, 
                   alert_ingestion_queue, source_health_metrics, alert_archive_log
Employee Data (4): employee_locations, hub_employee_locations, travel_records, travel_integration_config
System & Audit (5): profiles, user_roles, employee_history, location_history, data_sync_status

SECURITY SPECIFICATIONS
----------------------
- Multi-factor authentication with Supabase Auth
- Role-based access control with custom functions
- Row Level Security (RLS) on all sensitive tables
- Comprehensive audit logging and security monitoring
- Risk assessment with automated RPN calculation
- Encryption at rest (AES-256) and in transit (TLS 1.3)
- Government compliance standards

KEY FEATURES
-----------
- National Security Risk Register with threat assessment
- Real-time alert processing and correlation
- Employee location tracking and travel management
- Comprehensive incident management system
- Multi-source alert ingestion and monitoring
- Advanced geospatial analysis capabilities
- Automated risk priority calculation`;
        filename = 'security-barometer-technical.txt';
        break;

      case 'database':
        content = `SECURITY BAROMETER - DATABASE SCHEMA
===================================
Generated: ${currentDate}

COMPLETE DATABASE SCHEMA - 25 TABLES
====================================

Core Geographic & Hub Entities (3 tables):
- provinces: Canadian provinces with alert levels and employee counts
- cities: Cities within provinces for location tracking
- international_hubs: International office locations

Security & Risk Management (3 tables):
- national_security_risks: Threat assessment registry with RPN calculation
- security_alerts_ingest: Cybersecurity and physical security alerts
- security_audit_log: Comprehensive audit trail

Incident Management (4 tables):
- incidents: Security incidents within Canadian provinces
- hub_incidents: International hub security incidents
- geospatial_data: Geographic information and impact analysis
- alert_correlations: Alert and incident correlation analysis

External Alert Sources (7 tables):
- weather_alerts_ingest: Weather warnings and emergencies
- immigration_travel_announcements: IRCC policy announcements
- alert_sources: External data source configurations
- alert_ingestion_queue: Alert processing pipeline
- source_health_metrics: Source monitoring and health
- alert_archive_log: Alert archival audit trail

Employee & Travel Data (4 tables):
- employee_locations: Employee distribution tracking
- hub_employee_locations: International hub staffing
- travel_records: Individual travel tracking
- travel_integration_config: Travel platform integrations

System & Audit Tables (5 tables):
- profiles: User profile information
- user_roles: Role-based access control
- employee_history: Historical employee count changes
- location_history: Location change audit trail
- data_sync_status: External data synchronization status

SPECIAL FEATURES:
- Automated RPN calculation via database triggers
- Real-time alert level updates based on incidents
- Comprehensive Row Level Security (RLS) policies
- Foreign key relationships ensuring data integrity
- Custom PostgreSQL functions for role checking
- Geospatial data support with PostGIS capabilities`;
        filename = 'security-barometer-database.txt';
        break;

      default:
        content = `SECURITY BAROMETER - COMPREHENSIVE DOCUMENTATION EXPORT
======================================================
Generated: ${currentDate}

SYSTEM OVERVIEW
===============
The Security Barometer is a comprehensive threat assessment and monitoring platform
designed for government and enterprise security operations. It provides real-time
monitoring, incident management, and security risk assessment capabilities.

DATABASE: 25 tables organized into 6 categories
FEATURES: Risk assessment, alert processing, employee tracking, incident management
INTEGRATIONS: Multiple alert sources, travel platforms, geospatial analysis
SECURITY: Role-based access, audit trails, encryption, government compliance

KEY MODULES:
- National Security Risk Register
- Real-time Alert Processing
- Employee Location Management
- Incident Tracking and Correlation
- Travel Integration and Monitoring
- Comprehensive Audit and Reporting

For detailed information, please refer to individual documentation sections:
- Requirements Tab: Functional and non-functional requirements
- Technical Tab: Architecture and implementation details
- Database Schema Tab: Complete database documentation with 25 tables
- Templates Tab: Data import/export templates and validation rules`;
        filename = 'security-barometer-complete-export.txt';
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex justify-end">
      <Button onClick={exportCurrentTabData} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Export Documentation
      </Button>
    </div>
  );
};

export default ExportActions;
