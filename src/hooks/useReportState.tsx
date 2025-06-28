
import { useState, useEffect } from 'react';

interface ReportState {
  activeStep: number;
  formData: Record<string, any>;
  isDraft: boolean;
  lastSaved: Date | null;
  submitHistory: any[];
}

const DEFAULT_STATE: ReportState = {
  activeStep: 1,
  formData: {},
  isDraft: false,
  lastSaved: null,
  submitHistory: []
};

const DEFAULT_ACCORDION_STATE = {
  'guidelines': true,
  'report-form': true,
  'submission-history': false,
  'emergency-contacts': false
};

export const useReportState = () => {
  const [state, setState] = useState<ReportState>(DEFAULT_STATE);
  const [accordionState, setAccordionState] = useState<Record<string, boolean>>(DEFAULT_ACCORDION_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('reportPageState');
    const savedAccordion = localStorage.getItem('reportAccordionState');
    
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState({ ...DEFAULT_STATE, ...parsed });
      } catch (error) {
        console.error('Failed to parse saved report state:', error);
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
    localStorage.setItem('reportPageState', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem('reportAccordionState', JSON.stringify(accordionState));
  }, [accordionState]);

  const updateFormData = (data: Record<string, any>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data },
      isDraft: true,
      lastSaved: new Date()
    }));
  };

  const saveDraft = () => {
    setState(prev => ({
      ...prev,
      isDraft: false,
      lastSaved: new Date()
    }));
  };

  const clearDraft = () => {
    setState(prev => ({
      ...prev,
      formData: {},
      isDraft: false,
      lastSaved: null
    }));
  };

  const addToHistory = (submission: any) => {
    setState(prev => ({
      ...prev,
      submitHistory: [submission, ...prev.submitHistory]
    }));
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

  return {
    state,
    updateFormData,
    saveDraft,
    clearDraft,
    addToHistory,
    getOpenSections,
    handleAccordionChange,
    expandAll,
    collapseAll,
    accordionState
  };
};
