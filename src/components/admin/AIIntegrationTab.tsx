
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Settings, 
  Key, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2,
  Zap,
  BarChart3,
  Shield,
  Cpu
} from 'lucide-react';

const AIIntegrationTab = () => {
  const [activePhase, setActivePhase] = useState('phase1');

  const phases = [
    {
      id: 'phase1',
      title: 'Phase 1: Foundation',
      status: 'available',
      description: 'Set up organizations, user roles, and basic AI configuration structure',
      features: ['Multi-tenant organization setup', 'User role management', 'AI configuration framework']
    },
    {
      id: 'phase2',
      title: 'Phase 2: Admin UI',
      status: 'in-development',
      description: 'Build administrative interfaces for AI configuration management',
      features: ['AI configuration dashboard', 'API key management', 'Feature toggle interface']
    },
    {
      id: 'phase3',
      title: 'Phase 3: AI Processing',
      status: 'planned',
      description: 'Implement AI-enhanced alert processing capabilities',
      features: ['Smart alert parsing', 'Automatic classification', 'Alert correlation', 'Content summarization']
    },
    {
      id: 'phase4',
      title: 'Phase 4: Analytics',
      status: 'planned',
      description: 'Add AI-powered analytics and reporting features',
      features: ['Trend analysis', 'Predictive forecasting', 'Automated reports', 'Risk assessment']
    },
    {
      id: 'phase5',
      title: 'Phase 5: Customization',
      status: 'planned',
      description: 'Enable deep customization of AI workflows and prompts',
      features: ['Custom AI prompts', 'Workflow automation', 'Industry-specific models', 'Advanced integrations']
    }
  ];

  const aiProviders = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4o', 'gpt-4o-mini'], status: 'supported' },
    { id: 'anthropic', name: 'Anthropic', models: ['claude-3-5-sonnet', 'claude-3-haiku'], status: 'supported' },
    { id: 'google', name: 'Google AI', models: ['gemini-pro', 'gemini-flash'], status: 'planned' },
    { id: 'azure', name: 'Azure OpenAI', models: ['gpt-4', 'gpt-35-turbo'], status: 'planned' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'in-development': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      case 'supported': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Brain className="h-6 w-6 text-blue-600" />
          AI Integration & Configuration
        </h2>
        <p className="text-muted-foreground mt-2">
          Comprehensive guide to implementing AI-enhanced alert processing for your organization
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="phases">Implementation</TabsTrigger>
          <TabsTrigger value="providers">AI Providers</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="costs">Cost Management</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI-Enhanced Alert Processing
              </CardTitle>
              <CardDescription>
                Transform your security alert management with intelligent automation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Key Capabilities</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Smart alert parsing and classification
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Automatic correlation and deduplication
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Intelligent content summarization
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Predictive trend analysis
                    </li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Benefits</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Reduce false positives by up to 70%</li>
                    <li>• Accelerate incident response times</li>
                    <li>• Improve threat detection accuracy</li>
                    <li>• Automate routine analysis tasks</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  AI processing requires proper API key configuration and may incur additional costs. 
                  Review the cost management section before enabling features.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <div className="grid gap-4">
            {phases.map((phase) => (
              <Card key={phase.id} className={`cursor-pointer transition-all ${activePhase === phase.id ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{phase.title}</CardTitle>
                    <Badge className={getStatusColor(phase.status)}>
                      {phase.status.replace('-', ' ')}
                    </Badge>
                  </div>
                  <CardDescription>{phase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Features:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {phase.features.map((feature, index) => (
                        <div key={index} className="text-sm bg-gray-50 px-2 py-1 rounded">
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid gap-4">
            {aiProviders.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      {provider.name}
                    </CardTitle>
                    <Badge className={getStatusColor(provider.status)}>
                      {provider.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Available Models:</h5>
                    <div className="flex flex-wrap gap-2">
                      {provider.models.map((model) => (
                        <span key={model} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {model}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Considerations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold">API Key Security</h4>
                <ul className="space-y-2 text-sm ml-4">
                  <li>• All API keys are encrypted at rest using AES-256</li>
                  <li>• Keys are never logged or exposed in error messages</li>
                  <li>• Automatic key rotation is supported for enhanced security</li>
                  <li>• Organization-level isolation prevents cross-tenant access</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Data Privacy</h4>
                <ul className="space-y-2 text-sm ml-4">
                  <li>• Alert data is processed with privacy-preserving techniques</li>
                  <li>• PII detection and masking before AI processing</li>
                  <li>• Configurable data retention policies</li>
                  <li>• Compliance with GDPR, CCPA, and other regulations</li>
                </ul>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Review your organization's data governance policies before enabling AI processing. 
                  Some features may require additional compliance approvals.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Cost Controls</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Daily and monthly spending limits</li>
                    <li>• Per-feature usage quotas</li>
                    <li>• Real-time cost monitoring</li>
                    <li>• Automatic alerts at 80% of limits</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Usage Optimization</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Intelligent caching to reduce API calls</li>
                    <li>• Batch processing for efficiency</li>
                    <li>• Model selection based on complexity</li>
                    <li>• Configurable processing priorities</li>
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-900 mb-2">Estimated Costs</h5>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Basic processing: $0.01-0.05 per alert</p>
                  <p>• Advanced analysis: $0.05-0.15 per alert</p>
                  <p>• Typical organization (1000 alerts/month): $50-150/month</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Troubleshooting Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-red-600">API Key Issues</h4>
                  <ul className="space-y-1 text-sm ml-4 mt-2">
                    <li>• Verify API key is valid and has sufficient credits</li>
                    <li>• Check API key permissions and rate limits</li>
                    <li>• Ensure key is properly encrypted and stored</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-yellow-600">Processing Failures</h4>
                  <ul className="space-y-1 text-sm ml-4 mt-2">
                    <li>• Review edge function logs for error details</li>
                    <li>• Check if cost limits have been exceeded</li>
                    <li>• Verify organization configuration is active</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-blue-600">Performance Issues</h4>
                  <ul className="space-y-1 text-sm ml-4 mt-2">
                    <li>• Monitor API response times and adjust timeouts</li>
                    <li>• Consider upgrading to faster AI models</li>
                    <li>• Enable caching for repeated queries</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  For complex issues, check the Edge Function logs in the Supabase dashboard 
                  and review the AI processing metrics in the admin panel.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIIntegrationTab;
