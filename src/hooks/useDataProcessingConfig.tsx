import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProcessingRule {
  id: string;
  category: string;
  name: string;
  description?: string;
  is_active: boolean;
  priority: number;
  config_data: any;
  created_at: string;
  updated_at: string;
}

export interface NormalizationRule {
  id: string;
  source_type: string;
  field_mappings: any;
  transformation_rules?: any;
  severity_mapping?: any;
  category_mapping?: any;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface ClassificationRule {
  id: string;
  rule_type: string;
  condition_pattern: string;
  classification_value: string;
  confidence_score: number;
  is_active: boolean;
  priority: number;
  source_types?: string[];
  created_at: string;
  updated_at: string;
}

export const useDataProcessingConfig = () => {
  const [processingRules, setProcessingRules] = useState<ProcessingRule[]>([]);
  const [normalizationRules, setNormalizationRules] = useState<NormalizationRule[]>([]);
  const [classificationRules, setClassificationRules] = useState<ClassificationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchProcessingRules = async () => {
    try {
      const { data, error } = await supabase
        .from('data_processing_config')
        .select('*')
        .order('priority', { ascending: false });
      
      if (error) throw error;
      setProcessingRules(data || []);
    } catch (err) {
      console.error('Error fetching processing rules:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch processing rules');
    }
  };

  const fetchNormalizationRules = async () => {
    try {
      const { data, error } = await supabase
        .from('normalization_rules')
        .select('*')
        .order('priority', { ascending: false });
      
      if (error) throw error;
      setNormalizationRules(data || []);
    } catch (err) {
      console.error('Error fetching normalization rules:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch normalization rules');
    }
  };

  const fetchClassificationRules = async () => {
    try {
      const { data, error } = await supabase
        .from('classification_rules')
        .select('*')
        .order('priority', { ascending: false });
      
      if (error) throw error;
      setClassificationRules(data || []);
    } catch (err) {
      console.error('Error fetching classification rules:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch classification rules');
    }
  };

  const fetchAllRules = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchProcessingRules(),
        fetchNormalizationRules(),
        fetchClassificationRules()
      ]);
    } catch (err) {
      console.error('Error fetching rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateRuleStatus = async (ruleType: 'processing' | 'normalization' | 'classification', ruleId: string, isActive: boolean) => {
    try {
      const tableName = ruleType === 'processing' ? 'data_processing_config' : 
                       ruleType === 'normalization' ? 'normalization_rules' : 'classification_rules';
      
      const { error } = await supabase
        .from(tableName)
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('id', ruleId);
      
      if (error) throw error;
      
      toast({
        title: 'Rule Updated',
        description: `Rule has been ${isActive ? 'activated' : 'deactivated'}`
      });
      
      // Refresh the specific rule set
      if (ruleType === 'processing') await fetchProcessingRules();
      else if (ruleType === 'normalization') await fetchNormalizationRules();
      else await fetchClassificationRules();
      
    } catch (err) {
      console.error('Error updating rule status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update rule status',
        variant: 'destructive'
      });
    }
  };

  const createProcessingRule = async (rule: Omit<ProcessingRule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('data_processing_config')
        .insert([rule])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Rule Created',
        description: `Processing rule "${rule.name}" has been created`
      });
      
      await fetchProcessingRules();
      return data;
    } catch (err) {
      console.error('Error creating processing rule:', err);
      toast({
        title: 'Error',
        description: 'Failed to create processing rule',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const createNormalizationRule = async (rule: Omit<NormalizationRule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('normalization_rules')
        .insert([rule])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Rule Created',
        description: `Normalization rule for "${rule.source_type}" has been created`
      });
      
      await fetchNormalizationRules();
      return data;
    } catch (err) {
      console.error('Error creating normalization rule:', err);
      toast({
        title: 'Error',
        description: 'Failed to create normalization rule',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const createClassificationRule = async (rule: Omit<ClassificationRule, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('classification_rules')
        .insert([rule])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Rule Created',
        description: `Classification rule has been created`
      });
      
      await fetchClassificationRules();
      return data;
    } catch (err) {
      console.error('Error creating classification rule:', err);
      toast({
        title: 'Error',
        description: 'Failed to create classification rule',
        variant: 'destructive'
      });
      throw err;
    }
  };

  const getActiveRulesByCategory = (category: string) => {
    return processingRules.filter(rule => rule.category === category && rule.is_active);
  };

  const getActiveNormalizationRulesBySource = (sourceType: string) => {
    return normalizationRules.filter(rule => rule.source_type === sourceType && rule.is_active);
  };

  const getActiveClassificationRulesByType = (ruleType: string) => {
    return classificationRules.filter(rule => rule.rule_type === ruleType && rule.is_active);
  };

  useEffect(() => {
    fetchAllRules();
  }, []);

  return {
    processingRules,
    normalizationRules,
    classificationRules,
    loading,
    error,
    fetchAllRules,
    updateRuleStatus,
    createProcessingRule,
    createNormalizationRule,
    createClassificationRule,
    getActiveRulesByCategory,
    getActiveNormalizationRulesBySource,
    getActiveClassificationRulesByType
  };
};