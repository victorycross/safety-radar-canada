
import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertLevel } from '@/types';

export interface HubFilterState {
  alertLevel: AlertLevel | 'all';
  status: 'all' | 'active' | 'inactive';
  sortBy: 'name' | 'employeeCount' | 'alertLevel' | 'incidents';
  sortOrder: 'asc' | 'desc';
}

interface HubFiltersProps {
  filters: HubFilterState;
  onFiltersChange: (filters: HubFilterState) => void;
  totalHubs: number;
  filteredCount: number;
}

const HubFilters: React.FC<HubFiltersProps> = ({
  filters,
  onFiltersChange,
  totalHubs,
  filteredCount
}) => {
  const updateFilter = (key: keyof HubFilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
      alertLevel: 'all',
      status: 'all',
      sortBy: 'name',
      sortOrder: 'asc'
    });
  };

  const hasActiveFilters = filters.alertLevel !== 'all' || filters.status !== 'all';

  return (
    <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg border">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Filters</span>
          {hasActiveFilters && (
            <Badge variant="secondary">
              {filteredCount} of {totalHubs}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Alert Level</label>
          <Select
            value={filters.alertLevel}
            onValueChange={(value) => updateFilter('alertLevel', value as AlertLevel | 'all')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value={AlertLevel.NORMAL}>Normal</SelectItem>
              <SelectItem value={AlertLevel.WARNING}>Warning</SelectItem>
              <SelectItem value={AlertLevel.SEVERE}>Severe</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Status</label>
          <Select
            value={filters.status}
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Sort By</label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="employeeCount">Employee Count</SelectItem>
              <SelectItem value="alertLevel">Alert Level</SelectItem>
              <SelectItem value="incidents">Incidents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Order</label>
          <Select
            value={filters.sortOrder}
            onValueChange={(value) => updateFilter('sortOrder', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default HubFilters;
