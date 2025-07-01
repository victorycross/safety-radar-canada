
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Globe, 
  Rss, 
  Shield, 
  Cloud, 
  Zap,
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useSourceManagement } from '@/hooks/useSourceManagement';

const SOURCE_TEMPLATES = [
  {
    id: 'rss',
    name: 'RSS Feed',
    description: 'RSS or Atom feed source',
    icon: Rss,
    defaultConfig: {
      source_type: 'rss',
      polling_interval: 1800,
      configuration: { format: 'rss', parser: 'xml' }
    }
  },
  {
    id: 'security-rss',
    name: 'Security RSS Feed',
    description: 'Security alerts via RSS',
    icon: Shield,
    defaultConfig: {
      source_type: 'security-rss',
      polling_interval: 300,
      configuration: { format: 'rss', parser: 'xml', category: 'security' }
    }
  },
  {
    id: 'weather',
    name: 'Weather API',
    description: 'Weather alerts and data',
    icon: Cloud,
    defaultConfig: {
      source_type: 'weather',
      polling_interval: 600,
      configuration: { format: 'json', parser: 'weather' }
    }
  },
  {
    id: 'immigration-travel-atom',
    name: 'Immigration & Travel',
    description: 'Government announcements',
    icon: Globe,
    defaultConfig: {
      source_type: 'immigration-travel-atom',
      polling_interval: 3600,
      configuration: { format: 'atom', parser: 'government' }
    }
  },
  {
    id: 'api',
    name: 'REST API',
    description: 'Generic REST API endpoint',
    icon: Globe,
    defaultConfig: {
      source_type: 'api',
      polling_interval: 300,
      configuration: { format: 'json', method: 'GET' }
    }
  },
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Incoming webhook receiver',
    icon: Zap,
    defaultConfig: {
      source_type: 'webhook',
      polling_interval: 0,
      configuration: { format: 'json', method: 'POST' }
    }
  }
];

const AddSourceTab = () => {
  const { addSource, loading } = useSourceManagement();
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    api_endpoint: '',
    source_type: '',
    polling_interval: 300,
    is_active: true,
    configuration: {}
  });

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setFormData({
      ...formData,
      ...template.defaultConfig
    });
    setStep(2);
  };

  const handleSubmit = async () => {
    try {
      await addSource(formData);
      
      // Reset form
      setStep(1);
      setSelectedTemplate(null);
      setFormData({
        name: '',
        description: '',
        api_endpoint: '',
        source_type: '',
        polling_interval: 300,
        is_active: true,
        configuration: {}
      });
    } catch (error) {
      console.error('Failed to add source:', error);
    }
  };

  const isFormValid = formData.name && formData.api_endpoint && formData.source_type;

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-2">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}>
          {step > 1 ? <CheckCircle className="h-4 w-4" /> : '1'}
        </div>
        <div className={`h-0.5 w-16 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}>
          {step > 2 ? <CheckCircle className="h-4 w-4" /> : '2'}
        </div>
        <div className={`h-0.5 w-16 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}>
          3
        </div>
      </div>

      {/* Step 1: Choose Template */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Choose Source Type</h3>
            <p className="text-muted-foreground">Select a template to get started quickly</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOURCE_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <Card
                  key={template.id}
                  className="cursor-pointer hover:shadow-md transition-all hover:border-primary"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardHeader className="text-center">
                    <Icon className="h-8 w-8 mx-auto mb-2" />
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Badge variant="outline" className="w-full justify-center">
                      {template.defaultConfig.source_type}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: Configure Source */}
      {step === 2 && selectedTemplate && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Configure {selectedTemplate.name}</h3>
            <p className="text-muted-foreground">Fill in the details for your new source</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <selectedTemplate.icon className="h-5 w-5" />
                Source Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Source Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., CISA Security Alerts"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endpoint">API Endpoint *</Label>
                  <Input
                    id="endpoint"
                    placeholder="https://api.example.com/feed"
                    value={formData.api_endpoint}
                    onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this source..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interval">Polling Interval (seconds)</Label>
                  <Select 
                    value={formData.polling_interval.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, polling_interval: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                      <SelectItem value="600">10 minutes</SelectItem>
                      <SelectItem value="1800">30 minutes</SelectItem>
                      <SelectItem value="3600">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <Button 
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
            >
              Add Source
              <CheckCircle className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSourceTab;
