
import { useState, useEffect, useCallback } from 'react';

export interface GenericFilterState<T = any> {
  [key: string]: T;
}

export interface UseGenericFilterOptions<T> {
  defaultFilters: T;
  storageKey: string;
  resetToDefault?: () => T;
}

export const useGenericFilter = <T extends GenericFilterState>({
  defaultFilters,
  storageKey,
  resetToDefault
}: UseGenericFilterOptions<T>) => {
  const [filters, setFilters] = useState<T>(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState<T>(defaultFilters);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFilters({ ...defaultFilters, ...parsed });
        setPendingFilters({ ...defaultFilters, ...parsed });
      } catch (error) {
        console.error(`Failed to parse saved filters for ${storageKey}:`, error);
      }
    }
  }, [defaultFilters, storageKey]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(filters) !== JSON.stringify(pendingFilters);
    setHasUnsavedChanges(hasChanges);
  }, [filters, pendingFilters]);

  const updatePendingFilters = useCallback((updates: Partial<T>) => {
    setPendingFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const applyChanges = useCallback(() => {
    setFilters(pendingFilters);
    localStorage.setItem(storageKey, JSON.stringify(pendingFilters));
    return true;
  }, [pendingFilters, storageKey]);

  const cancelChanges = useCallback(() => {
    setPendingFilters(filters);
  }, [filters]);

  const resetFilters = useCallback(() => {
    const defaultState = resetToDefault ? resetToDefault() : defaultFilters;
    setPendingFilters(defaultState);
  }, [defaultFilters, resetToDefault]);

  const clearFilters = useCallback(() => {
    const clearedFilters = { ...defaultFilters };
    setPendingFilters(clearedFilters);
  }, [defaultFilters]);

  const hasActiveFilters = useCallback(() => {
    return JSON.stringify(filters) !== JSON.stringify(defaultFilters);
  }, [filters, defaultFilters]);

  const getActiveFilterCount = useCallback(() => {
    let count = 0;
    Object.entries(filters).forEach(([key, value]) => {
      const defaultValue = defaultFilters[key as keyof T];
      if (Array.isArray(value) && Array.isArray(defaultValue)) {
        if (value.length !== defaultValue.length || !value.every(v => defaultValue.includes(v))) {
          count++;
        }
      } else if (typeof value === 'string' && typeof defaultValue === 'string') {
        if (value !== defaultValue && value.trim() !== '') {
          count++;
        }
      } else if (value !== defaultValue) {
        count++;
      }
    });
    return count;
  }, [filters, defaultFilters]);

  return {
    filters,
    pendingFilters,
    hasUnsavedChanges,
    updatePendingFilters,
    applyChanges,
    cancelChanges,
    resetFilters,
    clearFilters,
    hasActiveFilters: hasActiveFilters(),
    activeFilterCount: getActiveFilterCount()
  };
};
