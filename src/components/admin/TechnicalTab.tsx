
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TechnicalTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Architecture</CardTitle>
          <CardDescription>Current technical implementation and system design</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Frontend Technologies</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• React 18.3.1 with TypeScript</li>
              <li>• Tailwind CSS for styling with shadcn/ui components</li>
              <li>• Lucide React for icons</li>
              <li>• React Router for navigation</li>
              <li>• Recharts for data visualization</li>
              <li>• TanStack React Query for data fetching</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Backend Services</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Supabase PostgreSQL database with Row Level Security</li>
              <li>• Edge functions for API integrations and data processing</li>
              <li>• Real-time subscriptions for live updates</li>
              <li>• Master ingestion orchestrator for alert processing</li>
              <li>• Automated data validation and cleanup procedures</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">External Integrations</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Alert Ready RSS feeds (Environment Canada)</li>
              <li>• BC Government emergency alerts</li>
              <li>• Immigration, Refugees and Citizenship Canada announcements</li>
              <li>• Security alert sources (CSE, RCMP, CSIS)</li>
              <li>• Weather alert processing and normalization</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Structure</CardTitle>
          <CardDescription>Current 24-table schema with comprehensive relationships</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Core Geographic Entities</h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-medium">Provinces & Cities</h5>
                <ul className="text-sm text-muted-foreground ml-4">
                  <li>• 13 Canadian provinces/territories with employee counts</li>
                  <li>• Major cities linked to provinces for location tracking</li>
                  <li>• Real-time alert level management (normal/warning/severe)</li>
                  <li>• Automated employee count synchronization</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium">International Hubs</h5>
                <ul className="text-sm text-muted-foreground ml-4">
                  <li>• Global office locations outside Canada</li>
                  <li>• Hub-specific incident tracking and employee management</li>
                  <li>• Country-level alert aggregation and status monitoring</li>
                  <li>• Active/inactive hub status with automated metrics</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Alert & Incident Management</h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-medium">Multi-Source Alert Ingestion</h5>
                <ul className="text-sm text-muted-foreground ml-4">
                  <li>• Security alerts (cybersecurity, physical, intelligence)</li>
                  <li>• Weather alerts with severity classification</li>
                  <li>• Immigration/travel announcements and policy changes</li>
                  <li>• Automated source validation and data quality controls</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium">Incident Tracking</h5>
                <ul className="text-sm text-muted-foreground ml-4">
                  <li>• Province-based incident management with geospatial data</li>
                  <li>• Hub-specific international incident tracking</li>
                  <li>• Verification status workflow (unverified/verified/false_alarm)</li>
                  <li>• Confidence scoring and correlation analysis</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Employee & Travel Management</h4>
            <ul className="text-sm text-muted-foreground ml-4">
              <li>• Employee location distribution across Canadian cities</li>
              <li>• International hub employee count management</li>
              <li>• Individual travel record tracking with status workflow</li>
              <li>• Travel integration with external booking platforms</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Processing & Quality</CardTitle>
          <CardDescription>Automated data validation and processing workflows</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Data Validation & Cleanup</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Automated removal of test/dummy data across all tables</li>
              <li>• Employee count range validation (provinces: 0-50K, hubs: 0-1K)</li>
              <li>• Source validation (prevents "test", "unknown", empty sources)</li>
              <li>• Alert level constraint enforcement</li>
              <li>• Foreign key integrity maintenance</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Audit & History Tracking</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Employee count change history with percentage change warnings</li>
              <li>• Location update tracking with source attribution</li>
              <li>• Security audit log for all administrative actions</li>
              <li>• Archive management for expired alerts and incidents</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Health Monitoring</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Source health metrics with response time tracking</li>
              <li>• Data ingestion queue management and error handling</li>
              <li>• Correlation analysis for related incidents</li>
              <li>• Automated data sync status monitoring</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Specifications</CardTitle>
          <CardDescription>Security controls and compliance requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Authentication & Authorization</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Role-based access control (admin, power_user, regular_user)</li>
              <li>• Row Level Security policies on all sensitive tables</li>
              <li>• Session management with automatic timeout</li>
              <li>• Function-level security with SECURITY DEFINER</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Data Protection</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Encryption at rest and in transit via Supabase</li>
              <li>• Input sanitization and XSS prevention</li>
              <li>• SQL injection protection through parameterized queries</li>
              <li>• Comprehensive audit trail for all data modifications</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Compliance</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Government security standards adherence</li>
              <li>• Personal information handling protocols</li>
              <li>• Data retention and archival policies</li>
              <li>• Regular security vulnerability assessments</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalTab;
