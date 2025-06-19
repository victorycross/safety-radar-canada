import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, FileText, Database, Workflow, BarChart3, Shield, Users, AlertTriangle, Download, ListChecks } from 'lucide-react';

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

  const exportImplementationPlan = () => {
    // Create comprehensive implementation plan HTML content
    const implementationPlanContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Security Barometer - Detailed Implementation Plan</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 15px; }
          h2 { color: #1e40af; margin-top: 40px; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
          h3 { color: #1e3a8a; margin-top: 30px; }
          h4 { color: #1e40af; margin-top: 25px; }
          h5 { color: #3730a3; margin-top: 20px; }
          ul { margin-left: 20px; }
          ol { margin-left: 20px; }
          .phase { background-color: #f8fafc; padding: 20px; margin: 20px 0; border-left: 5px solid #2563eb; }
          .step { background-color: #e0e7ff; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .warning { background-color: #fef3c7; padding: 15px; margin: 15px 0; border-left: 4px solid #f59e0b; }
          .success { background-color: #d1fae5; padding: 15px; margin: 15px 0; border-left: 4px solid #10b981; }
          .code { background-color: #f3f4f6; padding: 10px; border-radius: 4px; font-family: monospace; }
          .checklist { background-color: #fef7ff; padding: 15px; margin: 15px 0; border-left: 4px solid #a855f7; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; }
          .timeline { margin: 20px 0; }
          .milestone { padding: 10px; margin: 10px 0; background-color: #ecfdf5; border-left: 4px solid #059669; }
        </style>
      </head>
      <body>
        <h1>Security Barometer - Detailed Implementation Plan</h1>
        <h2>Microsoft Power Platform Implementation Guide</h2>
        
        <div class="phase">
          <h2>Executive Summary</h2>
          <p>This document provides a comprehensive, step-by-step implementation plan for rebuilding the Security Barometer application using Microsoft Power Platform components (SharePoint, Power Apps, Power Automate, and Power BI).</p>
          
          <h3>Implementation Timeline</h3>
          <div class="timeline">
            <div class="milestone"><strong>Phase 1 (Weeks 1-2):</strong> Foundation Setup - SharePoint & Environment</div>
            <div class="milestone"><strong>Phase 2 (Weeks 3-4):</strong> Data Integration - Power Automate Flows</div>
            <div class="milestone"><strong>Phase 3 (Weeks 5-6):</strong> Application Development - Power Apps</div>
            <div class="milestone"><strong>Phase 4 (Weeks 7-8):</strong> Analytics & Reporting - Power BI</div>
            <div class="milestone"><strong>Phase 5 (Weeks 9-10):</strong> Testing, Security & Deployment</div>
          </div>
          
          <h3>Required Resources</h3>
          <ul>
            <li><strong>Team:</strong> SharePoint Admin, Power Platform Developer, Data Analyst, Security Specialist</li>
            <li><strong>Licenses:</strong> Power Apps Premium, Power Automate Premium, Power BI Pro, SharePoint Online Plan 2</li>
            <li><strong>External APIs:</strong> Alert Ready, BC Emergency Management, Everbridge access</li>
          </ul>
        </div>

        <div class="phase">
          <h2>Phase 1: Foundation Setup (Weeks 1-2)</h2>
          
          <h3>1.1 Environment Preparation</h3>
          <div class="step">
            <h4>Step 1: Create Power Platform Environment</h4>
            <ol>
              <li>Navigate to Power Platform Admin Center (admin.powerplatform.microsoft.com)</li>
              <li>Click "Environments" → "New"</li>
              <li>Configure environment:
                <ul>
                  <li>Name: "Security-Barometer-Production"</li>
                  <li>Type: Production</li>
                  <li>Region: Canada (or closest)</li>
                  <li>Create Dataverse database: Yes</li>
                  <li>Language: English</li>
                  <li>Currency: CAD</li>
                </ul>
              </li>
              <li>Wait for environment provisioning (15-30 minutes)</li>
              <li>Assign security roles to team members</li>
            </ol>
          </div>

          <div class="step">
            <h4>Step 2: Configure Security Groups and Permissions</h4>
            <ol>
              <li>In Azure AD, create security groups:
                <ul>
                  <li>SB-Administrators</li>
                  <li>SB-Security-Operators</li>
                  <li>SB-Regional-Managers</li>
                  <li>SB-Executives</li>
                  <li>SB-Employees</li>
                </ul>
              </li>
              <li>Assign appropriate members to each group</li>
              <li>Configure conditional access policies for sensitive data</li>
              <li>Enable MFA for all admin and operator accounts</li>
            </ol>
          </div>

          <h3>1.2 SharePoint Site Structure Setup</h3>
          <div class="step">
            <h4>Step 3: Create Root Site Collection</h4>
            <ol>
              <li>Navigate to SharePoint Admin Center</li>
              <li>Create new site collection:
                <ul>
                  <li>Template: Team Site</li>
                  <li>Site Name: "Security Barometer Hub"</li>
                  <li>URL: /sites/security-barometer</li>
                  <li>Language: English</li>
                  <li>Owner: Primary admin</li>
                </ul>
              </li>
              <li>Configure site permissions using security groups created above</li>
              <li>Enable site features:
                <ul>
                  <li>Publishing Infrastructure</li>
                  <li>SharePoint Server Enterprise</li>
                  <li>Workflows</li>
                  <li>Content Organizer</li>
                </ul>
              </li>
            </ol>
          </div>

          <div class="step">
            <h4>Step 4: Create Subsites</h4>
            <ol>
              <li>From root site, create subsites:
                <ul>
                  <li>/incidents - "Incident Management"</li>
                  <li>/alerts - "Emergency Alerts Repository"</li>
                  <li>/employees - "Employee Directory & Safety"</li>
                  <li>/reports - "Reports & Analytics"</li>
                  <li>/admin - "Administrative Functions"</li>
                </ul>
              </li>
              <li>Configure unique permissions for each subsite</li>
              <li>Set up navigation structure across all sites</li>
            </ol>
          </div>

          <h3>1.3 Custom Lists Creation</h3>
          <div class="step">
            <h4>Step 5: Create Provinces List</h4>
            <ol>
              <li>Navigate to root site → Site Contents → New → List</li>
              <li>Create custom list named "Provinces"</li>
              <li>Add columns:
                <table>
                  <tr><th>Column Name</th><th>Type</th><th>Settings</th></tr>
                  <tr><td>Title</td><td>Single line of text</td><td>Required, unique</td></tr>
                  <tr><td>Province Code</td><td>Single line of text</td><td>2 characters, required</td></tr>
                  <tr><td>Alert Level</td><td>Choice</td><td>Normal, Warning, Severe</td></tr>
                  <tr><td>Employee Count</td><td>Number</td><td>Integer, default 0</td></tr>
                  <tr><td>Last Updated</td><td>Date and Time</td><td>Default today</td></tr>
                  <tr><td>Emergency Contacts</td><td>Multiple lines of text</td><td>Rich text enabled</td></tr>
                  <tr><td>Latitude</td><td>Number</td><td>Decimal places: 6</td></tr>
                  <tr><td>Longitude</td><td>Number</td><td>Decimal places: 6</td></tr>
                </table>
              </li>
              <li>Create views:
                <ul>
                  <li>All Provinces (default)</li>
                  <li>High Alert Provinces</li>
                  <li>Employee Distribution</li>
                </ul>
              </li>
              <li>Populate with Canadian provinces data</li>
            </ol>
          </div>

          <div class="step">
            <h4>Step 6: Create Security Incidents List</h4>
            <ol>
              <li>Navigate to /incidents subsite</li>
              <li>Create custom list named "Security Incidents"</li>
              <li>Add columns:
                <table>
                  <tr><th>Column Name</th><th>Type</th><th>Settings</th></tr>
                  <tr><td>Incident Title</td><td>Single line of text</td><td>Required, 255 chars max</td></tr>
                  <tr><td>Description</td><td>Multiple lines of text</td><td>Rich text, enhanced</td></tr>
                  <tr><td>Province</td><td>Lookup</td><td>Link to Provinces list</td></tr>
                  <tr><td>Incident Date</td><td>Date and Time</td><td>Include time</td></tr>
                  <tr><td>Alert Level</td><td>Choice</td><td>Normal, Warning, Severe</td></tr>
                  <tr><td>Source</td><td>Choice</td><td>Police, Global Security, US SOC, Everbridge, Employee, News, Crowdsourced</td></tr>
                  <tr><td>Verification Status</td><td>Choice</td><td>Verified, Unverified, Pending</td></tr>
                  <tr><td>Recommended Action</td><td>Multiple lines of text</td><td>Plain text</td></tr>
                  <tr><td>Assigned To</td><td>Person or Group</td><td>Multiple selection</td></tr>
                  <tr><td>Status</td><td>Choice</td><td>Open, In Progress, Resolved, Closed</td></tr>
                  <tr><td>Priority</td><td>Choice</td><td>Low, Medium, High, Critical</td></tr>
                  <tr><td>Impact Assessment</td><td>Multiple lines of text</td><td>Rich text</td></tr>
                  <tr><td>Resolution Notes</td><td>Multiple lines of text</td><td>Rich text</td></tr>
                </table>
              </li>
              <li>Configure content types and workflows</li>
              <li>Set up item-level permissions</li>
              <li>Create custom views for different user roles</li>
            </ol>
          </div>

          <div class="step">
            <h4>Step 7: Create Additional Lists</h4>
            <ol>
              <li><strong>Emergency Alerts List</strong> (/alerts subsite):
                <ul>
                  <li>Alert Title, Description, Severity, Urgency</li>
                  <li>Geographic Area, Source, Published Date, Expiry Date</li>
                  <li>Alert Type, Language, Instructions</li>
                </ul>
              </li>
              <li><strong>Employee Directory List</strong> (/employees subsite):
                <ul>
                  <li>Employee Name, ID, Email, Phone</li>
                  <li>Province, Department, Manager</li>
                  <li>Emergency Contact, Last Check-in, Safety Status</li>
                </ul>
              </li>
              <li><strong>Check-ins List</strong> (/employees subsite):
                <ul>
                  <li>Employee, Timestamp, Location, Status</li>
                  <li>GPS Coordinates, Notes, Verification Method</li>
                </ul>
              </li>
            </ol>
          </div>

          <div class="checklist">
            <h4>Phase 1 Checklist</h4>
            <ul>
              <li>☐ Power Platform environment created and configured</li>
              <li>☐ Security groups established in Azure AD</li>
              <li>☐ SharePoint site structure deployed</li>
              <li>☐ All custom lists created with proper columns</li>
              <li>☐ Permissions configured across all sites</li>
              <li>☐ Sample data populated for testing</li>
            </ul>
          </div>
        </div>

        <div class="phase">
          <h2>Phase 2: Data Integration - Power Automate (Weeks 3-4)</h2>
          
          <h3>2.1 Alert Ready RSS Integration</h3>
          <div class="step">
            <h4>Step 8: Create Alert Ready Processing Flow</h4>
            <ol>
              <li>Navigate to Power Automate (flow.microsoft.com)</li>
              <li>Select correct environment</li>
              <li>Create new automated cloud flow:
                <ul>
                  <li>Name: "Alert Ready RSS Processor"</li>
                  <li>Trigger: Recurrence (every 5 minutes)</li>
                </ul>
              </li>
              <li>Add HTTP action:
                <ul>
                  <li>Method: GET</li>
                  <li>URI: https://rss.naad-adna.pelmorex.com/</li>
                  <li>Headers: Accept: application/rss+xml</li>
                </ul>
              </li>
              <li>Add "Parse JSON" action to handle RSS response</li>
              <li>Add "Apply to each" to process individual alerts</li>
              <li>Add condition to check if alert already exists</li>
              <li>Add "Create item" action for SharePoint Emergency Alerts list</li>
              <li>Add error handling with Try-Catch scope</li>
              <li>Test flow with sample RSS data</li>
            </ol>
          </div>

          <div class="step">
            <h4>Step 9: Configure Alert Processing Logic</h4>
            <ol>
              <li>Add data transformation steps:
                <ul>
                  <li>Parse XML to JSON using expressions</li>
                  <li>Extract relevant fields (title, description, severity, area)</li>
                  <li>Map severity levels to internal standards</li>
                  <li>Filter alerts by geographic relevance</li>
                </ul>
              </li>
              <li>Implement duplicate detection:
                <ul>
                  <li>Query existing alerts by unique identifier</li>
                  <li>Skip processing if alert already exists</li>
                  <li>Update existing alerts if content changed</li>
                </ul>
              </li>
              <li>Add notification logic for high-severity alerts</li>
              <li>Configure logging to track processing success/failures</li>
            </ol>
          </div>

          <h3>2.2 BC Emergency Management Integration</h3>
          <div class="step">
            <h4>Step 10: Create BC Alerts Scraping Flow</h4>
            <ol>
              <li>Create new flow: "BC Emergency Alert Processor"</li>
              <li>Set recurrence trigger (every 3 minutes)</li>
              <li>Add HTTP action to BC Emergency Management website</li>
              <li>Use HTML parsing to extract alert data:
                <ul>
                  <li>Identify CSS selectors for alert elements</li>
                  <li>Extract title, description, time, severity</li>
                  <li>Parse geographic information</li>
                </ul>
              </li>
              <li>Transform data to standard format</li>
              <li>Filter for active alerts only</li>
              <li>Update SharePoint list with new data</li>
              <li>Implement robust error handling</li>
            </ol>
          </div>

          <h3>2.3 Everbridge API Integration</h3>
          <div class="step">
            <h4>Step 11: Set up Everbridge Webhook</h4>
            <ol>
              <li>Create instant flow: "Everbridge Alert Handler"</li>
              <li>Use HTTP Request trigger to create webhook endpoint</li>
              <li>Configure Everbridge to send webhooks to Power Automate URL</li>
              <li>Set up authentication and validation:
                <ul>
                  <li>Validate webhook signature</li>
                  <li>Check API key in headers</li>
                  <li>Verify payload structure</li>
                </ul>
              </li>
              <li>Parse Everbridge alert payload</li>
              <li>Map to internal incident/alert schema</li>
              <li>Create appropriate SharePoint list items</li>
              <li>Return success response to Everbridge</li>
            </ol>
          </div>

          <h3>2.4 Incident Management Workflows</h3>
          <div class="step">
            <h4>Step 12: Create Incident Escalation Flow</h4>
            <ol>
              <li>Create flow triggered by SharePoint list item changes</li>
              <li>Add conditions for escalation rules:
                <ul>
                  <li>Severe incidents → immediate escalation</li>
                  <li>Warning incidents older than 2 hours</li>
                  <li>Unassigned incidents after 30 minutes</li>
                </ul>
              </li>
              <li>Configure notification actions:
                <ul>
                  <li>Teams message to security channel</li>
                  <li>Email to regional managers</li>
                  <li>SMS for critical incidents</li>
                  <li>Mobile push notifications</li>
                </ul>
              </li>
              <li>Update incident status and assign tasks</li>
              <li>Schedule follow-up reminders</li>
            </ol>
          </div>

          <div class="checklist">
            <h4>Phase 2 Checklist</h4>
            <ul>
              <li>☐ Alert Ready RSS flow operational</li>
              <li>☐ BC Emergency alerts integration working</li>
              <li>☐ Everbridge webhook configured and tested</li>
              <li>☐ Incident escalation workflows active</li>
              <li>☐ Error handling and logging implemented</li>
              <li>☐ Data quality validation in place</li>
            </ul>
          </div>
        </div>

        <div class="phase">
          <h2>Phase 3: Application Development - Power Apps (Weeks 5-6)</h2>
          
          <h3>3.1 Main Security Dashboard App</h3>
          <div class="step">
            <h4>Step 13: Create Canvas App Foundation</h4>
            <ol>
              <li>Navigate to Power Apps (make.powerapps.com)</li>
              <li>Create new canvas app:
                <ul>
                  <li>Name: "Security Barometer Dashboard"</li>
                  <li>Format: Tablet layout</li>
                  <li>Connect to SharePoint data sources</li>
                </ul>
              </li>
              <li>Set up data connections:
                <ul>
                  <li>Provinces list</li>
                  <li>Security Incidents list</li>
                  <li>Emergency Alerts list</li>
                  <li>Employee Directory list</li>
                </ul>
              </li>
              <li>Design responsive layout structure</li>
              <li>Configure navigation between screens</li>
            </ol>
          </div>

          <div class="step">
            <h4>Step 14: Build Main Dashboard Screen</h4>
            <ol>
              <li>Create dashboard layout with sections:
                <ul>
                  <li>Header with current status summary</li>
                  <li>Canada map with province alert levels</li>
                  <li>Recent incidents list</li>
                  <li>Active alerts panel</li>
                  <li>Employee safety summary</li>
                </ul>
              </li>
              <li>Add interactive map component using Power Apps maps</li>
              <li>Implement color coding for alert levels</li>
              <li>Add real-time data refresh functionality</li>
              <li>Configure drill-down navigation to detail screens</li>
            </ol>
          </div>

          <div class="step">
            <h4>Step 15: Incident Management Screens</h4>
            <ol>
              <li>Create incident list screen:
                <ul>
                  <li>Filterable gallery of incidents</li>
                  <li>Search functionality</li>
                  <li>Sort by date, severity, province</li>
                  <li>Status indicators and progress bars</li>
                </ul>
              </li>
              <li>Build incident detail screen:
                <ul>
                  <li>Complete incident information</li>
                  <li>Assignment and status update controls</li>
                  <li>Comment and resolution tracking</li>
                  <li>File attachment support</li>
                </ul>
              </li>
              <li>Create new incident form:
                <ul>
                  <li>Input validation and data quality checks</li>
                  <li>Auto-population from templates</li>
                  <li>Geographic selection tools</li>
                  <li>Photo and document upload</li>
                </ul>
              </li>
            </ol>
          </div>

          <h3>3.2 Employee Safety App</h3>
          <div class="step">
            <h4>Step 16: Build Employee Check-in App</h4>
            <ol>
              <li>Create mobile-optimized canvas app</li>
              <li>Design simple check-in interface:
                <ul>
                  <li>One-tap safety confirmation</li>
                  <li>Location services integration</li>
                  <li>Emergency contact buttons</li>
                  <li>Status message capability</li>
                </ul>
              </li>
              <li>Implement GPS location capture</li>
              <li>Add offline capability for remote areas</li>
              <li>Configure automatic check-in reminders</li>
            </ol>
          </div>

          <h3>3.3 Administrative Functions</h3>
          <div class="step">
            <h4>Step 17: Build Admin Configuration App</h4>
            <ol>
              <li>Create role-based admin interface</li>
              <li>Implement user management screens</li>
              <li>Build system configuration panels:
                <ul>
                  <li>Alert source management</li>
                  <li>Escalation rule configuration</li>
                  <li>Geographic boundary setup</li>
                  <li>Notification template editing</li>
                </ul>
              </li>
              <li>Add system monitoring and health checks</li>
              <li>Configure audit logging interface</li>
            </ol>
          </div>

          <div class="checklist">
            <h4>Phase 3 Checklist</h4>
            <ul>
              <li>☐ Main dashboard app functional</li>
              <li>☐ Incident management workflows complete</li>
              <li>☐ Employee check-in app deployed</li>
              <li>☐ Administrative functions operational</li>
              <li>☐ Mobile responsiveness verified</li>
              <li>☐ Data validation and error handling tested</li>
            </ul>
          </div>
        </div>

        <div class="phase">
          <h2>Phase 4: Analytics & Reporting - Power BI (Weeks 7-8)</h2>
          
          <h3>4.1 Data Model Development</h3>
          <div class="step">
            <h4>Step 18: Design Power BI Data Model</h4>
            <ol>
              <li>Open Power BI Desktop</li>
              <li>Connect to SharePoint data sources:
                <ul>
                  <li>Get Data → SharePoint Online Lists</li>
                  <li>Connect to all relevant lists</li>
                  <li>Configure data refresh credentials</li>
                </ul>
              </li>
              <li>Build fact and dimension tables:
                <ul>
                  <li><strong>Fact Tables:</strong> Incidents, Alerts, Check-ins</li>
                  <li><strong>Dimension Tables:</strong> Provinces, Employees, Date, Sources</li>
                </ul>
              </li>
              <li>Create relationships between tables:
                <ul>
                  <li>Incidents → Provinces (Many-to-One)</li>
                  <li>Employees → Provinces (Many-to-One)</li>
                  <li>Check-ins → Employees (Many-to-One)</li>
                  <li>All facts → Date dimension</li>
                </ul>
              </li>
              <li>Create calculated columns and measures</li>
            </ol>
          </div>

          <div class="step">
            <h4>Step 19: Build Executive Dashboard</h4>
            <ol>
              <li>Create new report page for executives</li>
              <li>Add key performance indicator cards:
                <ul>
                  <li>Total incidents (24h)</li>
                  <li>Active alerts count</li>
                  <li>Employees at risk</li>
                  <li>Provinces with warnings</li>
                </ul>
              </li>
              <li>Insert Canada map visual:
                <ul>
                  <li>Configure provinces with alert level colors</li>
                  <li>Add tooltips with detailed information</li>
                  <li>Enable drill-through to province details</li>
                </ul>
              </li>
              <li>Create trend analysis charts:
                <ul>
                  <li>Incident volume over time</li>
                  <li>Severity distribution</li>
                  <li>Source effectiveness metrics</li>
                </ul>
              </li>
              <li>Add recent incidents table with conditional formatting</li>
            </ol>
          </div>

          <h3>4.2 Operational Dashboards</h3>
          <div class="step">
            <h4>Step 20: Build Security Operations Dashboard</h4>
            <ol>
              <li>Create multi-page report for operations team</li>
              <li><strong>Page 1 - Real-time Monitoring:</strong>
                <ul>
                  <li>Live incident feed with refresh every 30 seconds</li>
                  <li>Alert status indicators</li>
                  <li>Response time metrics</li>
                  <li>Assignment tracking</li>
                </ul>
              </li>
              <li><strong>Page 2 - Province Analysis:</strong>
                <ul>
                  <li>Detailed province-by-province breakdown</li>
                  <li>Historical trend analysis</li>
                  <li>Risk assessment calculations</li>
                  <li>Employee distribution analysis</li>
                </ul>
              </li>
              <li><strong>Page 3 - Source Performance:</strong>
                <ul>
                  <li>Alert source reliability metrics</li>
                  <li>Response time by source</li>
                  <li>False positive rate analysis</li>
                  <li>Data quality indicators</li>
                </ul>
              </li>
            </ol>
          </div>

          <h3>4.3 Advanced Analytics</h3>
          <div class="step">
            <h4>Step 21: Implement Predictive Analytics</h4>
            <ol>
              <li>Create R or Python scripts for advanced analytics</li>
              <li>Implement forecasting models:
                <ul>
                  <li>Incident volume prediction</li>
                  <li>Seasonal pattern analysis</li>
                  <li>Risk escalation probability</li>
                </ul>
              </li>
              <li>Add anomaly detection:
                <ul>
                  <li>Unusual incident patterns</li>
                  <li>Alert source anomalies</li>
                  <li>Geographic clustering analysis</li>
                </ul>
              </li>
              <li>Create correlation analysis between data sources</li>
            </ol>
          </div>

          <div class="checklist">
            <h4>Phase 4 Checklist</h4>
            <ul>
              <li>☐ Power BI data model optimized</li>
              <li>☐ Executive dashboard completed</li>
              <li>☐ Operational dashboards functional</li>
              <li>☐ Advanced analytics implemented</li>
              <li>☐ Automated refresh schedules configured</li>
              <li>☐ Row-level security applied</li>
            </ul>
          </div>
        </div>

        <div class="phase">
          <h2>Phase 5: Testing, Security & Deployment (Weeks 9-10)</h2>
          
          <h3>5.1 Security Implementation</h3>
          <div class="step">
            <h4>Step 22: Configure Row-Level Security</h4>
            <ol>
              <li>In Power BI Desktop, create security roles:
                <ul>
                  <li>Regional Manager role with province filtering</li>
                  <li>Operations role with full access</li>
                  <li>Executive role with summary access only</li>
                </ul>
              </li>
              <li>Define DAX security filters:
                <ul>
                  <li><code>[Province] = USERPRINCIPALNAME()</code> for regional access</li>
                  <li>Custom logic for executive summary views</li>
                </ul>
              </li>
              <li>Test security with different user accounts</li>
              <li>Validate data isolation between roles</li>
            </ol>
          </div>

          <div class="step">
            <h4>Step 23: SharePoint Security Hardening</h4>
            <ol>
              <li>Review and tighten permissions on all lists</li>
              <li>Enable audit logging on sensitive lists</li>
              <li>Configure information management policies</li>
              <li>Set up retention schedules</li>
              <li>Enable versioning and approval workflows</li>
              <li>Configure external sharing restrictions</li>
            </ol>
          </div>

          <h3>5.2 Testing and Quality Assurance</h3>
          <div class="step">
            <h4>Step 24: Comprehensive System Testing</h4>
            <ol>
              <li><strong>Unit Testing:</strong>
                <ul>
                  <li>Individual Power Automate flows</li>
                  <li>Power Apps form validation</li>
                  <li>SharePoint workflow logic</li>
                  <li>Power BI calculation accuracy</li>
                </ul>
              </li>
              <li><strong>Integration Testing:</strong>
                <ul>
                  <li>End-to-end alert processing</li>
                  <li>Cross-platform data flow</li>
                  <li>API connectivity and error handling</li>
                  <li>User role and permission validation</li>
                </ul>
              </li>
              <li><strong>Performance Testing:</strong>
                <ul>
                  <li>Load testing with multiple users</li>
                  <li>Data processing speed validation</li>
                  <li>Dashboard refresh performance</li>
                  <li>Mobile app responsiveness</li>
                </ul>
              </li>
              <li><strong>Security Testing:</strong>
                <ul>
                  <li>Penetration testing of web interfaces</li>
                  <li>Role-based access verification</li>
                  <li>Data encryption validation</li>
                  <li>Audit trail completeness</li>
                </ul>
              </li>
            </ol>
          </div>

          <h3>5.3 User Training and Documentation</h3>
          <div class="step">
            <h4>Step 25: Create Training Materials</h4>
            <ol>
              <li>Develop user guides for each role:
                <ul>
                  <li>Administrator setup and maintenance guide</li>
                  <li>Security operator daily procedures</li>
                  <li>Regional manager reporting guide</li>
                  <li>Employee check-in instructions</li>
                  <li>Executive dashboard navigation</li>
                </ul>
              </li>
              <li>Create video tutorials for key workflows</li>
              <li>Develop troubleshooting documentation</li>
              <li>Set up help desk procedures</li>
            </ol>
          </div>

          <div class="step">
            <h4>Step 26: Conduct User Training Sessions</h4>
            <ol>
              <li>Schedule training sessions by user group</li>
              <li>Provide hands-on practice in test environment</li>
              <li>Collect feedback and make necessary adjustments</li>
              <li>Certify key users as system champions</li>
              <li>Establish ongoing training schedule</li>
            </ol>
          </div>

          <h3>5.4 Production Deployment</h3>
          <div class="step">
            <h4>Step 27: Deploy to Production</h4>
            <ol>
              <li>Create production deployment checklist</li>
              <li>Schedule maintenance window for cutover</li>
              <li>Export all solutions from development environment</li>
              <li>Import and configure in production environment</li>
              <li>Update all external API connections</li>
              <li>Validate all functionality in production</li>
              <li>Monitor system performance post-deployment</li>
            </ol>
          </div>

          <div class="success">
            <h4>Go-Live Checklist</h4>
            <ul>
              <li>☐ All systems tested and validated</li>
              <li>☐ Security configurations verified</li>
              <li>☐ User training completed</li>
              <li>☐ Documentation finalized</li>
              <li>☐ Support procedures established</li>
              <li>☐ Monitoring and alerting configured</li>
              <li>☐ Backup and recovery procedures tested</li>
              <li>☐ Stakeholder sign-off obtained</li>
            </ul>
          </div>
        </div>

        <div class="phase">
          <h2>Post-Implementation Support</h2>
          
          <h3>Ongoing Maintenance Tasks</h3>
          <div class="step">
            <h4>Daily Operations</h4>
            <ul>
              <li>Monitor Power Automate flow execution status</li>
              <li>Review system performance metrics</li>
              <li>Check data quality and completeness</li>
              <li>Respond to user support requests</li>
              <li>Validate external API connectivity</li>
            </ul>
          </div>

          <div class="step">
            <h4>Weekly Tasks</h4>
            <ul>
              <li>Review security logs and audit reports</li>
              <li>Analyze system usage patterns</li>
              <li>Update documentation as needed</li>
              <li>Conduct user feedback sessions</li>
              <li>Plan system improvements and enhancements</li>
            </ul>
          </div>

          <div class="step">
            <h4>Monthly Tasks</h4>
            <ul>
              <li>Perform comprehensive system health check</li>
              <li>Review and update security configurations</li>
              <li>Analyze performance trends and capacity planning</li>
              <li>Update external API configurations as needed</li>
              <li>Conduct disaster recovery testing</li>
            </ul>
          </div>
        </div>

        <h2>Appendices</h2>
        
        <h3>Appendix A: Required Licenses</h3>
        <table>
          <tr><th>Product</th><th>License Type</th><th>Quantity</th><th>Purpose</th></tr>
          <tr><td>Power Apps</td><td>Premium per user</td><td>20</td><td>App development and usage</td></tr>
          <tr><td>Power Automate</td><td>Premium per user</td><td>10</td><td>Advanced flow capabilities</td></tr>
          <tr><td>Power BI</td><td>Pro per user</td><td>50</td><td>Dashboard creation and sharing</td></tr>
          <tr><td>SharePoint</td><td>Online Plan 2</td><td>All users</td><td>Data storage and collaboration</td></tr>
          <tr><td>Azure AD</td><td>Premium P1</td><td>All users</td><td>Advanced security features</td></tr>
        </table>

        <h3>Appendix B: External API Documentation</h3>
        <ul>
          <li><strong>Alert Ready RSS:</strong> https://rss.naad-adna.pelmorex.com/</li>
          <li><strong>BC Emergency Management:</strong> Contact provincial emergency management office</li>
          <li><strong>Everbridge API:</strong> https://api.everbridge.net/rest/</li>
        </ul>

        <h3>Appendix C: Emergency Contacts</h3>
        <ul>
          <li><strong>Technical Support:</strong> IT Help Desk</li>
          <li><strong>Security Operations:</strong> 24/7 SOC</li>
          <li><strong>System Administrator:</strong> Primary admin contact</li>
        </ul>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob([implementationPlanContent], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Security-Barometer-Implementation-Plan.doc';
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
        <div className="flex gap-2">
          <Button onClick={exportImplementationPlan} className="flex items-center gap-2" variant="outline">
            <ListChecks className="h-4 w-4" />
            Implementation Plan
          </Button>
          <Button onClick={exportToWord} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export to Word
          </Button>
        </div>
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

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center">
                  <ListChecks className="mr-2 h-4 w-4" />
                  Implementation Plan Available
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  A comprehensive step-by-step implementation plan is available for download, covering all phases 
                  of the Security Barometer migration to Microsoft Power Platform.
                </p>
                <Button onClick={exportImplementationPlan} size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download Implementation Plan
                </Button>
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
