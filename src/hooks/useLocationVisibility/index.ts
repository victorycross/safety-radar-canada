
import { useState, useEffect, useCallback } from 'react';
import { LocationVisibilityState, LocationVisibilityHookReturn } from './types';
import { DEFAULT_PROVINCES, DEFAULT_INTERNATIONAL_HUBS } from './constants';
import { getDefaultVisibility, loadFromLocalStorage, saveToLocalStorage, doKeysMatch } from './utils';

export const useLocationVisibility = (actualProvinceIds?: string[], actualHubIds?: string[]): LocationVisibilityHookReturn => {
  const [visibility, setVisibility] = useState<LocationVisibilityState>(() => 
    getDefaultVisibility(actualProvinceIds, actualHubIds)
  );
  const [pendingVisibility, setPendingVisibility] = useState<LocationVisibilityState>(() => 
    getDefaultVisibility(actualProvinceIds, actualHubIds)
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update visibility when actual IDs change
  useEffect(() => {
    if (actualProvinceIds || actualHubIds) {
      const newDefaultVisibility = getDefaultVisibility(actualProvinceIds, actualHubIds);
      
      const saved = loadFromLocalStorage();
      if (saved) {
        const currentProvinceKeys = actualProvinceIds || DEFAULT_PROVINCES;
        const keysMatch = doKeysMatch(saved, currentProvinceKeys);
        
        if (keysMatch) {
          setVisibility(saved);
          setPendingVisibility(saved);
          return;
        }
      }
      
      setVisibility(newDefaultVisibility);
      setPendingVisibility(newDefaultVisibility);
    }
  }, [actualProvinceIds, actualHubIds]);

  // Load from localStorage on mount (fallback for when no actual IDs provided)
  useEffect(() => {
    if (!actualProvinceIds && !actualHubIds) {
      const saved = loadFromLocalStorage();
      if (saved) {
        setVisibility(saved);
        setPendingVisibility(saved);
      }
    }
  }, [actualProvinceIds, actualHubIds]);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(visibility) !== JSON.stringify(pendingVisibility);
    setHasUnsavedChanges(hasChanges);
  }, [visibility, pendingVisibility]);

  const forceRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setRefreshKey(prev => prev + 1);
    setIsRefreshing(false);
  }, []);

  const togglePendingProvince = (provinceId: string) => {
    console.log('Toggling province in hook:', provinceId);
    setPendingVisibility(prev => {
      const currentValue = prev.provinces[provinceId] ?? true;
      const newValue = !currentValue;
      console.log(`Province ${provinceId} changing from ${currentValue} to ${newValue}`);
      return {
        ...prev,
        provinces: {
          ...prev.provinces,
          [provinceId]: newValue
        }
      };
    });
  };

  const togglePendingInternationalHub = (hubId: string) => {
    console.log('Toggling hub in hook:', hubId);
    setPendingVisibility(prev => {
      const currentValue = prev.internationalHubs[hubId] ?? true;
      const newValue = !currentValue;
      console.log(`Hub ${hubId} changing from ${currentValue} to ${newValue}`);
      return {
        ...prev,
        internationalHubs: {
          ...prev.internationalHubs,
          [hubId]: newValue
        }
      };
    });
  };

  const selectAllPendingProvinces = () => {
    setPendingVisibility(prev => ({
      ...prev,
      provinces: Object.fromEntries(Object.keys(prev.provinces).map(id => [id, true]))
    }));
  };

  const deselectAllPendingProvinces = () => {
    setPendingVisibility(prev => ({
      ...prev,
      provinces: Object.fromEntries(Object.keys(prev.provinces).map(id => [id, false]))
    }));
  };

  const selectAllPendingInternationalHubs = () => {
    setPendingVisibility(prev => ({
      ...prev,
      internationalHubs: Object.fromEntries(Object.keys(prev.internationalHubs).map(id => [id, true]))
    }));
  };

  const deselectAllPendingInternationalHubs = () => {
    setPendingVisibility(prev => ({
      ...prev,
      internationalHubs: Object.fromEntries(Object.keys(prev.internationalHubs).map(id => [id, false]))
    }));
  };

  const applyChanges = () => {
    setVisibility(pendingVisibility);
    saveToLocalStorage(pendingVisibility);
    setRefreshKey(prev => prev + 1);
    return true;
  };

  const cancelChanges = () => {
    setPendingVisibility(visibility);
  };

  const resetToDefault = () => {
    const defaultState = getDefaultVisibility(actualProvinceIds, actualHubIds);
    setPendingVisibility(defaultState);
  };

  // Utility functions
  const getVisibleProvincesCount = () => Object.values(visibility.provinces).filter(Boolean).length;
  const getTotalProvincesCount = () => Object.keys(visibility.provinces).length;
  const getVisibleInternationalHubsCount = () => Object.values(visibility.internationalHubs).filter(Boolean).length;
  const getTotalInternationalHubsCount = () => Object.keys(visibility.internationalHubs).length;
  const getPendingVisibleProvincesCount = () => Object.values(pendingVisibility.provinces).filter(Boolean).length;
  const getPendingVisibleInternationalHubsCount = () => Object.values(pendingVisibility.internationalHubs).filter(Boolean).length;

  const isProvinceVisible = (provinceId: string) => visibility.provinces[provinceId] ?? true;
  const isInternationalHubVisible = (hubId: string) => visibility.internationalHubs[hubId] ?? true;

  const isPendingProvinceVisible = (provinceId: string) => {
    const result = pendingVisibility.provinces[provinceId] ?? true;
    console.log(`isPendingProvinceVisible(${provinceId}):`, result);
    return result;
  };

  const isPendingInternationalHubVisible = (hubId: string) => {
    const result = pendingVisibility.internationalHubs[hubId] ?? true;
    console.log(`isPendingInternationalHubVisible(${hubId}):`, result);
    return result;
  };

  const isFiltered = () => {
    const visibleProvinces = getVisibleProvincesCount();
    const totalProvinces = getTotalProvincesCount();
    const visibleHubs = getVisibleInternationalHubsCount();
    const totalHubs = getTotalInternationalHubsCount();
    
    return visibleProvinces < totalProvinces || visibleHubs < totalHubs;
  };

  return {
    visibility,
    pendingVisibility,
    hasUnsavedChanges,
    refreshKey,
    isRefreshing,
    forceRefresh,
    togglePendingProvince,
    togglePendingInternationalHub,
    selectAllPendingProvinces,
    deselectAllPendingProvinces,
    selectAllPendingInternationalHubs,
    deselectAllPendingInternationalHubs,
    applyChanges,
    cancelChanges,
    resetToDefault,
    getVisibleProvincesCount,
    getTotalProvincesCount,
    getVisibleInternationalHubsCount,
    getTotalInternationalHubsCount,
    getPendingVisibleProvincesCount,
    getPendingVisibleInternationalHubsCount,
    isProvinceVisible,
    isInternationalHubVisible,
    isPendingProvinceVisible,
    isPendingInternationalHubVisible,
    isFiltered
  };
};
