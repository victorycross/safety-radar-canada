
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { SourceTemplate } from './sourceTemplates';

interface SourceConfigurationFormProps {
  selectedTemplate: SourceTemplate;
  formData: {
    name: string;
    description: string;
    api_endpoint: string;
    source_type: string;
    polling_interval: number;
    is_active: boolean;
    configuration: any;
  };
  onFormDataChange: (data: any) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

const SourceConfigurationForm: React.FC<SourceConfigurationFormProps> = ({
  selectedTemplate,
  formData,
  onFormDataChange,
  onBack,
  onSubmit,
  loading
}) => {
  const isFormValid = formData.name && formData.api_endpoint && formData.source_type;

  return (
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
                onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="endpoint">API Endpoint *</Label>
              <Input
                id="endpoint"
                placeholder="https://api.example.com/feed"
                value={formData.api_endpoint}
                onChange={(e) => onFormDataChange({ ...formData, api_endpoint: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this source..."
              value={formData.description}
              onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="interval">Polling Interval (seconds)</Label>
              <Select 
                value={formData.polling_interval.toString()} 
                onValueChange={(value) => onFormDataChange({ ...formData, polling_interval: parseInt(value) })}
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
                onCheckedChange={(checked) => onFormDataChange({ ...formData, is_active: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <Button 
          onClick={onSubmit}
          disabled={!isFormValid || loading}
        >
          Add Source
          <CheckCircle className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default SourceConfigurationForm;
