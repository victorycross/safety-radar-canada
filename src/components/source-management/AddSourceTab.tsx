
import React, { useState } from 'react';
import { useSourceManagement } from '@/hooks/useSourceManagement';
import ProgressIndicator from './ProgressIndicator';
import SourceTemplateSelector from './SourceTemplateSelector';
import SourceConfigurationForm from './SourceConfigurationForm';
import { SourceTemplate } from './sourceTemplates';

const AddSourceTab = () => {
  const { addSource, loading } = useSourceManagement();
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<SourceTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    api_endpoint: '',
    source_type: '',
    polling_interval: 300,
    is_active: true,
    configuration: {}
  });

  const handleTemplateSelect = (template: SourceTemplate) => {
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

  const handleBack = () => {
    setStep(1);
  };

  return (
    <div className="space-y-6">
      <ProgressIndicator currentStep={step} />

      {step === 1 && (
        <SourceTemplateSelector onTemplateSelect={handleTemplateSelect} />
      )}

      {step === 2 && selectedTemplate && (
        <SourceConfigurationForm
          selectedTemplate={selectedTemplate}
          formData={formData}
          onFormDataChange={setFormData}
          onBack={handleBack}
          onSubmit={handleSubmit}
          loading={loading}
        />
      )}
    </div>
  );
};

export default AddSourceTab;
