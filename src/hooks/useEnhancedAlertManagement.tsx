import { useState, useEffect, useMemo } from 'react';
import { UniversalAlert } from '@/types/alerts';
import { 
  confidenceFilteringService, 
  AlertWithConfidence,
  ConfidenceConfig,
  DEFAULT_CONFIDENCE_CONFIG 
} from '@/services/confidenceFilteringService';
import { automatedArchivingService } from '@/services/automatedArchivingService';
import { useToast } from '@/hooks/use-toast';

interface UseEnhancedAlertManagementProps {
  alerts: UniversalAlert[];
  confidenceConfig?: Partial<ConfidenceConfig>;
  enableAutomatedArchiving?: boolean;
}

interface AlertFilters {
  severity?: string;
  source?: string;
  area?: string;
  confidenceLevel?: 'high' | 'medium' | 'low' | 'very-low';
  showOnlyAuthoritative?: boolean;
  includeVeryLowConfidence?: boolean;
}

export const useEnhancedAlertManagement = ({
  alerts,
  confidenceConfig = {},
  enableAutomatedArchiving = false
}: UseEnhancedAlertManagementProps) => {
  const [filters, setFilters] = useState<AlertFilters>({
    includeVeryLowConfidence: false
  });
  const [isArchiving, setIsArchiving] = useState(false);
  const { toast } = useToast();

  // Initialize confidence service with custom config
  const confidenceService = useMemo(() => {
    const config = { ...DEFAULT_CONFIDENCE_CONFIG, ...confidenceConfig };
    return new (confidenceFilteringService.constructor as any)(config);
  }, [confidenceConfig]);

  // Enhanced alerts with confidence metadata
  const enhancedAlerts = useMemo(() => {
    return confidenceService.enhanceAlertsWithConfidence(alerts);
  }, [alerts, confidenceService]);

  // Filtered alerts based on confidence and other criteria
  const filteredAlerts = useMemo(() => {
    let filtered = confidenceService.filterByConfidence(
      enhancedAlerts, 
      filters.includeVeryLowConfidence
    );

    // Apply additional filters
    if (filters.severity) {
      filtered = filtered.filter(alert => alert.severity === filters.severity);
    }

    if (filters.source) {
      filtered = filtered.filter(alert => alert.source === filters.source);
    }

    if (filters.area) {
      filtered = filtered.filter(alert => 
        alert.area?.toLowerCase().includes(filters.area!.toLowerCase())
      );
    }

    if (filters.confidenceLevel) {
      filtered = filtered.filter(alert => alert.confidenceLevel === filters.confidenceLevel);
    }

    if (filters.showOnlyAuthoritative) {
      filtered = filtered.filter(alert => alert.isFromAuthoritativeSource);
    }

    // Sort by visual priority and recency
    filtered.sort((a, b) => {
      const aPriority = confidenceService.getDisplayConfig(a).visualPriority;
      const bPriority = confidenceService.getDisplayConfig(b).visualPriority;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // Then by recency
      return new Date(b.published).getTime() - new Date(a.published).getTime();
    });

    return filtered;
  }, [enhancedAlerts, filters, confidenceService]);

  // Statistics for dashboard
  const alertStats = useMemo(() => {
    const total = enhancedAlerts.length;
    const highConfidence = enhancedAlerts.filter(a => a.confidenceLevel === 'high').length;
    const authoritative = enhancedAlerts.filter(a => a.isFromAuthoritativeSource).length;
    const lowConfidence = enhancedAlerts.filter(a => a.confidenceLevel === 'low' || a.confidenceLevel === 'very-low').length;
    const requiresVerification = enhancedAlerts.filter(a => 
      confidenceService.getDisplayConfig(a).requiresVerification
    ).length;

    return {
      total,
      highConfidence,
      authoritative,
      lowConfidence,
      requiresVerification,
      displayed: filteredAlerts.length,
      filtered: total - filteredAlerts.length
    };
  }, [enhancedAlerts, filteredAlerts, confidenceService]);

  // Execute automated archiving
  const executeAutomatedArchiving = async () => {
    if (!enableAutomatedArchiving) {
      toast({
        title: 'Automated Archiving Disabled',
        description: 'This feature is not enabled for this view.',
        variant: 'destructive'
      });
      return;
    }

    setIsArchiving(true);
    try {
      const results = await automatedArchivingService.executeArchivingRules();
      const totalArchived = results.reduce((sum, result) => sum + result.archivedCount, 0);
      
      if (totalArchived > 0) {
        toast({
          title: 'Automated Archiving Complete',
          description: `Successfully archived ${totalArchived} items across ${results.length} categories.`
        });
      } else {
        toast({
          title: 'No Items to Archive',
          description: 'All items are already up to date.'
        });
      }
    } catch (error) {
      console.error('Automated archiving error:', error);
      toast({
        title: 'Archiving Error',
        description: 'Failed to execute automated archiving. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsArchiving(false);
    }
  };

  // Get archiving candidates count
  const getArchivingCandidates = async () => {
    try {
      return await automatedArchivingService.getArchivingCandidates();
    } catch (error) {
      console.error('Error getting archiving candidates:', error);
      return {};
    }
  };

  // Update filters
  const updateFilters = (newFilters: Partial<AlertFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ includeVeryLowConfidence: false });
  };

  // Get display config for an alert
  const getAlertDisplayConfig = (alert: AlertWithConfidence) => {
    return confidenceService.getDisplayConfig(alert);
  };

  return {
    // Alert data
    enhancedAlerts,
    filteredAlerts,
    alertStats,
    
    // Filtering
    filters,
    updateFilters,
    clearFilters,
    
    // Archiving
    executeAutomatedArchiving,
    getArchivingCandidates,
    isArchiving,
    
    // Utilities
    getAlertDisplayConfig,
    confidenceService
  };
};

export type { AlertWithConfidence, AlertFilters };