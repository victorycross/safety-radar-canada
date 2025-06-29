
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EnhancedSource } from '@/components/sources/EnhancedSourceCard';

export const useSourceConfiguration = () => {
  const { toast } = useToast();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<EnhancedSource | null>(null);

  const openConfigModal = useCallback((source: EnhancedSource) => {
    setSelectedSource(source);
    setIsConfigModalOpen(true);
  }, []);

  const closeConfigModal = useCallback(() => {
    setIsConfigModalOpen(false);
    setSelectedSource(null);
  }, []);

  const openAddModal = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
  }, []);

  const saveConfiguration = useCallback((sourceId: string, config: any) => {
    // In a real implementation, this would save to Supabase
    console.log('Saving configuration for source:', sourceId, config);
    
    toast({
      title: 'Configuration Saved',
      description: 'Source configuration has been updated successfully'
    });
  }, [toast]);

  const addNewSource = useCallback((sourceData: any) => {
    // In a real implementation, this would save to Supabase
    console.log('Adding new source:', sourceData);
    
    toast({
      title: 'Source Added',
      description: `${sourceData.name} has been added to your sources`
    });
  }, [toast]);

  const testConnection = useCallback(async (source: EnhancedSource) => {
    toast({
      title: 'Testing Connection',
      description: `Starting connection test for ${source.name}...`
    });

    // Open config modal in test mode
    setSelectedSource(source);
    setIsConfigModalOpen(true);
  }, [toast]);

  return {
    isConfigModalOpen,
    isAddModalOpen,
    selectedSource,
    openConfigModal,
    closeConfigModal,
    openAddModal,
    closeAddModal,
    saveConfiguration,
    addNewSource,
    testConnection
  };
};
