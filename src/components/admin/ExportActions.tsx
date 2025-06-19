
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportActionsProps {
  activeTab: string;
}

const ExportActions = ({ activeTab }: ExportActionsProps) => {
  const exportAllToWord = () => {
    const allContent = `
SECURITY BAROMETER - COMPLETE DOCUMENTATION
==========================================

OVERVIEW
========
Security Barometer Dashboard - Comprehensive security monitoring and incident management system for Canadian provinces and territories.

Key Features:
• Real-time provincial security monitoring
• Incident reporting and tracking
• Employee distribution management
• External alert source integration
• Analytics and reporting dashboard

System Status:
• Status: Development Phase
• Version: 1.0.0
• Last Updated: Current
• Environment: Staging

BUSINESS REQUIREMENTS
====================

FUNCTIONAL REQUIREMENTS
-----------------------

FR-001: Real-time Monitoring
The system must provide real-time monitoring of security alerts across all Canadian provinces and territories.
• Display current alert levels for each province
• Update alert status within 5 minutes of source changes
• Provide visual indicators for different threat levels

FR-002: Incident Management
Users must be able to create, track, and manage security incidents.
• Create new incident reports with required fields
• Assign incidents to appropriate personnel
• Track incident status through resolution
• Generate incident reports and analytics

FR-003: Employee Distribution
The system must track and display employee distribution across provinces.
• Maintain employee location database
• Visualize employee distribution on map
• Support filtering and search capabilities

NON-FUNCTIONAL REQUIREMENTS
---------------------------

NFR-001: Performance
• System response time < 3 seconds for all operations
• Support 100+ concurrent users
• 99.5% uptime availability

NFR-002: Security
• Role-based access control
• Encrypted data transmission and storage
• Audit trail for all system actions
• Compliance with government security standards

NFR-003: Usability
• Intuitive user interface requiring minimal training
• Responsive design for desktop and mobile devices
• Accessibility compliance (WCAG 2.1)

TECHNICAL SPECIFICATIONS
=======================

SYSTEM ARCHITECTURE
-------------------

Frontend Technologies:
• React 18.3.1 with TypeScript
• Tailwind CSS for styling
• Lucide React for icons
• React Router for navigation
• Recharts for data visualization

Backend Services:
• Supabase for database and authentication
• Edge functions for API integrations
• Real-time subscriptions for live updates
• Row Level Security (RLS) policies

External Integrations:
• Alert Ready RSS feeds
• BC Government emergency alerts
• Everbridge notification system
• Mapbox for geographic visualization

DATA MODELS
-----------

Core Entities:

Provinces:
• id, name, code, alert_level, coordinates
• population, employee_count, last_updated

Incidents:
• id, title, description, severity, status
• province_id, created_at, updated_at, assigned_to

Employees:
• id, name, position, department, province_id
• security_clearance, contact_info, status

SECURITY SPECIFICATIONS
-----------------------

Authentication & Authorization:
• Multi-factor authentication required
• Role-based access control (RBAC)
• Session timeout after 30 minutes of inactivity
• Integration with government identity providers

Data Protection:
• Encryption at rest using AES-256
• TLS 1.3 for data in transit
• Personal information anonymization
• Regular security vulnerability assessments

Compliance:
• Privacy Act compliance
• Access to Information Act adherence
• Treasury Board security standards
• PIPEDA compliance for personal data

MICROSOFT 365 IMPLEMENTATION PLAN
=================================

PHASE 1: SHAREPOINT FOUNDATION (Weeks 1-4)
==========================================

1.1 Site Collection Setup
- Create new SharePoint site collection named "Security Barometer"
- Configure site permissions and security groups
- Set up site columns and content types

1.2 Lists and Libraries Creation
- Incident Reports List
  * Title (Single line of text)
  * Description (Multiple lines of text)
  * Severity Level (Choice: Low, Medium, High, Critical)
  * Province/Territory (Choice: All provinces/territories)
  * Status (Choice: Open, In Progress, Resolved, Closed)
  * Date Reported (Date and Time)
  * Reported By (Person or Group)
  * Assigned To (Person or Group)
  
- Employee Distribution List
  * Employee Name (Single line of text)
  * Employee ID (Single line of text)
  * Province/Territory (Choice)
  * Department (Single line of text)
  * Position (Single line of text)
  * Security Clearance Level (Choice)
  
- Alert Sources List
  * Source Name (Single line of text)
  * Source Type (Choice: RSS Feed, API, Manual)
  * URL/Endpoint (Single line of text)
  * Status (Choice: Active, Inactive)
  * Last Updated (Date and Time)

1.3 Document Libraries
- Create "Security Documentation" library
- Create "Reports and Analytics" library
- Configure metadata and versioning

PHASE 2: POWER APPS DEVELOPMENT (Weeks 5-8)
===========================================

2.1 Canvas App Development
- Create main dashboard app
- Design responsive layouts for desktop and mobile
- Implement navigation between screens

2.2 Screen Development
- Home Dashboard Screen
  * Provincial map visualization
  * Alert summary widgets
  * Quick action buttons
  
- Incident Management Screen
  * Form for new incident creation
  * List view of existing incidents
  * Edit and update functionality
  
- Employee Distribution Screen
  * Visual representation of employee locations
  * Filter and search capabilities
  
- Analytics Screen
  * Charts and graphs for trend analysis
  * Export functionality

2.3 Data Connections
- Connect to SharePoint lists
- Configure delegation settings
- Implement error handling

[Complete implementation plan continues with Phases 3-6, technical specifications, resource requirements, risk mitigation, and success metrics...]

This comprehensive documentation package includes all system requirements, technical specifications, and implementation guidance for the Security Barometer system across both the current React implementation and the proposed Microsoft 365 migration.
    `;

    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Security-Barometer-Complete-Documentation.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex justify-end">
      <Button onClick={exportAllToWord} variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Export All to Word
      </Button>
    </div>
  );
};

export default ExportActions;
