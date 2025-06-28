
import { useState, useEffect } from 'react';

const DEFAULT_ACCORDION_STATE = {
  'active-alerts': true,    // Always show critical alerts
  'provinces': true,        // Show provinces by default
  'international': true,    // Show international hubs by default
  'recent-alerts': false,   // Collapse secondary sections by default
  'incidents': false,       // Collapse secondary sections by default
  'employee-chart': false   // Collapse secondary sections by default
};

export const useAccordionState = () => {
  const [accordionState, setAccordionState] = useState<Record<string, boolean>>(DEFAULT_ACCORDION_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('accordionState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAccordionState({ ...DEFAULT_ACCORDION_STATE, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved accordion state:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('accordionState', JSON.stringify(accordionState));
  }, [accordionState]);

  const toggleSection = (sectionId: string) => {
    setAccordionState(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isSectionOpen = (sectionId: string) => {
    return accordionState[sectionId] ?? false;
  };

  const getOpenSections = () => {
    return Object.keys(accordionState).filter(key => accordionState[key]);
  };

  return {
    toggleSection,
    isSectionOpen,
    getOpenSections
  };
};
