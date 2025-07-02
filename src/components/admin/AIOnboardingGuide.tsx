
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Building2, 
  Users, 
  Settings, 
  Brain, 
  BarChart3,
  Wrench
} from 'lucide-react';

const AIOnboardingGuide = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const onboardingSteps = [
    {
      id: 0,
      title: 'Organization Setup',
      icon: Building2,
      phase: 'Phase 1: Foundation',
      duration: '15 minutes',
      description: 'Configure your organization and multi-tenant settings',
      tasks: [
        'Create organization profile',
        'Set subscription tier and limits',
        'Configure contact information',
        'Enable multi-tenant isolation'
      ],
      prerequisites: [],
      techDetails: 'Sets up the organizations table and basic tenant isolation'
    },
    {
      id: 1,
      title: 'User Role Management',
      icon: Users,
      phase: 'Phase 1: Foundation',
      duration: '10 minutes',
      description: 'Assign roles and permissions for AI feature access',
      tasks: [
        'Link users to organization',
        'Assign admin and power user roles',
        'Configure AI access permissions',
        'Test role-based access controls'
      ],
      prerequisites: ['Organization Setup'],
      techDetails: 'Updates user_roles table with organization_id and AI permissions'
    },
    {
      id: 2,
      title: 'AI Configuration Framework',
      icon: Settings,
      phase: 'Phase 1: Foundation',
      duration: '20 minutes',
      description: 'Set up the basic AI configuration structure',
      tasks: [
        'Create AI configuration records',
        'Set default feature flags',
        'Configure cost limits',
        'Initialize usage tracking'
      ],
      prerequisites: ['Organization Setup', 'User Role Management'],
      techDetails: 'Populates ai_configurations table with initial settings'
    },
    {
      id: 3,
      title: 'Admin Dashboard',
      icon: Settings,
      phase: 'Phase 2: Admin UI',
      duration: '30 minutes',
      description: 'Build administrative interfaces for AI management',
      tasks: [
        'Deploy AI configuration UI',
        'Set up API key management',
        'Configure feature toggles',
        'Test admin workflows'
      ],
      prerequisites: ['AI Configuration Framework'],
      techDetails: 'Implements React components for AI administration'
    },
    {
      id: 4,
      title: 'AI Processing Engine',
      icon: Brain,
      phase: 'Phase 3: AI Processing',
      duration: '45 minutes',
      description: 'Enable AI-enhanced alert processing capabilities',
      tasks: [
        'Deploy ai-alert-enhancer edge function',
        'Configure AI provider connections',
        'Set up alert processing pipeline',
        'Test AI processing workflows'
      ],
      prerequisites: ['Admin Dashboard'],
      techDetails: 'Deploys Supabase Edge Function for AI processing'
    },
    {
      id: 5,
      title: 'Analytics & Reporting',
      icon: BarChart3,
      phase: 'Phase 4: Analytics',
      duration: '25 minutes',
      description: 'Add AI-powered analytics and reporting features',
      tasks: [
        'Enable trend analysis',
        'Configure predictive models',
        'Set up automated reports',
        'Test analytics workflows'
      ],
      prerequisites: ['AI Processing Engine'],
      techDetails: 'Implements AI analytics components and scheduled functions'
    },
    {
      id: 6,
      title: 'Advanced Customization',
      icon: Wrench,
      phase: 'Phase 5: Customization',
      duration: '60 minutes',
      description: 'Enable deep customization of AI workflows',
      tasks: [
        'Configure custom AI prompts',
        'Set up workflow automation',
        'Deploy industry-specific models',
        'Test advanced integrations'
      ],
      prerequisites: ['Analytics & Reporting'],
      techDetails: 'Enables advanced AI customization and workflow automation'
    }
  ];

  const toggleStepCompletion = (stepId: number) => {
    if (completedSteps.includes(stepId)) {
      setCompletedSteps(completedSteps.filter(id => id !== stepId));
    } else {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'pending';
  };

  const canStartStep = (step: any) => {
    return step.prerequisites.every(prereq => 
      completedSteps.includes(onboardingSteps.find(s => s.title === prereq)?.id || -1)
    );
  };

  const completionPercentage = Math.round((completedSteps.length / onboardingSteps.length) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">AI Integration Onboarding</h2>
        <p className="text-muted-foreground mt-2">
          Step-by-step guide to implementing AI-enhanced alert processing
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Implementation Progress
            <Badge variant="outline">{completedSteps.length}/{onboardingSteps.length} Complete</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={completionPercentage} className="mb-2" />
          <p className="text-sm text-muted-foreground">{completionPercentage}% complete</p>
        </CardContent>
      </Card>

      {/* Onboarding Steps */}
      <div className="space-y-4">
        {onboardingSteps.map((step, index) => {
          const status = getStepStatus(step.id);
          const canStart = canStartStep(step);
          const Icon = step.icon;

          return (
            <Card key={step.id} className={`transition-all ${
              status === 'current' ? 'ring-2 ring-blue-500' : 
              status === 'completed' ? 'bg-green-50 border-green-200' : 
              !canStart ? 'opacity-60' : ''
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      status === 'completed' ? 'bg-green-100' : 
                      status === 'current' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        status === 'completed' ? 'text-green-600' : 
                        status === 'current' ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{step.phase}</Badge>
                        <span className="text-xs text-muted-foreground">{step.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {status === 'completed' ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </div>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Prerequisites */}
                {step.prerequisites.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-2">Prerequisites:</h5>
                    <div className="flex flex-wrap gap-2">
                      {step.prerequisites.map((prereq, prereqIndex) => (
                        <Badge key={prereqIndex} variant="secondary" className="text-xs">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tasks */}
                <div>
                  <h5 className="font-medium text-sm mb-2">Tasks:</h5>
                  <ul className="space-y-1">
                    {step.tasks.map((task, taskIndex) => (
                      <li key={taskIndex} className="text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical Details */}
                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>Technical:</strong> {step.techDetails}
                  </AlertDescription>
                </Alert>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {status !== 'completed' && canStart && (
                    <Button 
                      size="sm" 
                      onClick={() => setCurrentStep(step.id)}
                      variant={status === 'current' ? 'default' : 'outline'}
                    >
                      {status === 'current' ? 'Continue' : 'Start'}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toggleStepCompletion(step.id)}
                  >
                    {status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Completion Message */}
      {completedSteps.length === onboardingSteps.length && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6" />
              Onboarding Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              Congratulations! Your AI integration is fully configured and ready for production use. 
              Monitor your AI usage through the admin dashboard and adjust settings as needed.
            </p>
            <Button className="mt-4" onClick={() => window.location.href = '/admin?tab=settings'}>
              Access AI Management Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIOnboardingGuide;
