
import { LocationVisibilityState } from './types';
import { DEFAULT_PROVINCES, DEFAULT_INTERNATIONAL_HUBS } from './constants';

export const getDefaultVisibility = (provinceIds?: string[], hubIds?: string[]): LocationVisibilityState => ({
  provinces: Object.fromEntries((provinceIds || DEFAULT_PROVINCES).map(id => [id, true])),
  internationalHubs: Object.fromEntries((hubIds || DEFAULT_INTERNATIONAL_HUBS).map(id => [id, true]))
});

export const loadFromLocalStorage = (): LocationVisibilityState | null => {
  try {
    const saved = localStorage.getItem('locationVisibility');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to parse saved location visibility:', error);
    return null;
  }
};

export const saveToLocalStorage = (visibility: LocationVisibilityState): void => {
  localStorage.setItem('locationVisibility', JSON.stringify(visibility));
};

export const doKeysMatch = (saved: LocationVisibilityState, currentProvinceKeys: string[]): boolean => {
  const savedProvinceKeys = Object.keys(saved.provinces || {});
  return savedProvinceKeys.length === currentProvinceKeys.length && 
         savedProvinceKeys.every(key => currentProvinceKeys.includes(key));
};
