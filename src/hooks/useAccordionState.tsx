
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

  // Return array of open sections for Radix UI Accordion
  const getOpenSections = () => {
    return Object.keys(accordionState).filter(key => accordionState[key]);
  };

  // Handle accordion value changes from Radix UI
  const handleAccordionChange = (value: string[]) => {
    const newState = { ...accordionState };
    
    // Set all sections to false first
    Object.keys(newState).forEach(key => {
      newState[key] = false;
    });
    
    // Set open sections to true
    value.forEach(sectionId => {
      newState[sectionId] = true;
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
    setAccordionState(DEFAULT_ACCORDION_STATE);
  };

  return {
    toggleSection,
    isSectionOpen,
    getOpenSections,
    handleAccordionChange,
    expandAll,
    collapseAll,
    resetToDefault,
    accordionState
  };
};
