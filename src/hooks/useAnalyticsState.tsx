
import { useState, useEffect } from 'react';
import { AlertLevel, IncidentSource } from '@/types';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface AnalyticsFilters {
  dateRange: DateRange;
  alertLevels: AlertLevel[];
  sources: IncidentSource[];
  provinces: string[];
  refreshInterval: number;
}

export interface AnalyticsState {
  filters: AnalyticsFilters;
  autoRefresh: boolean;
  exportFormat: 'pdf' | 'csv' | 'json';
  viewMode: 'dashboard' | 'detailed';
}

const DEFAULT_FILTERS: AnalyticsFilters = {
  dateRange: {
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  },
  alertLevels: [AlertLevel.SEVERE, AlertLevel.WARNING, AlertLevel.NORMAL],
  sources: Object.values(IncidentSource),
  provinces: [],
  refreshInterval: 30000 // 30 seconds
};

const DEFAULT_STATE: AnalyticsState = {
  filters: DEFAULT_FILTERS,
  autoRefresh: true,
  exportFormat: 'pdf',
  viewMode: 'dashboard'
};

export const useAnalyticsState = () => {
  const [state, setState] = useState<AnalyticsState>(() => {
    const saved = localStorage.getItem('analyticsState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_STATE,
          ...parsed,
          filters: {
            ...DEFAULT_FILTERS,
            ...parsed.filters,
            dateRange: {
              from: new Date(parsed.filters?.dateRange?.from || DEFAULT_FILTERS.dateRange.from),
              to: new Date(parsed.filters?.dateRange?.to || DEFAULT_FILTERS.dateRange.to)
            }
          }
        };
      } catch (error) {
        console.error('Failed to parse saved analytics state:', error);
        return DEFAULT_STATE;
      }
    }
    return DEFAULT_STATE;
  });

  const [accordionState, setAccordionState] = useState<Record<string, boolean>>({
    'executive-summary': true,
    'incident-analytics': true,
    'geographic-intelligence': false,
    'source-performance': false,
    'trend-analysis': false,
    'data-quality': false
  });

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('analyticsState', JSON.stringify(state));
  }, [state]);

  // Save accordion state
  useEffect(() => {
    localStorage.setItem('analyticsAccordionState', JSON.stringify(accordionState));
  }, [accordionState]);

  const updateFilters = (filters: Partial<AnalyticsFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters }
    }));
  };

  const updateState = (updates: Partial<AnalyticsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const toggleAccordionSection = (sectionId: string) => {
    setAccordionState(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getOpenSections = () => {
    return Object.keys(accordionState).filter(key => accordionState[key]);
  };

  const handleAccordionChange = (value: string[]) => {
    const newState = { ...accordionState };
    
    Object.keys(newState).forEach(key => {
      newState[key] = false;
    });
    
    value.forEach(sectionId => {
      newState[sectionId] = true;
    });
    
    setAccordionState(newState);
  };

  const resetFilters = () => {
    setState(prev => ({
      ...prev,
      filters: DEFAULT_FILTERS
    }));
  };

  const exportData = async (format: 'pdf' | 'csv' | 'json') => {
    console.log(`Exporting analytics data as ${format}`);
    // Implementation would depend on chosen export library
  };

  return {
    state,
    accordionState,
    updateFilters,
    updateState,
    toggleAccordionSection,
    getOpenSections,
    handleAccordionChange,
    resetFilters,
    exportData
  };
};
