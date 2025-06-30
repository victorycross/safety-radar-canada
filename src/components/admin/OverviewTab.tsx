
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const OverviewTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Barometer Dashboard</CardTitle>
          <CardDescription>
            Comprehensive security monitoring and incident management system for Canadian provinces and territories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Key Features</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Real-time provincial security monitoring</li>
                <li>• Incident reporting and tracking</li>
                <li>• Employee distribution management</li>
                <li>• External alert source integration</li>
                <li>• Analytics and reporting dashboard</li>
                <li>• Enhanced security audit logging</li>
                <li>• Role-based access control</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">System Status</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Status: Production Ready</li>
                <li>• Version: 1.0.0</li>
                <li>• Security Score: 9/10</li>
                <li>• Environment: Live</li>
                <li>• Database: Supabase PostgreSQL</li>
                <li>• Authentication: Supabase Auth</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Overview</CardTitle>
          <CardDescription>
            Current security implementation status and recent improvements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm font-medium">Authentication</div>
                <div className="text-xs text-muted-foreground">Supabase Auth + RLS</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm font-medium">Audit Logging</div>
                <div className="text-xs text-muted-foreground">Database-backed</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm font-medium">Input Validation</div>
                <div className="text-xs text-muted-foreground">XSS Protection</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              The system implements comprehensive security measures including role-based access control, 
              session management, security audit logging, and input validation to ensure data protection 
              and regulatory compliance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
