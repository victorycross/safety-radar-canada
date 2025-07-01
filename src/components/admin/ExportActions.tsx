
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

NON-FUNCTIONAL REQUIREMENTS
--------------------------
NFR-001: Performance
- System response time < 3 seconds for all operations
- Support 100+ concurrent users
- 99.5% uptime availability

NFR-002: Security
- Role-based access control
- Encrypted data transmission and storage
- Audit trail for all system actions
- Compliance with government security standards

NFR-003: Usability
- Intuitive user interface requiring minimal training
- Responsive design for desktop and mobile devices
- Accessibility compliance (WCAG 2.1)`;
        filename = 'security-barometer-requirements.txt';
        break;

      case 'technical':
        content = `SECURITY BAROMETER - TECHNICAL DOCUMENTATION
==========================================
Generated: ${currentDate}

SYSTEM ARCHITECTURE
------------------
Frontend: React 18.3.1 with TypeScript, Tailwind CSS
Backend: Supabase with Edge Functions
Database: PostgreSQL with Row Level Security
Integrations: Alert Ready RSS, BC Alerts, Everbridge

DATABASE SCHEMA
--------------
24 Core Tables with comprehensive relationships
- Provinces, Cities, Employee Locations
- Incidents, Hub Incidents, Alert Sources
- Security Alerts, Weather Alerts, Immigration Data
- Travel Records, User Management, Audit Logs

SECURITY SPECIFICATIONS
----------------------
- Multi-factor authentication required
- Role-based access control (RBAC)
- Encryption at rest (AES-256) and in transit (TLS 1.3)
- Government compliance standards`;
        filename = 'security-barometer-technical.txt';
        break;

      case 'database':
        content = `SECURITY BAROMETER - DATABASE SCHEMA
===================================
Generated: ${currentDate}

Complete database schema documentation with 24 tables,
foreign key relationships, RLS policies, and data templates.

See Database Schema tab for detailed information.`;
        filename = 'security-barometer-database.txt';
        break;

      default:
        content = `SECURITY BAROMETER - DOCUMENTATION EXPORT
========================================
Generated: ${currentDate}

Complete system documentation including requirements,
technical specifications, and database schema.`;
        filename = 'security-barometer-export.txt';
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
