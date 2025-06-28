
import { useState, useEffect } from 'react';
import { AlertLevel, IncidentSource, VerificationStatus } from '@/types';

interface IncidentFilters {
  search: string;
  alertLevels: AlertLevel[];
  verificationStatuses: VerificationStatus[];
  provinces: string[];
  sources: IncidentSource[];
  dateFrom: string;
  dateTo: string;
}

interface IncidentState {
  filters: IncidentFilters;
  sortBy: 'timestamp' | 'title' | 'alertLevel' | 'province';
  sortOrder: 'asc' | 'desc';
  currentPage: number;
  itemsPerPage: number;
  autoRefresh: boolean;
  refreshInterval: number;
}

const DEFAULT_FILTERS: IncidentFilters = {
  search: '',
  alertLevels: [],
  verificationStatuses: [],
  provinces: [],
  sources: [],
  dateFrom: '',
  dateTo: ''
};

const DEFAULT_STATE: IncidentState = {
  filters: DEFAULT_FILTERS,
  sortBy: 'timestamp',
  sortOrder: 'desc',
  currentPage: 1,
  itemsPerPage: 10,
  autoRefresh: false,
  refreshInterval: 30000
};

const DEFAULT_ACCORDION_STATE = {
  'filters': true,
  'incidents-list': true,
  'add-incident': false,
  'data-management': false
};

export const useIncidentState = () => {
  const [state, setState] = useState<IncidentState>(DEFAULT_STATE);
  const [accordionState, setAccordionState] = useState<Record<string, boolean>>(DEFAULT_ACCORDION_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('incidentPageState');
    const savedAccordion = localStorage.getItem('incidentAccordionState');
    
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState({ ...DEFAULT_STATE, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved incident state:', error);
      }
    }
    
    if (savedAccordion) {
      try {
        const parsed = JSON.parse(savedAccordion);
        setAccordionState({ ...DEFAULT_ACCORDION_STATE, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved accordion state:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('incidentPageState', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('incidentAccordionState', JSON.stringify(accordionState));
  }, [accordionState]);

  const updateFilters = (newFilters: Partial<IncidentFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      currentPage: 1 // Reset to first page when filters change
    }));
  };

  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      filters: DEFAULT_FILTERS,
      currentPage: 1
    }));
  };

  const updateSorting = (sortBy: IncidentState['sortBy'], sortOrder: IncidentState['sortOrder']) => {
    setState(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const updatePagination = (currentPage: number, itemsPerPage?: number) => {
    setState(prev => ({
      ...prev,
      currentPage,
      ...(itemsPerPage && { itemsPerPage })
    }));
  };

  const toggleAutoRefresh = () => {
    setState(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }));
  };

  const setRefreshInterval = (interval: number) => {
    setState(prev => ({ ...prev, refreshInterval: interval }));
  };

  // Accordion management
  const getOpenSections = () => {
    return Object.keys(accordionState).filter(key => accordionState[key]);
  };

  const handleAccordionChange = (value: string[]) => {
    const newState = { ...accordionState };
    Object.keys(newState).forEach(key => {
      newState[key] = value.includes(key);
    });
    setAccordionState(newState);
  };

  const expandAll = () => {
    const allSections = Object.keys(DEFAULT_ACCORDION_STATE);
    const newState = Object.fromEntries(allSections.map(key => [key, true]));
    setAccordionState(newState);
  };

  const collapseAll = () => {
    const allSections = Object.keys(DEFAULT_ACCORDION_STATE);
    const newState = Object.fromEntries(allSections.map(key => [key, false]));
    setAccordionState(newState);
  };

  const resetToDefault = () => {
    setState(DEFAULT_STATE);
    setAccordionState(DEFAULT_ACCORDION_STATE);
  };

  return {
    state,
    updateFilters,
    clearFilters,
    updateSorting,
    updatePagination,
    toggleAutoRefresh,
    setRefreshInterval,
    resetToDefault,
    getOpenSections,
    handleAccordionChange,
    expandAll,
    collapseAll,
    accordionState
  };
};
