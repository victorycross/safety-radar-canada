
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const TechnicalTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Architecture</CardTitle>
          <CardDescription>Technical implementation details and system design</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Frontend Technologies</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• React 18.3.1 with TypeScript</li>
              <li>• Tailwind CSS for styling</li>
              <li>• Lucide React for icons</li>
              <li>• React Router for navigation</li>
              <li>• Recharts for data visualization</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Backend Services</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Supabase for database and authentication</li>
              <li>• Edge functions for API integrations</li>
              <li>• Real-time subscriptions for live updates</li>
              <li>• Row Level Security (RLS) policies</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">External Integrations</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Alert Ready RSS feeds</li>
              <li>• BC Government emergency alerts</li>
              <li>• Everbridge notification system</li>
              <li>• Mapbox for geographic visualization</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Models</CardTitle>
          <CardDescription>Database schema and data relationships</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Core Entities</h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-medium">Provinces</h5>
                <ul className="text-sm text-muted-foreground ml-4">
                  <li>• id, name, code, alert_level, coordinates</li>
                  <li>• population, employee_count, last_updated</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium">Incidents</h5>
                <ul className="text-sm text-muted-foreground ml-4">
                  <li>• id, title, description, severity, status</li>
                  <li>• province_id, created_at, updated_at, assigned_to</li>
                </ul>
              </div>
              
              <div>
                <h5 className="font-medium">Employees</h5>
                <ul className="text-sm text-muted-foreground ml-4">
                  <li>• id, name, position, department, province_id</li>
                  <li>• security_clearance, contact_info, status</li>
                </ul>
              </div>
            </div>
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
              <li>• Multi-factor authentication required</li>
              <li>• Role-based access control (RBAC)</li>
              <li>• Session timeout after 30 minutes of inactivity</li>
              <li>• Integration with government identity providers</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Data Protection</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Encryption at rest using AES-256</li>
              <li>• TLS 1.3 for data in transit</li>
              <li>• Personal information anonymization</li>
              <li>• Regular security vulnerability assessments</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Compliance</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Privacy Act compliance</li>
              <li>• Access to Information Act adherence</li>
              <li>• Treasury Board security standards</li>
              <li>• PIPEDA compliance for personal data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalTab;
