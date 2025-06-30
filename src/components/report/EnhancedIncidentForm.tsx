
import React, { useState, useEffect } from 'react';
import { AlertLevel, IncidentSource, VerificationStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { useToast } from '@/hooks/use-toast';
import { Save, Send, Upload, MapPin, AlertCircle } from 'lucide-react';

interface EnhancedIncidentFormProps {
  formData: Record<string, any>;
  onFormDataChange: (data: Record<string, any>) => void;
  onSaveDraft: () => void;
  onSubmit: (data: any) => void;
}

const EnhancedIncidentForm: React.FC<EnhancedIncidentFormProps> = ({
  formData,
  onFormDataChange,
  onSaveDraft,
  onSubmit
}) => {
  const { provinces, reportIncident } = useSupabaseDataContext();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const totalSteps = 3;
  const progress = (currentStep / totalSteps) * 100;

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (Object.keys(formData).length > 0) {
        onSaveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [formData, onSaveDraft]);

  const updateField = (field: string, value: any) => {
    onFormDataChange({ [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.title?.trim()) newErrors.title = 'Title is required';
        if (!formData.description?.trim()) newErrors.description = 'Description is required';
        if (!formData.provinceId) newErrors.provinceId = 'Province is required';
        break;
      case 2:
        if (!formData.alertLevel) newErrors.alertLevel = 'Alert level is required';
        if (!formData.contactInfo?.trim()) newErrors.contactInfo = 'Contact information is required';
        break;
      case 3:
        // Final review - no additional validation needed
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      const submissionData = {
        title: formData.title,
        description: formData.description,
        provinceId: formData.provinceId,
        alertLevel: formData.alertLevel || AlertLevel.WARNING,
        source: IncidentSource.MANUAL,
        verificationStatus: VerificationStatus.UNVERIFIED,
        contactInfo: formData.contactInfo,
        anonymous: formData.anonymous || false,
        timestamp: new Date().toISOString()
      };

      await reportIncident(submissionData);
      onSubmit(submissionData);
      
      toast({
        title: "Report Submitted",
        description: "Your incident report has been submitted successfully. Reference ID: " + Date.now(),
      });

      // Reset form
      onFormDataChange({});
      setCurrentStep(1);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Incident Title *</Label>
              <Input
                id="title"
                placeholder="Brief title describing the incident"
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide a detailed description of what happened, including when, where, and any other relevant details"
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
                rows={6}
                className={errors.description ? 'border-red-500' : ''}
              />
              <p className="text-sm text-muted-foreground">
                {(formData.description || '').length}/1000 characters
              </p>
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="province">Location (Province) *</Label>
              <Select 
                value={formData.provinceId || ''} 
                onValueChange={(value) => updateField('provinceId', value)}
              >
                <SelectTrigger id="province" className={errors.provinceId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select the province where this occurred" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((province) => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.provinceId && <p className="text-sm text-red-500">{errors.provinceId}</p>}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alertLevel">Severity Level *</Label>
              <Select 
                value={formData.alertLevel || ''} 
                onValueChange={(value) => updateField('alertLevel', value)}
              >
                <SelectTrigger id="alertLevel" className={errors.alertLevel ? 'border-red-500' : ''}>
                  <SelectValue placeholder="How serious is this incident?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AlertLevel.NORMAL}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Normal - Minor incident, no immediate danger
                    </div>
                  </SelectItem>
                  <SelectItem value={AlertLevel.WARNING}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      Warning - Potential risk, requires attention
                    </div>
                  </SelectItem>
                  <SelectItem value={AlertLevel.SEVERE}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Severe - Immediate danger, urgent response needed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.alertLevel && <p className="text-sm text-red-500">{errors.alertLevel}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactInfo">Your Contact Information *</Label>
              <Input
                id="contactInfo"
                placeholder="Email or phone number for follow-up"
                value={formData.contactInfo || ''}
                onChange={(e) => updateField('contactInfo', e.target.value)}
                className={errors.contactInfo ? 'border-red-500' : ''}
              />
              {errors.contactInfo && <p className="text-sm text-red-500">{errors.contactInfo}</p>}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={formData.anonymous || false}
                onCheckedChange={(checked) => updateField('anonymous', checked)}
              />
              <Label htmlFor="anonymous" className="text-sm">
                Submit anonymously (contact info will be kept confidential)
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label>Additional Information (Optional)</Label>
              <div className="grid grid-cols-1 gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Evidence (Photos, Documents)
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Add Precise Location
                </Button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-3">Review Your Report</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Title:</span> {formData.title}
                </div>
                <div>
                  <span className="font-medium">Description:</span> {formData.description}
                </div>
                <div>
                  <span className="font-medium">Location:</span> {provinces.find(p => p.id === formData.provinceId)?.name}
                </div>
                <div>
                  <span className="font-medium">Severity:</span> 
                  <Badge variant={formData.alertLevel === 'severe' ? 'destructive' : formData.alertLevel === 'warning' ? 'secondary' : 'outline'} className="ml-2">
                    {formData.alertLevel}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Contact:</span> {formData.contactInfo}
                  {formData.anonymous && <Badge variant="outline" className="ml-2">Anonymous</Badge>}
                </div>
              </div>
            </div>
            
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Important:</p>
                  <p className="text-yellow-700">
                    Your report will be reviewed by our security team. You will receive updates on the status 
                    of your report via the contact information provided.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Report Security Incident</CardTitle>
            <CardDescription>Step {currentStep} of {totalSteps}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
        </div>
        <Progress value={progress} className="mt-4" />
      </CardHeader>
      
      <CardContent>
        {renderStep()}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        
        <div className="flex gap-2">
          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default EnhancedIncidentForm;
