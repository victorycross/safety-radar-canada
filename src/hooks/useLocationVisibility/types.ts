
export interface LocationVisibilityState {
  provinces: Record<string, boolean>;
  internationalHubs: Record<string, boolean>;
}

export interface LocationVisibilityHookReturn {
  visibility: LocationVisibilityState;
  pendingVisibility: LocationVisibilityState;
  hasUnsavedChanges: boolean;
  refreshKey: number;
  isRefreshing: boolean;
  forceRefresh: () => Promise<void>;
  togglePendingProvince: (provinceId: string) => void;
  togglePendingInternationalHub: (hubId: string) => void;
  selectAllPendingProvinces: () => void;
  deselectAllPendingProvinces: () => void;
  selectAllPendingInternationalHubs: () => void;
  deselectAllPendingInternationalHubs: () => void;
  applyChanges: () => boolean;
  cancelChanges: () => void;
  resetToDefault: () => void;
  getVisibleProvincesCount: () => number;
  getTotalProvincesCount: () => number;
  getVisibleInternationalHubsCount: () => number;
  getTotalInternationalHubsCount: () => number;
  getPendingVisibleProvincesCount: () => number;
  getPendingVisibleInternationalHubsCount: () => number;
  isProvinceVisible: (provinceId: string) => boolean;
  isInternationalHubVisible: (hubId: string) => boolean;
  isPendingProvinceVisible: (provinceId: string) => boolean;
  isPendingInternationalHubVisible: (hubId: string) => boolean;
  isFiltered: () => boolean;
}
