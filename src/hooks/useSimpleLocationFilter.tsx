
import { useState, useEffect, useCallback } from 'react';

interface SimpleFilterState {
  provinces: Set<string>;
  internationalHubs: Set<string>;
}

export const useSimpleLocationFilter = (provinceIds: string[] = [], hubIds: string[] = []) => {
  const [hiddenProvinces, setHiddenProvinces] = useState<Set<string>>(new Set());
  const [hiddenHubs, setHiddenHubs] = useState<Set<string>>(new Set());
  
  // Load saved filters on mount
  useEffect(() => {
    const saved = localStorage.getItem('simpleLocationFilter');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHiddenProvinces(new Set(parsed.hiddenProvinces || []));
        setHiddenHubs(new Set(parsed.hiddenHubs || []));
      } catch (error) {
        console.error('Failed to load saved filters:', error);
      }
    }
  }, []);

  // Save filters when they change
  const saveFilters = useCallback((newHiddenProvinces: Set<string>, newHiddenHubs: Set<string>) => {
    const filterState = {
      hiddenProvinces: Array.from(newHiddenProvinces),
      hiddenHubs: Array.from(newHiddenHubs)
    };
    localStorage.setItem('simpleLocationFilter', JSON.stringify(filterState));
  }, []);

  const toggleProvince = useCallback((provinceId: string) => {
    setHiddenProvinces(prev => {
      const newSet = new Set(prev);
      if (newSet.has(provinceId)) {
        newSet.delete(provinceId);
      } else {
        newSet.add(provinceId);
      }
      saveFilters(newSet, hiddenHubs);
      return newSet;
    });
  }, [hiddenHubs, saveFilters]);

  const toggleHub = useCallback((hubId: string) => {
    setHiddenHubs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hubId)) {
        newSet.delete(hubId);
      } else {
        newSet.add(hubId);
      }
      saveFilters(hiddenProvinces, newSet);
      return newSet;
    });
  }, [hiddenProvinces, saveFilters]);

  const showAllProvinces = useCallback(() => {
    const newSet = new Set<string>();
    setHiddenProvinces(newSet);
    saveFilters(newSet, hiddenHubs);
  }, [hiddenHubs, saveFilters]);

  const hideAllProvinces = useCallback(() => {
    const newSet = new Set(provinceIds);
    setHiddenProvinces(newSet);
    saveFilters(newSet, hiddenHubs);
  }, [provinceIds, hiddenHubs, saveFilters]);

  const showAllHubs = useCallback(() => {
    const newSet = new Set<string>();
    setHiddenHubs(newSet);
    saveFilters(hiddenProvinces, newSet);
  }, [hiddenProvinces, saveFilters]);

  const hideAllHubs = useCallback(() => {
    const newSet = new Set(hubIds);
    setHiddenHubs(newSet);
    saveFilters(hiddenProvinces, newSet);
  }, [hubIds, hiddenProvinces, saveFilters]);

  const resetFilters = useCallback(() => {
    const emptyProvinces = new Set<string>();
    const emptyHubs = new Set<string>();
    setHiddenProvinces(emptyProvinces);
    setHiddenHubs(emptyHubs);
    saveFilters(emptyProvinces, emptyHubs);
  }, [saveFilters]);

  // Filter functions
  const isProvinceVisible = useCallback((provinceId: string) => !hiddenProvinces.has(provinceId), [hiddenProvinces]);
  const isHubVisible = useCallback((hubId: string) => !hiddenHubs.has(hubId), [hiddenHubs]);

  // Counts
  const visibleProvinceCount = provinceIds.length - hiddenProvinces.size;
  const visibleHubCount = hubIds.length - hiddenHubs.size;
  const hasFilters = hiddenProvinces.size > 0 || hiddenHubs.size > 0;

  return {
    // Visibility functions
    isProvinceVisible,
    isHubVisible,
    
    // Toggle functions
    toggleProvince,
    toggleHub,
    
    // Bulk actions
    showAllProvinces,
    hideAllProvinces,
    showAllHubs,
    hideAllHubs,
    resetFilters,
    
    // State info
    visibleProvinceCount,
    visibleHubCount,
    totalProvinces: provinceIds.length,
    totalHubs: hubIds.length,
    hasFilters
  };
};
