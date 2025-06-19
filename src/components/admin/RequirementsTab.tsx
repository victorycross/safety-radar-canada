
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RequirementsTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Functional Requirements</CardTitle>
          <CardDescription>Core business requirements and user stories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">FR-001: Real-time Monitoring</h4>
            <p className="text-sm text-muted-foreground mb-2">
              The system must provide real-time monitoring of security alerts across all Canadian provinces and territories.
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Display current alert levels for each province</li>
              <li>• Update alert status within 5 minutes of source changes</li>
              <li>• Provide visual indicators for different threat levels</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">FR-002: Incident Management</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Users must be able to create, track, and manage security incidents.
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Create new incident reports with required fields</li>
              <li>• Assign incidents to appropriate personnel</li>
              <li>• Track incident status through resolution</li>
              <li>• Generate incident reports and analytics</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">FR-003: Employee Distribution</h4>
            <p className="text-sm text-muted-foreground mb-2">
              The system must track and display employee distribution across provinces.
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Maintain employee location database</li>
              <li>• Visualize employee distribution on map</li>
              <li>• Support filtering and search capabilities</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Non-Functional Requirements</CardTitle>
          <CardDescription>Performance, security, and operational requirements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">NFR-001: Performance</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• System response time &lt; 3 seconds for all operations</li>
              <li>• Support 100+ concurrent users</li>
              <li>• 99.5% uptime availability</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">NFR-002: Security</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Role-based access control</li>
              <li>• Encrypted data transmission and storage</li>
              <li>• Audit trail for all system actions</li>
              <li>• Compliance with government security standards</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">NFR-003: Usability</h4>
            <ul className="text-sm space-y-1 text-muted-foreground ml-4">
              <li>• Intuitive user interface requiring minimal training</li>
              <li>• Responsive design for desktop and mobile devices</li>
              <li>• Accessibility compliance (WCAG 2.1)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequirementsTab;
