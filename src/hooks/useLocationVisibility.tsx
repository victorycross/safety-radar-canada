import { useState, useEffect, useCallback } from 'react';

interface LocationVisibilityState {
  provinces: Record<string, boolean>;
  internationalHubs: Record<string, boolean>;
}

const DEFAULT_PROVINCES = [
  'ab', 'bc', 'mb', 'nb', 'nl', 'ns', 'on', 'pe', 'qc', 'sk', 'nt', 'nu', 'yt'
];

const DEFAULT_INTERNATIONAL_HUBS = [
  'nyc', 'london', 'hk', 'singapore', 'tokyo', 'frankfurt', 'zurich', 'dubai', 'sydney', 'toronto-intl'
];

const getDefaultVisibility = (provinceIds?: string[], hubIds?: string[]): LocationVisibilityState => ({
  provinces: Object.fromEntries((provinceIds || DEFAULT_PROVINCES).map(id => [id, true])),
  internationalHubs: Object.fromEntries((hubIds || DEFAULT_INTERNATIONAL_HUBS).map(id => [id, true]))
});

export const useLocationVisibility = (actualProvinceIds?: string[], actualHubIds?: string[]) => {
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
      
      // Only update if we don't have saved data for these specific IDs
      const saved = localStorage.getItem('locationVisibility');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Check if saved data has the same keys as current data
          const savedProvinceKeys = Object.keys(parsed.provinces || {});
          const currentProvinceKeys = actualProvinceIds || DEFAULT_PROVINCES;
          const keysMatch = savedProvinceKeys.length === currentProvinceKeys.length && 
                          savedProvinceKeys.every(key => currentProvinceKeys.includes(key));
          
          if (keysMatch) {
            setVisibility(parsed);
            setPendingVisibility(parsed);
            return;
          }
        } catch (error) {
          console.error('Failed to parse saved location visibility:', error);
        }
      }
      
      // If no saved data or keys don't match, use new default
      setVisibility(newDefaultVisibility);
      setPendingVisibility(newDefaultVisibility);
    }
  }, [actualProvinceIds, actualHubIds]);

  // Load from localStorage on mount (fallback for when no actual IDs provided)
  useEffect(() => {
    if (!actualProvinceIds && !actualHubIds) {
      const saved = localStorage.getItem('locationVisibility');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setVisibility(parsed);
          setPendingVisibility(parsed);
        } catch (error) {
          console.error('Failed to parse saved location visibility:', error);
        }
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
    // Simulate a brief loading state
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
    localStorage.setItem('locationVisibility', JSON.stringify(pendingVisibility));
    // Force immediate refresh of all consuming components
    setRefreshKey(prev => prev + 1);
    return true; // Success
  };

  const cancelChanges = () => {
    setPendingVisibility(visibility);
  };

  const resetToDefault = () => {
    const defaultState = getDefaultVisibility(actualProvinceIds, actualHubIds);
    setPendingVisibility(defaultState);
  };

  const getVisibleProvincesCount = () => {
    return Object.values(visibility.provinces).filter(Boolean).length;
  };

  const getTotalProvincesCount = () => {
    return Object.keys(visibility.provinces).length;
  };

  const getVisibleInternationalHubsCount = () => {
    return Object.values(visibility.internationalHubs).filter(Boolean).length;
  };

  const getTotalInternationalHubsCount = () => {
    return Object.keys(visibility.internationalHubs).length;
  };

  const getPendingVisibleProvincesCount = () => {
    return Object.values(pendingVisibility.provinces).filter(Boolean).length;
  };

  const getPendingVisibleInternationalHubsCount = () => {
    return Object.values(pendingVisibility.internationalHubs).filter(Boolean).length;
  };

  const isProvinceVisible = (provinceId: string) => {
    return visibility.provinces[provinceId] ?? true;
  };

  const isInternationalHubVisible = (hubId: string) => {
    return visibility.internationalHubs[hubId] ?? true;
  };

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
