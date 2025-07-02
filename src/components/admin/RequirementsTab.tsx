
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock, Users, Shield, Database, Brain, BarChart3 } from 'lucide-react';

const RequirementsTab = () => {
  const functionalRequirements = [
    {
      id: 'FR-001',
      title: 'Alert Management System',
      description: 'Core functionality for ingesting, processing, and managing security alerts from multiple sources.',
      priority: 'High',
      status: 'Implemented',
      icon: AlertCircle,
      details: [
        'Multi-source alert ingestion (RSS, API, manual)',
        'Alert categorization and severity assessment',
        'Alert archiving and lifecycle management',
        'Real-time alert processing and notifications'
      ]
    },
    {
      id: 'FR-002',
      title: 'Geographic Incident Tracking',
      description: 'Track and visualize security incidents across Canadian provinces and international hubs.',
      priority: 'High',
      status: 'Implemented',
      icon: Database,
      details: [
        'Province-level incident management',
        'International hub incident tracking',
        'Geographic visualization and mapping',
        'Location-based alert filtering and reporting'
      ]
    },
    {
      id: 'FR-003',
      title: 'Multi-Tenant User Management',
      description: 'Comprehensive user authentication, authorization, and role-based access control.',
      priority: 'High',
      status: 'Implemented',
      icon: Users,
      details: [
        'Role-based access control (Admin, Power User, Regular User)',
        'Organization-level user isolation',
        'Secure authentication and session management',
        'User profile and permission management'
      ]
    },
    {
      id: 'FR-004',
      title: 'AI-Enhanced Alert Processing',
      description: 'Intelligent alert processing using configurable AI providers for enhanced analysis and automation.',
      priority: 'High',
      status: 'In Development',
      icon: Brain,
      details: [
        'Multi-provider AI integration (OpenAI, Anthropic, Google, Azure)',
        'Intelligent alert parsing and classification',
        'Automatic alert correlation and deduplication',
        'AI-powered content summarization and analysis',
        'Organization-specific AI configuration management',
        'Cost monitoring and usage controls'
      ]
    },
    {
      id: 'FR-005',
      title: 'Advanced Analytics and Reporting',
      description: 'Comprehensive analytics dashboard with AI-powered insights and automated reporting.',
      priority: 'Medium',
      status: 'Planned',
      icon: BarChart3,
      details: [
        'Real-time analytics dashboard',
        'Trend analysis and pattern recognition',
        'Predictive threat assessment',
        'Automated report generation',
        'Executive summary dashboards',
        'Custom analytics queries and visualizations'
      ]
    }
  ];

  const nonFunctionalRequirements = [
    {
      category: 'Performance',
      icon: Clock,
      requirements: [
        'Alert processing latency < 5 seconds for real-time alerts',
        'AI processing latency < 30 seconds for complex analysis',
        'System response time < 2 seconds for standard operations',
        'Support for 10,000+ concurrent users',
        'Database query optimization for large datasets (>1M records)'
      ]
    },
    {
      category: 'Security',
      icon: Shield,
      requirements: [
        'End-to-end encryption for sensitive data',
        'Encrypted storage of AI API keys using AES-256',
        'Row-level security (RLS) for multi-tenant data isolation',
        'Comprehensive audit logging for all system actions',
        'GDPR and CCPA compliance for data processing',
        'Regular security vulnerability assessments'
      ]
    },
    {
      category: 'Reliability',
      icon: CheckCircle2,
      requirements: [
        '99.9% system uptime availability',
        'Automated failover and disaster recovery',
        'Graceful degradation when AI services are unavailable',
        'Data backup and recovery procedures',
        'Monitoring and alerting for system health',
        'Load balancing and auto-scaling capabilities'
      ]
    },
    {
      category: 'AI-Specific',
      icon: Brain,
      requirements: [
        'Cost control mechanisms for AI API usage',
        'Fallback processing when AI services are unavailable',
        'Configurable AI processing workflows per organization',
        'Privacy-preserving AI processing (PII masking)',
        'AI model performance monitoring and optimization',
        'Support for multiple AI providers with failover'
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Implemented': return 'bg-green-100 text-green-800';
      case 'In Development': return 'bg-blue-100 text-blue-800';
      case 'Planned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">System Requirements</h3>
        <p className="text-muted-foreground">
          Comprehensive functional and non-functional requirements for the AI-enhanced security alert management system
        </p>
      </div>

      {/* Functional Requirements */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Functional Requirements</h4>
        <div className="grid gap-4">
          {functionalRequirements.map((req) => {
            const Icon = req.icon;
            return (
              <Card key={req.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">{req.id}: {req.title}</CardTitle>
                        <CardDescription>{req.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(req.priority)}>
                        {req.priority}
                      </Badge>
                      <Badge className={getStatusColor(req.status)}>
                        {req.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {req.details.map((detail, index) => (
                      <li key={index} className="text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Non-Functional Requirements */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Non-Functional Requirements</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nonFunctionalRequirements.map((category) => {
            const Icon = category.icon;
            return (
              <Card key={category.category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-blue-600" />
                    {category.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.requirements.map((req, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Compliance and Standards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Compliance and Standards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold mb-2">Data Protection</h5>
              <ul className="space-y-1 text-sm">
                <li>• GDPR compliance for EU data subjects</li>
                <li>• CCPA compliance for California residents</li>
                <li>• PIPEDA compliance for Canadian privacy laws</li>
                <li>• SOC 2 Type II security controls</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Security Standards</h5>
              <ul className="space-y-1 text-sm">
                <li>• ISO 27001 information security management</li>
                <li>• NIST Cybersecurity Framework alignment</li>
                <li>• OWASP security best practices</li>
                <li>• Regular penetration testing and audits</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RequirementsTab;
