
import { useState, useEffect } from 'react';
import { SourceFilter } from '@/components/sources/SourceFilters';

export interface SourcesState {
  filters: SourceFilter;
  sortBy: 'name' | 'lastUpdate' | 'reliability' | 'type';
  sortOrder: 'asc' | 'desc';
  autoRefresh: boolean;
  refreshInterval: number;
  accordionState: Record<string, boolean>;
}

const DEFAULT_SOURCES_STATE: SourcesState = {
  filters: {
    search: '',
    verificationStatus: [],
    sourceTypes: [],
    healthStatus: [],
    lastUpdated: 'all'
  },
  sortBy: 'name',
  sortOrder: 'asc',
  autoRefresh: false,
  refreshInterval: 30000,
  accordionState: {
    'feed-testing': true,
    'overview': true,
    'active-sources': true,
    'configuration': false,
    'analytics': false,
    'diagnostics': false
  }
};

export const useSourcesState = () => {
  const [state, setState] = useState<SourcesState>(DEFAULT_SOURCES_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sourcesPageState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState({ ...DEFAULT_SOURCES_STATE, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved sources state:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('sourcesPageState', JSON.stringify(state));
  }, [state]);

  const updateFilters = (filters: SourceFilter) => {
    setState(prev => ({
      ...prev,
      filters
    }));
  };

  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      filters: {
        search: '',
        verificationStatus: [],
        sourceTypes: [],
        healthStatus: [],
        lastUpdated: 'all'
      }
    }));
  };

  const updateSorting = (sortBy: SourcesState['sortBy'], sortOrder: SourcesState['sortOrder']) => {
    setState(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const toggleAutoRefresh = () => {
    setState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }));
  };

  const setRefreshInterval = (interval: number) => {
    setState(prev => ({ ...prev, refreshInterval: interval }));
  };

  const getOpenSections = () => {
    return Object.keys(state.accordionState).filter(key => state.accordionState[key]);
  };

  const handleAccordionChange = (value: string[]) => {
    const newAccordionState = { ...state.accordionState };
    
    Object.keys(newAccordionState).forEach(key => {
      newAccordionState[key] = false;
    });
    
    value.forEach(sectionId => {
      newAccordionState[sectionId] = true;
    });
    
    setState(prev => ({ ...prev, accordionState: newAccordionState }));
  };

  const expandAll = () => {
    const allSections = Object.keys(DEFAULT_SOURCES_STATE.accordionState);
    const newAccordionState = Object.fromEntries(allSections.map(key => [key, true]));
    setState(prev => ({ ...prev, accordionState: newAccordionState }));
  };

  const collapseAll = () => {
    const allSections = Object.keys(DEFAULT_SOURCES_STATE.accordionState);
    const newAccordionState = Object.fromEntries(allSections.map(key => [key, false]));
    setState(prev => ({ ...prev, accordionState: newAccordionState }));
  };

  const resetToDefault = () => {
    setState(DEFAULT_SOURCES_STATE);
  };

  return {
    state,
    updateFilters,
    clearFilters,
    updateSorting,
    toggleAutoRefresh,
    setRefreshInterval,
    getOpenSections,
    handleAccordionChange,
    expandAll,
    collapseAll,
    resetToDefault
  };
};

// Export the SourceFilter type for other components
export type { SourceFilter };
