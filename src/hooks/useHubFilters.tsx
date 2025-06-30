
import { useState, useMemo } from 'react';
import { InternationalHub } from '@/types/dashboard';
import { AlertLevel } from '@/types';

export interface HubFilterState {
  alertLevel: AlertLevel | 'all';
  status: 'all' | 'active' | 'inactive';
  sortBy: 'name' | 'employeeCount' | 'alertLevel' | 'incidents';
  sortOrder: 'asc' | 'desc';
}

const defaultFilters: HubFilterState = {
  alertLevel: 'all',
  status: 'all',
  sortBy: 'name',
  sortOrder: 'asc'
};

export const useHubFilters = (hubs: InternationalHub[]) => {
  const [filters, setFilters] = useState<HubFilterState>(defaultFilters);

  const filteredAndSortedHubs = useMemo(() => {
    let filtered = hubs.filter(hub => {
      // Filter by alert level
      if (filters.alertLevel !== 'all' && hub.alertLevel !== filters.alertLevel) {
        return false;
      }

      // Filter by status
      if (filters.status === 'active' && !hub.isActive) return false;
      if (filters.status === 'inactive' && hub.isActive) return false;

      return true;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'employeeCount':
          aValue = a.employeeCount;
          bValue = b.employeeCount;
          break;
        case 'alertLevel':
          // Convert alert levels to numbers for sorting
          const alertLevelOrder = { [AlertLevel.NORMAL]: 0, [AlertLevel.WARNING]: 1, [AlertLevel.SEVERE]: 2 };
          aValue = alertLevelOrder[a.alertLevel];
          bValue = alertLevelOrder[b.alertLevel];
          break;
        case 'incidents':
          aValue = a.localIncidents;
          bValue = b.localIncidents;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [hubs, filters]);

  return {
    filters,
    setFilters,
    filteredHubs: filteredAndSortedHubs
  };
};
