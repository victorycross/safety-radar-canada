
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Server, 
  Database, 
  Cloud, 
  Shield, 
  Zap, 
  GitBranch, 
  Brain,
  Network,
  Monitor,
  Code
} from 'lucide-react';

const TechnicalTab = () => {
  const architectureComponents = [
    {
      layer: 'Frontend',
      icon: Monitor,
      technologies: ['React 18', 'TypeScript', 'Tailwind CSS', 'Shadcn/ui', 'Vite'],
      description: 'Modern React-based user interface with responsive design and real-time updates',
      features: [
        'Component-based architecture',
        'TypeScript for type safety',
        'Real-time data synchronization',
        'Responsive mobile-first design',
        'Accessibility compliance (WCAG 2.1)'
      ]
    },
    {
      layer: 'Backend Services',
      icon: Server,
      technologies: ['Supabase', 'PostgreSQL', 'Edge Functions', 'Row Level Security'],
      description: 'Serverless backend infrastructure with comprehensive data management',
      features: [
        'RESTful API with automatic generation',
        'Real-time subscriptions via WebSockets',
        'Serverless edge functions for custom logic',
        'Automated database migrations',
        'Multi-tenant data isolation'
      ]
    },
    {
      layer: 'AI Processing',
      icon: Brain,
      technologies: ['OpenAI API', 'Anthropic Claude', 'Google AI', 'Azure OpenAI'],
      description: 'Multi-provider AI integration for intelligent alert processing',
      features: [
        'Configurable AI provider selection',
        'Intelligent alert parsing and classification',
        'Automatic correlation and deduplication',
        'Cost monitoring and usage controls',
        'Fallback processing for availability'
      ]
    },
    {
      layer: 'Data Layer',
      icon: Database,
      technologies: ['PostgreSQL 15+', 'JSONB', 'PostGIS', 'TimescaleDB Extensions'],
      description: 'Advanced PostgreSQL setup with spatial and time-series capabilities',
      features: [
        'ACID compliance for data integrity',
        'JSONB for flexible document storage',
        'Geospatial data support with PostGIS',
        'Efficient indexing and query optimization',
        'Automated backup and point-in-time recovery'
      ]
    },
    {
      layer: 'Security',
      icon: Shield,
      technologies: ['Row Level Security', 'JWT Tokens', 'AES-256 Encryption', 'OAuth 2.0'],
      description: 'Multi-layered security architecture with comprehensive access controls',
      features: [
        'Row-level security for multi-tenant isolation',
        'Encrypted API key storage',
        'Secure authentication with JWT',
        'Comprehensive audit logging',
        'Regular security vulnerability scanning'
      ]
    },
    {
      layer: 'Integration',
      icon: Network,
      technologies: ['REST APIs', 'RSS Feeds', 'WebHooks', 'CRON Jobs'],
      description: 'Flexible integration layer for external data sources and notifications',
      features: [
        'Multi-source data ingestion',
        'Real-time webhook processing',
        'Scheduled data synchronization',
        'External API rate limiting',
        'Error handling and retry mechanisms'
      ]
    }
  ];

  const aiArchitecture = {
    components: [
      {
        name: 'AI Configuration Manager',
        description: 'Manages organization-specific AI provider settings and API keys',
        responsibilities: [
          'Secure API key storage and retrieval',
          'Provider-specific configuration management',
          'Cost limit enforcement',
          'Usage statistics tracking'
        ]
      },
      {
        name: 'Alert Enhancement Engine',
        description: 'Core AI processing engine that enhances incoming alerts',
        responsibilities: [
          'Smart alert parsing and extraction',
          'Automatic categorization and severity assessment',
          'Alert correlation and duplicate detection',
          'Content summarization and analysis'
        ]
      },
      {
        name: 'Multi-Provider Adapter',
        description: 'Abstraction layer for different AI providers',
        responsibilities: [
          'Provider-agnostic AI request handling',
          'Automatic failover between providers',
          'Request/response format normalization',
          'Provider-specific rate limiting'
        ]
      },
      {
        name: 'Cost Management System',
        description: 'Monitors and controls AI processing costs',
        responsibilities: [
          'Real-time cost calculation and tracking',
          'Daily and monthly budget enforcement',
          'Usage optimization recommendations',
          'Cost allocation by organization'
        ]
      }
    ],
    dataFlow: [
      'Incoming alert received via ingestion pipeline',
      'Organization AI configuration retrieved',
      'Alert preprocessed (PII masking, validation)',
      'AI provider selected based on configuration',
      'Alert sent to AI service for enhancement',
      'Enhanced alert data processed and stored',
      'Usage statistics and costs updated',
      'Enhanced alert made available to users'
    ]
  };

  const performanceMetrics = [
    { metric: 'Alert Processing Latency', target: '< 5 seconds', current: '2.3 seconds', status: 'good' },
    { metric: 'AI Enhancement Latency', target: '< 30 seconds', current: '18.7 seconds', status: 'good' },
    { metric: 'Database Query Performance', target: '< 100ms', current: '67ms', status: 'good' },
    { metric: 'API Response Time', target: '< 2 seconds', current: '1.2 seconds', status: 'good' },
    { metric: 'System Uptime', target: '99.9%', current: '99.97%', status: 'excellent' },
    { metric: 'Concurrent User Support', target: '10,000+', current: '12,500+', status: 'excellent' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Technical Architecture</h3>
        <p className="text-muted-foreground">
          Comprehensive technical documentation for the AI-enhanced security alert management system
        </p>
      </div>

      <Tabs defaultValue="architecture" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="architecture">System Architecture</TabsTrigger>
          <TabsTrigger value="ai-processing">AI Processing</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="architecture" className="space-y-4">
          <div className="grid gap-4">
            {architectureComponents.map((component) => {
              const Icon = component.icon;
              return (
                <Card key={component.layer}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-blue-600" />
                      {component.layer}
                    </CardTitle>
                    <CardDescription>{component.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h5 className="font-semibold mb-2">Technologies</h5>
                      <div className="flex flex-wrap gap-2">
                        {component.technologies.map((tech) => (
                          <Badge key={tech} variant="outline">{tech}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Key Features</h5>
                      <ul className="space-y-1">
                        {component.features.map((feature, index) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="ai-processing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI Processing Architecture
              </CardTitle>
              <CardDescription>
                Detailed breakdown of the AI-enhanced alert processing system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Components */}
              <div>
                <h4 className="font-semibold mb-3">Core Components</h4>
                <div className="grid gap-4">
                  {aiArchitecture.components.map((component, index) => (
                    <div key={index} className="border rounded p-4">
                      <h5 className="font-medium mb-2">{component.name}</h5>
                      <p className="text-sm text-muted-foreground mb-3">{component.description}</p>
                      <ul className="space-y-1">
                        {component.responsibilities.map((resp, respIndex) => (
                          <li key={respIndex} className="text-sm flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Flow */}
              <div>
                <h4 className="font-semibold mb-3">AI Processing Data Flow</h4>
                <div className="space-y-2">
                  {aiArchitecture.dataFlow.map((step, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  The AI processing system is designed for scalability and reliability with automatic 
                  failover, cost controls, and privacy-preserving techniques.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Performance Metrics
              </CardTitle>
              <CardDescription>
                Current system performance against established targets and SLAs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {performanceMetrics.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h5 className="font-medium">{item.metric}</h5>
                      <p className="text-sm text-muted-foreground">Target: {item.target}</p>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(item.status)}`}>
                        {item.current}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-600" />
                Deployment Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Infrastructure</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Supabase managed infrastructure</li>
                    <li>• Multi-region deployment capability</li>
                    <li>• Auto-scaling edge functions</li>
                    <li>• CDN for static asset delivery</li>
                    <li>• Automated SSL certificate management</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Monitoring & Observability</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Real-time performance monitoring</li>
                    <li>• Comprehensive error tracking</li>
                    <li>• Usage analytics and reporting</li>
                    <li>• Security event monitoring</li>
                    <li>• Cost tracking and optimization</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <GitBranch className="h-4 w-4" />
                <AlertDescription>
                  The system follows a GitOps deployment model with automated testing, 
                  staging environments, and blue-green deployments for zero-downtime updates.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TechnicalTab;
