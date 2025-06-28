
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

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('locationVisibility');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setVisibility(parsed);
      } catch (error) {
        console.error('Failed to parse saved location visibility:', error);
      }
    }
  }, []);

  // Save to localStorage whenever visibility changes
  useEffect(() => {
    localStorage.setItem('locationVisibility', JSON.stringify(visibility));
  }, [visibility]);

  const toggleProvince = (provinceId: string) => {
    setVisibility(prev => ({
      ...prev,
      provinces: {
        ...prev.provinces,
        [provinceId]: !prev.provinces[provinceId]
      }
    }));
  };

  const toggleInternationalHub = (hubId: string) => {
    setVisibility(prev => ({
      ...prev,
      internationalHubs: {
        ...prev.internationalHubs,
        [hubId]: !prev.internationalHubs[hubId]
      }
    }));
  };

  const selectAllProvinces = () => {
    setVisibility(prev => ({
      ...prev,
      provinces: Object.fromEntries(Object.keys(prev.provinces).map(id => [id, true]))
    }));
  };

  const deselectAllProvinces = () => {
    setVisibility(prev => ({
      ...prev,
      provinces: Object.fromEntries(Object.keys(prev.provinces).map(id => [id, false]))
    }));
  };

  const selectAllInternationalHubs = () => {
    setVisibility(prev => ({
      ...prev,
      internationalHubs: Object.fromEntries(Object.keys(prev.internationalHubs).map(id => [id, true]))
    }));
  };

  const deselectAllInternationalHubs = () => {
    setVisibility(prev => ({
      ...prev,
      internationalHubs: Object.fromEntries(Object.keys(prev.internationalHubs).map(id => [id, false]))
    }));
  };

  const resetToDefault = () => {
    setVisibility(getDefaultVisibility());
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

  const isProvinceVisible = (provinceId: string) => {
    return visibility.provinces[provinceId] ?? true;
  };

  const isInternationalHubVisible = (hubId: string) => {
    return visibility.internationalHubs[hubId] ?? true;
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
    toggleProvince,
    toggleInternationalHub,
    selectAllProvinces,
    deselectAllProvinces,
    selectAllInternationalHubs,
    deselectAllInternationalHubs,
    resetToDefault,
    getVisibleProvincesCount,
    getTotalProvincesCount,
    getVisibleInternationalHubsCount,
    getTotalInternationalHubsCount,
    isProvinceVisible,
    isInternationalHubVisible,
    isFiltered
  };
};
