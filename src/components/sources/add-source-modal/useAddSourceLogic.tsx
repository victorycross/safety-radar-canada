
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { SOURCE_TYPES } from './sourceTypes';

interface FormData {
  name: string;
  description: string;
  endpoint: string;
  type: string;
}

export const useAddSourceLogic = (onAdd: (sourceData: any) => void, onClose: () => void) => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    endpoint: '',
    type: ''
  });

  const handleTypeSelect = (typeId: string) => {
    const sourceType = SOURCE_TYPES.find(t => t.id === typeId);
    if (sourceType) {
      setSelectedType(typeId);
      setFormData(prev => ({
        ...prev,
        type: sourceType.name
      }));
    }
  };

  const handleAdd = () => {
    if (!formData.name || !formData.endpoint || !selectedType) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const sourceType = SOURCE_TYPES.find(t => t.id === selectedType);
    const newSource = {
      ...formData,
      id: `src_${Date.now()}`,
      type: sourceType?.name || 'Unknown',
      verificationStatus: 'unverified',
      healthStatus: 'unknown',
      uptime: 0,
      reliabilityScore: 0,
      responseTime: 0,
      errorRate: 0,
      dataVolume: 0,
      lastUpdate: 'Never',
      route: formData.endpoint,
      config: sourceType?.defaultConfig || {}
    };

    onAdd(newSource);
    
    toast({
      title: 'Source Added',
      description: `${formData.name} has been added successfully`
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      endpoint: '',
      type: ''
    });
    setSelectedType('');
    onClose();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      endpoint: '',
      type: ''
    });
    setSelectedType('');
  };

  return {
    selectedType,
    formData,
    handleTypeSelect,
    setFormData,
    handleAdd,
    resetForm
  };
};
