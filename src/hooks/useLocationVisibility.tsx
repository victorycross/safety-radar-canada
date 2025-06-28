
import { useState, useEffect } from 'react';

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

const getDefaultVisibility = (): LocationVisibilityState => ({
  provinces: Object.fromEntries(DEFAULT_PROVINCES.map(id => [id, true])),
  internationalHubs: Object.fromEntries(DEFAULT_INTERNATIONAL_HUBS.map(id => [id, true]))
});

export const useLocationVisibility = () => {
  const [visibility, setVisibility] = useState<LocationVisibilityState>(getDefaultVisibility);
  const [pendingVisibility, setPendingVisibility] = useState<LocationVisibilityState>(getDefaultVisibility);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
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
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(visibility) !== JSON.stringify(pendingVisibility);
    setHasUnsavedChanges(hasChanges);
  }, [visibility, pendingVisibility]);

  const togglePendingProvince = (provinceId: string) => {
    setPendingVisibility(prev => ({
      ...prev,
      provinces: {
        ...prev.provinces,
        [provinceId]: !prev.provinces[provinceId]
      }
    }));
  };

  const togglePendingInternationalHub = (hubId: string) => {
    setPendingVisibility(prev => ({
      ...prev,
      internationalHubs: {
        ...prev.internationalHubs,
        [hubId]: !prev.internationalHubs[hubId]
      }
    }));
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
    return true; // Success
  };

  const cancelChanges = () => {
    setPendingVisibility(visibility);
  };

  const resetToDefault = () => {
    const defaultState = getDefaultVisibility();
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
    return pendingVisibility.provinces[provinceId] ?? true;
  };

  const isPendingInternationalHubVisible = (hubId: string) => {
    return pendingVisibility.internationalHubs[hubId] ?? true;
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
