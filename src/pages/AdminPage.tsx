
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, FileText, Database, Workflow, BarChart3, Shield, Users, AlertTriangle, Download } from 'lucide-react';

const AdminPage = () => {
  const exportToWord = () => {
    // Create HTML content for Word document
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Security Barometer - Business Requirements Document</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
          h2 { color: #1e40af; margin-top: 30px; }
          h3 { color: #1e3a8a; margin-top: 25px; }
          h4 { color: #1e40af; margin-top: 20px; }
          ul { margin-left: 20px; }
          .section { margin-bottom: 30px; }
          .requirement { background-color: #f8fafc; padding: 15px; margin: 15px 0; border-left: 4px solid #2563eb; }
          .priority-critical { border-left-color: #dc2626; }
          .priority-high { border-left-color: #ea580c; }
          .priority-medium { border-left-color: #ca8a04; }
          .badge { background-color: #e0e7ff; color: #3730a3; padding: 4px 8px; border-radius: 6px; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Security Barometer - Business Requirements Document</h1>
        <p><strong>Comprehensive requirements for rebuilding Security Barometer in Microsoft Power Platform</strong></p>
        
        <div class="section">
          <h2>Executive Summary and Project Overview</h2>
          
          <h3>Project Scope</h3>
          <ul>
            <li>Real-time security incident monitoring for Canadian operations</li>
            <li>Employee safety tracking across 10+ provinces</li>
            <li>Multi-source alert aggregation (Alert Ready, Everbridge, BC Alerts)</li>
            <li>Executive dashboard for risk assessment</li>
            <li>Employee check-in and safety verification system</li>
          </ul>
          
          <h3>Key Stakeholders</h3>
          <ul>
            <li>Security Operations Team</li>
            <li>Executive Leadership</li>
            <li>Regional Managers</li>
            <li>HR Department</li>
            <li>IT Operations</li>
          </ul>
          
          <h3>Success Metrics</h3>
          <ul>
            <li>&lt;1min Alert Response Time</li>
            <li>100% Employee Coverage</li>
            <li>Real-time Dashboard Updates</li>
          </ul>
        </div>

        <div class="section">
          <h2>Business Requirements</h2>
          
          <div class="requirement priority-critical">
            <h4>BR-001: Security Incident Management</h4>
            <p><strong>Requirement:</strong> The system shall provide real-time monitoring and management of security incidents across Canadian provinces.</p>
            <p><strong>Priority:</strong> Critical</p>
            <p><strong>Acceptance Criteria:</strong></p>
            <ul>
              <li>Display incidents within 30 seconds of occurrence</li>
              <li>Categorize by severity (Normal, Warning, Severe)</li>
              <li>Track incident lifecycle from creation to resolution</li>
              <li>Support manual incident creation by authorized users</li>
            </ul>
          </div>

          <div class="requirement priority-critical">
            <h4>BR-002: Emergency Alert Integration</h4>
            <p><strong>Requirement:</strong> Integrate with Canadian emergency alert systems including Alert Ready, BC Emergency Management, and Everbridge.</p>
            <p><strong>Priority:</strong> Critical</p>
            <p><strong>Acceptance Criteria:</strong></p>
            <ul>
              <li>Automatically pull alerts from Alert Ready RSS feeds</li>
              <li>Parse and display BC-specific emergency alerts</li>
              <li>Integrate Everbridge notifications</li>
              <li>Filter alerts by geographic relevance</li>
              <li>Provide alert categorization and severity mapping</li>
            </ul>
          </div>

          <div class="requirement priority-high">
            <h4>BR-003: Employee Safety Tracking</h4>
            <p><strong>Requirement:</strong> Track employee distribution and safety status across Canadian provinces.</p>
            <p><strong>Priority:</strong> High</p>
            <p><strong>Acceptance Criteria:</strong></p>
            <ul>
              <li>Maintain accurate employee count by province</li>
              <li>Provide employee check-in functionality</li>
              <li>Generate safety reports by region</li>
              <li>Alert management when employees are in high-risk areas</li>
            </ul>
          </div>

          <div class="requirement priority-high">
            <h4>BR-004: Executive Dashboard</h4>
            <p><strong>Requirement:</strong> Provide executive-level dashboard for strategic security oversight.</p>
            <p><strong>Priority:</strong> High</p>
            <p><strong>Acceptance Criteria:</strong></p>
            <ul>
              <li>Real-time security status overview</li>
              <li>Key performance indicators and metrics</li>
              <li>Trend analysis and historical reporting</li>
              <li>Mobile-responsive design for executive access</li>
            </ul>
          </div>

          <div class="requirement priority-medium">
            <h4>BR-005: Reporting and Analytics</h4>
            <p><strong>Requirement:</strong> Generate comprehensive security reports and analytics.</p>
            <p><strong>Priority:</strong> Medium</p>
            <p><strong>Acceptance Criteria:</strong></p>
            <ul>
              <li>Automated daily, weekly, and monthly reports</li>
              <li>Customizable report templates</li>
              <li>Export capabilities (PDF, Excel, PowerPoint)</li>
              <li>Scheduled report distribution</li>
            </ul>
          </div>
        </div>

        <div class="section">
          <h2>Technical Requirements</h2>
          
          <h3>TR-001: Power Apps Application Architecture</h3>
          <p><strong>Application Type:</strong> Canvas App with Model-Driven components</p>
          <p><strong>Requirements:</strong></p>
          <ul>
            <li>Responsive design supporting desktop, tablet, and mobile</li>
            <li>Role-based security model</li>
            <li>Offline capability for critical functions</li>
            <li>Integration with Microsoft 365 ecosystem</li>
            <li>Custom connectors for external APIs</li>
          </ul>

          <h3>TR-002: Data Architecture</h3>
          <p><strong>Primary Data Store:</strong> Microsoft Dataverse</p>
          <p><strong>Schema Requirements:</strong></p>
          <ul>
            <li><strong>Provinces Table:</strong> id, name, code, alert_level, employee_count</li>
            <li><strong>Incidents Table:</strong> id, title, description, province_id, timestamp, alert_level, source, verification_status, recommended_action</li>
            <li><strong>Employees Table:</strong> id, name, email, province_id, department, manager_id, emergency_contact</li>
            <li><strong>Emergency Alerts Table:</strong> id, title, description, severity, urgency, area, source, published_date, expiry_date</li>
            <li><strong>Check-ins Table:</strong> id, employee_id, timestamp, location, status, notes</li>
          </ul>

          <h3>TR-003: API Integration Requirements</h3>
          <p><strong>External APIs:</strong></p>
          <ul>
            <li><strong>Alert Ready RSS:</strong> https://rss.naad-adna.pelmorex.com/</li>
            <li><strong>BC Emergency Management:</strong> Custom web scraping or API</li>
            <li><strong>Everbridge API:</strong> REST API with authentication</li>
            <li><strong>Police Data APIs:</strong> Various municipal police services</li>
          </ul>
          <p><strong>Custom Connectors Required:</strong></p>
          <ul>
            <li>Alert Ready RSS Parser</li>
            <li>BC Emergency Alert Connector</li>
            <li>Everbridge Integration Connector</li>
          </ul>

          <h3>TR-004: Security and Compliance</h3>
          <p><strong>Security Requirements:</strong></p>
          <ul>
            <li>Azure AD integration for authentication</li>
            <li>Multi-factor authentication enforcement</li>
            <li>Role-based access control (RBAC)</li>
            <li>Data encryption at rest and in transit</li>
            <li>Audit logging for all critical operations</li>
            <li>GDPR and PIPEDA compliance</li>
          </ul>

          <h3>TR-005: Performance Requirements</h3>
          <p><strong>Performance Targets:</strong></p>
          <ul>
            <li>Application load time: &lt;3 seconds</li>
            <li>Dashboard refresh rate: 30 seconds</li>
            <li>Concurrent users: 500+</li>
            <li>Data processing: 10,000 records/minute</li>
            <li>API response time: &lt;500ms</li>
            <li>99.9% uptime SLA</li>
          </ul>
        </div>

        <div class="section">
          <h2>SharePoint Implementation Details</h2>
          
          <h3>SP-001: Site Structure</h3>
          <p><strong>Root Site:</strong> Security Barometer Hub</p>
          <p><strong>Subsites:</strong></p>
          <ul>
            <li>/incidents - Incident management and tracking</li>
            <li>/alerts - Emergency alert repository</li>
            <li>/employees - Employee directory and safety records</li>
            <li>/reports - Generated reports and analytics</li>
            <li>/admin - Administrative functions and configuration</li>
          </ul>

          <h3>SP-002: Document Libraries</h3>
          <p><strong>Security Reports Library:</strong></p>
          <ul>
            <li>Content Types: Daily Report, Weekly Summary, Monthly Analysis, Incident Report</li>
            <li>Metadata: Report Date, Province, Severity Level, Report Type</li>
            <li>Approval workflow for sensitive reports</li>
            <li>Retention policy: 7 years</li>
          </ul>
          
          <p><strong>Emergency Procedures Library:</strong></p>
          <ul>
            <li>Emergency response procedures by province</li>
            <li>Contact lists and escalation matrices</li>
            <li>Training materials and safety protocols</li>
            <li>Version control with approval workflow</li>
          </ul>

          <h3>SP-003: Custom Lists</h3>
          <p><strong>Provinces List:</strong></p>
          <ul>
            <li>Title (Single line of text)</li>
            <li>Province Code (Single line of text)</li>
            <li>Alert Level (Choice: Normal, Warning, Severe)</li>
            <li>Employee Count (Number)</li>
            <li>Last Updated (Date and Time)</li>
            <li>Emergency Contacts (Multiple lines of text)</li>
          </ul>

          <p><strong>Security Incidents List:</strong></p>
          <ul>
            <li>Incident Title (Single line of text)</li>
            <li>Description (Multiple lines of text)</li>
            <li>Province (Lookup to Provinces)</li>
            <li>Incident Date (Date and Time)</li>
            <li>Alert Level (Choice: Normal, Warning, Severe)</li>
            <li>Source (Choice: Police, Global Security, US SOC, Everbridge, Employee, News, Crowdsourced)</li>
            <li>Verification Status (Choice: Verified, Unverified)</li>
            <li>Recommended Action (Multiple lines of text)</li>
            <li>Assigned To (Person or Group)</li>
            <li>Status (Choice: Open, In Progress, Resolved, Closed)</li>
            <li>Attachments (Multiple file upload)</li>
          </ul>

          <p><strong>Employee Directory List:</strong></p>
          <ul>
            <li>Employee Name (Person or Group)</li>
            <li>Employee ID (Single line of text)</li>
            <li>Province (Lookup to Provinces)</li>
            <li>Department (Choice)</li>
            <li>Manager (Person or Group)</li>
            <li>Emergency Contact (Multiple lines of text)</li>
            <li>Last Check-in (Date and Time)</li>
            <li>Safety Status (Choice: Safe, At Risk, Unknown)</li>
          </ul>
        </div>

        <div class="section">
          <h2>Power Automate Flow Specifications</h2>
          
          <h3>PA-001: Alert Ready RSS Processing Flow</h3>
          <p><strong>Trigger:</strong> Recurrence (every 5 minutes)</p>
          <p><strong>Actions:</strong></p>
          <ul>
            <li>HTTP GET to Alert Ready RSS feed</li>
            <li>Parse XML response using Parse JSON</li>
            <li>Apply to each alert item</li>
            <li>Check if alert already exists in SharePoint</li>
            <li>If new, create item in Emergency Alerts list</li>
            <li>If severity is High/Extreme, trigger notification flow</li>
            <li>Update data sync status table</li>
            <li>Log success/failure to SharePoint list</li>
          </ul>

          <h3>PA-002: BC Emergency Alert Processing Flow</h3>
          <p><strong>Trigger:</strong> Recurrence (every 3 minutes)</p>
          <p><strong>Actions:</strong></p>
          <ul>
            <li>HTTP GET to BC Emergency Management website</li>
            <li>Extract alert data using HTML parsing</li>
            <li>Transform data to standardized format</li>
            <li>Filter for active alerts only</li>
            <li>Update SharePoint Emergency Alerts list</li>
            <li>Cross-reference with employee locations</li>
            <li>Generate targeted notifications if employees affected</li>
          </ul>

          <h3>PA-003: Everbridge Integration Flow</h3>
          <p><strong>Trigger:</strong> HTTP Request (webhook from Everbridge)</p>
          <p><strong>Actions:</strong></p>
          <ul>
            <li>Validate incoming webhook payload</li>
            <li>Parse Everbridge alert data</li>
            <li>Map to internal alert schema</li>
            <li>Create incident in SharePoint if severity warrants</li>
            <li>Notify relevant stakeholders via Teams/Email</li>
            <li>Update executive dashboard immediately</li>
            <li>Return success response to Everbridge</li>
          </ul>
        </div>

        <div class="section">
          <h2>Power BI Dashboard Specifications</h2>
          
          <h3>PBI-001: Executive Security Dashboard</h3>
          <p><strong>Page Layout:</strong> Single page with key metrics</p>
          <p><strong>Data Sources:</strong></p>
          <ul>
            <li>SharePoint Lists (Security Incidents, Provinces, Employees)</li>
            <li>Dataverse (Alert data)</li>
            <li>Excel files (Historical data)</li>
          </ul>

          <h3>PBI-002: Operational Security Dashboard</h3>
          <p><strong>Target Audience:</strong> Security operations team</p>
          <p><strong>Pages:</strong></p>
          <ul>
            <li><strong>Real-time Monitoring:</strong> Live incident feed, alert status</li>
            <li><strong>Province Analysis:</strong> Detailed view by province</li>
            <li><strong>Source Analysis:</strong> Performance metrics by data source</li>
            <li><strong>Employee Safety:</strong> Check-in status, location tracking</li>
          </ul>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Security-Barometer-BRD.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Settings className="mr-2 text-primary" />
            Admin Dashboard - Business Requirements Document
          </h1>
          <p className="text-muted-foreground">
            Comprehensive requirements for rebuilding Security Barometer in Microsoft Power Platform
          </p>
        </div>
        <Button onClick={exportToWord} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export to Word
        </Button>
      </div>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="business">Business Req.</TabsTrigger>
          <TabsTrigger value="technical">Technical Req.</TabsTrigger>
          <TabsTrigger value="sharepoint">SharePoint</TabsTrigger>
          <TabsTrigger value="powerautomate">Power Automate</TabsTrigger>
          <TabsTrigger value="powerbi">Power BI</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Barometer - Power Platform Migration
              </CardTitle>
              <CardDescription>Executive Summary and Project Overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Project Scope</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Real-time security incident monitoring for Canadian operations</li>
                    <li>• Employee safety tracking across 10+ provinces</li>
                    <li>• Multi-source alert aggregation (Alert Ready, Everbridge, BC Alerts)</li>
                    <li>• Executive dashboard for risk assessment</li>
                    <li>• Employee check-in and safety verification system</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Key Stakeholders</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Security Operations Team</li>
                    <li>• Executive Leadership</li>
                    <li>• Regional Managers</li>
                    <li>• HR Department</li>
                    <li>• IT Operations</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Success Metrics</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Badge variant="outline" className="justify-center p-3">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    &lt;1min Alert Response Time
                  </Badge>
                  <Badge variant="outline" className="justify-center p-3">
                    <Users className="mr-2 h-4 w-4" />
                    100% Employee Coverage
                  </Badge>
                  <Badge variant="outline" className="justify-center p-3">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Real-time Dashboard Updates
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Business Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">BR-001: Security Incident Management</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Requirement:</strong> The system shall provide real-time monitoring and management of security incidents across Canadian provinces.</p>
                  <p><strong>Priority:</strong> Critical</p>
                  <p><strong>Acceptance Criteria:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Display incidents within 30 seconds of occurrence</li>
                    <li>Categorize by severity (Normal, Warning, Severe)</li>
                    <li>Track incident lifecycle from creation to resolution</li>
                    <li>Support manual incident creation by authorized users</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">BR-002: Emergency Alert Integration</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Requirement:</strong> Integrate with Canadian emergency alert systems including Alert Ready, BC Emergency Management, and Everbridge.</p>
                  <p><strong>Priority:</strong> Critical</p>
                  <p><strong>Acceptance Criteria:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Automatically pull alerts from Alert Ready RSS feeds</li>
                    <li>Parse and display BC-specific emergency alerts</li>
                    <li>Integrate Everbridge notifications</li>
                    <li>Filter alerts by geographic relevance</li>
                    <li>Provide alert categorization and severity mapping</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">BR-003: Employee Safety Tracking</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Requirement:</strong> Track employee distribution and safety status across Canadian provinces.</p>
                  <p><strong>Priority:</strong> High</p>
                  <p><strong>Acceptance Criteria:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Maintain accurate employee count by province</li>
                    <li>Provide employee check-in functionality</li>
                    <li>Generate safety reports by region</li>
                    <li>Alert management when employees are in high-risk areas</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">BR-004: Executive Dashboard</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Requirement:</strong> Provide executive-level dashboard for strategic security oversight.</p>
                  <p><strong>Priority:</strong> High</p>
                  <p><strong>Acceptance Criteria:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Real-time security status overview</li>
                    <li>Key performance indicators and metrics</li>
                    <li>Trend analysis and historical reporting</li>
                    <li>Mobile-responsive design for executive access</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">BR-005: Reporting and Analytics</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Requirement:</strong> Generate comprehensive security reports and analytics.</p>
                  <p><strong>Priority:</strong> Medium</p>
                  <p><strong>Acceptance Criteria:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Automated daily, weekly, and monthly reports</li>
                    <li>Customizable report templates</li>
                    <li>Export capabilities (PDF, Excel, PowerPoint)</li>
                    <li>Scheduled report distribution</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                Technical Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">TR-001: Power Apps Application Architecture</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Application Type:</strong> Canvas App with Model-Driven components</p>
                  <p><strong>Requirements:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Responsive design supporting desktop, tablet, and mobile</li>
                    <li>Role-based security model</li>
                    <li>Offline capability for critical functions</li>
                    <li>Integration with Microsoft 365 ecosystem</li>
                    <li>Custom connectors for external APIs</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">TR-002: Data Architecture</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Primary Data Store:</strong> Microsoft Dataverse</p>
                  <p><strong>Schema Requirements:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li><strong>Provinces Table:</strong> id, name, code, alert_level, employee_count</li>
                    <li><strong>Incidents Table:</strong> id, title, description, province_id, timestamp, alert_level, source, verification_status, recommended_action</li>
                    <li><strong>Employees Table:</strong> id, name, email, province_id, department, manager_id, emergency_contact</li>
                    <li><strong>Emergency Alerts Table:</strong> id, title, description, severity, urgency, area, source, published_date, expiry_date</li>
                    <li><strong>Check-ins Table:</strong> id, employee_id, timestamp, location, status, notes</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">TR-003: API Integration Requirements</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>External APIs:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li><strong>Alert Ready RSS:</strong> https://rss.naad-adna.pelmorex.com/</li>
                    <li><strong>BC Emergency Management:</strong> Custom web scraping or API</li>
                    <li><strong>Everbridge API:</strong> REST API with authentication</li>
                    <li><strong>Police Data APIs:</strong> Various municipal police services</li>
                  </ul>
                  <p><strong>Custom Connectors Required:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Alert Ready RSS Parser</li>
                    <li>BC Emergency Alert Connector</li>
                    <li>Everbridge Integration Connector</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">TR-004: Security and Compliance</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Security Requirements:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Azure AD integration for authentication</li>
                    <li>Multi-factor authentication enforcement</li>
                    <li>Role-based access control (RBAC)</li>
                    <li>Data encryption at rest and in transit</li>
                    <li>Audit logging for all critical operations</li>
                    <li>GDPR and PIPEDA compliance</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">TR-005: Performance Requirements</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Performance Targets:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Application load time: &lt;3 seconds</li>
                    <li>Dashboard refresh rate: 30 seconds</li>
                    <li>Concurrent users: 500+</li>
                    <li>Data processing: 10,000 records/minute</li>
                    <li>API response time: &lt;500ms</li>
                    <li>99.9% uptime SLA</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharepoint" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5" />
                SharePoint Implementation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">SP-001: Site Structure</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Root Site:</strong> Security Barometer Hub</p>
                  <p><strong>Subsites:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>/incidents - Incident management and tracking</li>
                    <li>/alerts - Emergency alert repository</li>
                    <li>/employees - Employee directory and safety records</li>
                    <li>/reports - Generated reports and analytics</li>
                    <li>/admin - Administrative functions and configuration</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">SP-002: Document Libraries</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Security Reports Library:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Content Types: Daily Report, Weekly Summary, Monthly Analysis, Incident Report</li>
                    <li>Metadata: Report Date, Province, Severity Level, Report Type</li>
                    <li>Approval workflow for sensitive reports</li>
                    <li>Retention policy: 7 years</li>
                  </ul>
                  
                  <p><strong>Emergency Procedures Library:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Emergency response procedures by province</li>
                    <li>Contact lists and escalation matrices</li>
                    <li>Training materials and safety protocols</li>
                    <li>Version control with approval workflow</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">SP-003: Custom Lists</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Provinces List:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Title (Single line of text)</li>
                    <li>Province Code (Single line of text)</li>
                    <li>Alert Level (Choice: Normal, Warning, Severe)</li>
                    <li>Employee Count (Number)</li>
                    <li>Last Updated (Date and Time)</li>
                    <li>Emergency Contacts (Multiple lines of text)</li>
                  </ul>

                  <p><strong>Security Incidents List:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Incident Title (Single line of text)</li>
                    <li>Description (Multiple lines of text)</li>
                    <li>Province (Lookup to Provinces)</li>
                    <li>Incident Date (Date and Time)</li>
                    <li>Alert Level (Choice: Normal, Warning, Severe)</li>
                    <li>Source (Choice: Police, Global Security, US SOC, Everbridge, Employee, News, Crowdsourced)</li>
                    <li>Verification Status (Choice: Verified, Unverified)</li>
                    <li>Recommended Action (Multiple lines of text)</li>
                    <li>Assigned To (Person or Group)</li>
                    <li>Status (Choice: Open, In Progress, Resolved, Closed)</li>
                    <li>Attachments (Multiple file upload)</li>
                  </ul>

                  <p><strong>Employee Directory List:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Employee Name (Person or Group)</li>
                    <li>Employee ID (Single line of text)</li>
                    <li>Province (Lookup to Provinces)</li>
                    <li>Department (Choice)</li>
                    <li>Manager (Person or Group)</li>
                    <li>Emergency Contact (Multiple lines of text)</li>
                    <li>Last Check-in (Date and Time)</li>
                    <li>Safety Status (Choice: Safe, At Risk, Unknown)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">SP-004: Content Types</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Security Incident Content Type:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Inherits from: Item</li>
                    <li>Site Columns: All incident-related metadata</li>
                    <li>Document Template: Incident Report Template.docx</li>
                    <li>Information Management Policies: Retention and audit</li>
                  </ul>

                  <p><strong>Emergency Alert Content Type:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Inherits from: Item</li>
                    <li>Site Columns: Alert metadata from external sources</li>
                    <li>Workflow: Alert notification and escalation</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">SP-005: Permissions and Security</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Permission Groups:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li><strong>Security Administrators:</strong> Full Control</li>
                    <li><strong>Security Operators:</strong> Contribute, can create/edit incidents</li>
                    <li><strong>Regional Managers:</strong> Read access to their province data</li>
                    <li><strong>Executives:</strong> Read access to all summary data</li>
                    <li><strong>Employees:</strong> Limited read access to safety information</li>
                  </ul>

                  <p><strong>Item-Level Security:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Sensitive incidents require security clearance</li>
                    <li>Province-based data filtering</li>
                    <li>Executive reports restricted to C-level</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="powerautomate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Workflow className="mr-2 h-5 w-5" />
                Power Automate Flow Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">PA-001: Alert Ready RSS Processing Flow</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Trigger:</strong> Recurrence (every 5 minutes)</p>
                  <p><strong>Actions:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>HTTP GET to Alert Ready RSS feed</li>
                    <li>Parse XML response using Parse JSON</li>
                    <li>Apply to each alert item</li>
                    <li>Check if alert already exists in SharePoint</li>
                    <li>If new, create item in Emergency Alerts list</li>
                    <li>If severity is High/Extreme, trigger notification flow</li>
                    <li>Update data sync status table</li>
                    <li>Log success/failure to SharePoint list</li>
                  </ul>
                  <p><strong>Error Handling:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Try-Catch scope around HTTP operations</li>
                    <li>Email notification to admin on failure</li>
                    <li>Exponential backoff retry policy</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">PA-002: BC Emergency Alert Processing Flow</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Trigger:</strong> Recurrence (every 3 minutes)</p>
                  <p><strong>Actions:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>HTTP GET to BC Emergency Management website</li>
                    <li>Extract alert data using HTML parsing</li>
                    <li>Transform data to standardized format</li>
                    <li>Filter for active alerts only</li>
                    <li>Update SharePoint Emergency Alerts list</li>
                    <li>Cross-reference with employee locations</li>
                    <li>Generate targeted notifications if employees affected</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">PA-003: Everbridge Integration Flow</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Trigger:</strong> HTTP Request (webhook from Everbridge)</p>
                  <p><strong>Actions:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Validate incoming webhook payload</li>
                    <li>Parse Everbridge alert data</li>
                    <li>Map to internal alert schema</li>
                    <li>Create incident in SharePoint if severity warrants</li>
                    <li>Notify relevant stakeholders via Teams/Email</li>
                    <li>Update executive dashboard immediately</li>
                    <li>Return success response to Everbridge</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">PA-004: Incident Escalation Flow</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Trigger:</strong> When an item is created or modified in Security Incidents list</p>
                  <p><strong>Conditions:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>If Alert Level = Severe, immediate escalation</li>
                    <li>If Alert Level = Warning and &gt;2 hours old, escalate</li>
                    <li>If incident unassigned for &gt;30 minutes, escalate</li>
                  </ul>
                  <p><strong>Actions:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Send Teams notification to Security Operations channel</li>
                    <li>Email regional manager for affected province</li>
                    <li>If severe, SMS to on-call security manager</li>
                    <li>Create approval request for executive notification</li>
                    <li>Update incident status to "Escalated"</li>
                    <li>Schedule follow-up reminder in 1 hour</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">PA-005: Employee Check-in Processing Flow</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Trigger:</strong> Power Apps button press (instant flow)</p>
                  <p><strong>Actions:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Get current user information from Azure AD</li>
                    <li>Look up employee record in SharePoint</li>
                    <li>Capture current location (if permission granted)</li>
                    <li>Create check-in record with timestamp</li>
                    <li>Update employee safety status to "Safe"</li>
                    <li>If employee in high-risk province, flag for review</li>
                    <li>Send confirmation message to employee</li>
                    <li>Update manager dashboard if applicable</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">PA-006: Daily Reporting Flow</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Trigger:</strong> Recurrence (daily at 6:00 AM EST)</p>
                  <p><strong>Actions:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Aggregate incident data from previous 24 hours</li>
                    <li>Calculate key metrics (incidents by province, severity distribution)</li>
                    <li>Generate employee safety summary</li>
                    <li>Create Word document from template</li>
                    <li>Populate template with calculated data</li>
                    <li>Convert to PDF</li>
                    <li>Save to SharePoint document library</li>
                    <li>Email to distribution list</li>
                    <li>Post summary to Teams security channel</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">PA-007: Data Sync and Cleanup Flow</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Trigger:</strong> Recurrence (daily at 2:00 AM EST)</p>
                  <p><strong>Actions:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Archive incidents older than 1 year</li>
                    <li>Delete expired emergency alerts</li>
                    <li>Cleanup temporary files and logs</li>
                    <li>Validate data integrity across lists</li>
                    <li>Update employee counts from HR system</li>
                    <li>Refresh Power BI dataset connections</li>
                    <li>Send system health report to administrators</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="powerbi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Power BI Dashboard Specifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">PBI-001: Executive Security Dashboard</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Page Layout:</strong> Single page with key metrics</p>
                  <p><strong>Data Sources:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>SharePoint Lists (Security Incidents, Provinces, Employees)</li>
                    <li>Dataverse (Alert data)</li>
                    <li>Excel files (Historical data)</li>
                  </ul>
                  <p><strong>Visualizations:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li><strong>KPI Cards:</strong> Total Incidents (24h), Active Alerts, Employees at Risk, Provinces with Warnings</li>
                    <li><strong>Map Visual:</strong> Canada map showing alert levels by province</li>
                    <li><strong>Time Series Chart:</strong> Incident trends over last 30 days</li>
                    <li><strong>Bar Chart:</strong> Incidents by source (Police, Everbridge, etc.)</li>
                    <li><strong>Gauge Chart:</strong> Security risk score (calculated metric)</li>
                    <li><strong>Table:</strong> Recent critical incidents with details</li>
                  </ul>
                  <p><strong>Refresh Schedule:</strong> Every 15 minutes during business hours</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">PBI-002: Operational Security Dashboard</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Target Audience:</strong> Security operations team</p>
                  <p><strong>Pages:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li><strong>Real-time Monitoring:</strong> Live incident feed, alert status</li>
                    <li><strong>Province Analysis:</strong> Detailed view by province</li>
                    <li><strong>Source Analysis:</strong> Performance metrics by data source</li>
                    <li><strong>Employee Safety:</strong> Check-in status, location tracking</li>
                  </ul>
                  <p><strong>Key Features:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Drill-through capabilities from summary to detail</li>
                    <li>Bookmarks for different views</li>
                    <li>Mobile layout optimization</li>
                    <li>Row-level security by province access</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">PBI-003: Employee Distribution Report</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Visualizations:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li><strong>Stacked Bar Chart:</strong> Employee count by province and department</li>
                    <li><strong>Pie Chart:</strong> Distribution percentage by province</li>
                    <li><strong>Heat Map:</strong> Employee density across Canada</li>
                    <li><strong>Matrix Table:</strong> Employee count cross-tabbed by province and alert level</li>
                    <li><strong>Trend Chart:</strong> Employee distribution changes over time</li>
                  </ul>
                  <p><strong>Calculated Measures:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Total Employees = SUM(Employees[Count])</li>
                    <li>Employees at Risk = CALCULATE(SUM(Employees[Count]), Provinces[AlertLevel] IN {"{\"Warning\", \"Severe\"}"})</li>
                    <li>Risk Percentage = [Employees at Risk] / [Total Employees]</li>
                    <li>Province Risk Score = SWITCH(Provinces[AlertLevel], "Normal", 1, "Warning", 2, "Severe", 3)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">PBI-004: Alert Analytics Dashboard</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Purpose:</strong> Analyze effectiveness of alert systems</p>
                  <p><strong>Metrics:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Alert volume by source and time</li>
                    <li>Response time to alerts</li>
                    <li>False positive rates</li>
                    <li>Geographic alert distribution</li>
                    <li>Seasonal alert patterns</li>
                  </ul>
                  <p><strong>Advanced Analytics:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Predictive modeling for alert escalation</li>
                    <li>Anomaly detection in alert patterns</li>
                    <li>Correlation analysis between alert sources</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">PBI-005: Data Model Design</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Fact Tables:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li><strong>Incidents:</strong> Grain = One row per incident</li>
                    <li><strong>Alerts:</strong> Grain = One row per alert</li>
                    <li><strong>Check-ins:</strong> Grain = One row per employee check-in</li>
                  </ul>
                  <p><strong>Dimension Tables:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li><strong>Provinces:</strong> Province details and current status</li>
                    <li><strong>Employees:</strong> Employee directory and attributes</li>
                    <li><strong>Date:</strong> Standard date dimension with fiscal calendar</li>
                    <li><strong>Sources:</strong> Alert and incident source definitions</li>
                  </ul>
                  <p><strong>Relationships:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Incidents -&gt; Provinces (Many-to-One)</li>
                    <li>Employees -&gt; Provinces (Many-to-One)</li>
                    <li>Check-ins -&gt; Employees (Many-to-One)</li>
                    <li>All fact tables -&gt; Date (Many-to-One)</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">PBI-006: Security and Sharing</h4>
                <div className="pl-4 space-y-2 text-sm">
                  <p><strong>Workspace Security:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Security Operations workspace for operational dashboards</li>
                    <li>Executive workspace for strategic reports</li>
                    <li>Regional workspaces for province-specific data</li>
                  </ul>
                  <p><strong>Row-Level Security:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>DAX filter: [Province] = USERPRINCIPALNAME()</li>
                    <li>Regional managers see only their province data</li>
                    <li>Security team has access to all provinces</li>
                    <li>Executives have read-only access to summary data</li>
                  </ul>
                  <p><strong>Distribution:</strong></p>
                  <ul className="list-disc list-inside pl-4 space-y-1">
                    <li>Embedded in Power Apps for seamless experience</li>
                    <li>Shared via Teams tabs for collaboration</li>
                    <li>Email subscriptions for key stakeholders</li>
                    <li>Mobile app access for field personnel</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
