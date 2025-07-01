
import { UniversalAlert } from '@/types/alerts';

export const useAlertFiltering = () => {
  const filterAlerts = (alerts: UniversalAlert[], activeView: string, sourceFilter?: string) => {
    let filtered = alerts;
    
    // Filter by source if specified
    if (sourceFilter && sourceFilter !== 'all') {
      filtered = filtered.filter(alert => 
        alert.source.toLowerCase().includes(sourceFilter.toLowerCase())
      );
    }
    
    // Filter by severity/urgency
    if (activeView === 'severe') {
      filtered = filtered.filter(alert => 
        alert.severity === 'Extreme' || alert.severity === 'Severe'
      );
    } else if (activeView === 'immediate') {
      filtered = filtered.filter(alert => alert.urgency === 'Immediate');
    }
    
    return filtered;
  };

  const validateAndSortAlerts = (alerts: UniversalAlert[]): UniversalAlert[] => {
    // Enhanced filtering for better data quality
    const validAlerts = alerts.filter(alert => {
      // More comprehensive filtering
      const hasValidTitle = alert.title && 
                           alert.title !== 'Untitled Alert' && 
                           alert.title.trim().length > 0 &&
                           !alert.title.toLowerCase().includes('test') &&
                           !alert.title.toLowerCase().includes('dummy');
      
      const hasValidDescription = alert.description && 
                                 alert.description !== 'No description available' &&
                                 alert.description.trim().length > 0;
      
      const isNotTestData = !alert.title.toLowerCase().includes('test') &&
                           !alert.description.toLowerCase().includes('test');
      
      return hasValidTitle && hasValidDescription && isNotTestData;
    });
    
    // Sort by published date (most recent first)
    validAlerts.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
    
    return validAlerts;
  };

  return {
    filterAlerts,
    validateAndSortAlerts
  };
};
