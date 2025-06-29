
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';
import { useGenericFilter } from '@/hooks/useGenericFilter';
import FilterControls from '@/components/common/FilterControls';

export interface SourceFilter {
  search: string;
  verificationStatus: string[];
  sourceTypes: string[];
  healthStatus: string[];
  lastUpdated: string;
}

interface SourceFiltersProps {
  onFiltersChange: (filters: SourceFilter) => void;
  initialFilters?: Partial<SourceFilter>;
}

const DEFAULT_FILTERS: SourceFilter = {
  search: '',
  verificationStatus: [],
  sourceTypes: [],
  healthStatus: [],
  lastUpdated: 'all'
};

const SourceFilters: React.FC<SourceFiltersProps> = ({ 
  onFiltersChange, 
  initialFilters = {} 
}) => {
  const {
    filters,
    pendingFilters,
    hasUnsavedChanges,
    updatePendingFilters,
    applyChanges,
    cancelChanges,
    resetFilters,
    hasActiveFilters,
    activeFilterCount
  } = useGenericFilter({
    defaultFilters: { ...DEFAULT_FILTERS, ...initialFilters },
    storageKey: 'sourceFilters'
  });

  const verificationOptions = [
    { value: 'verified', label: 'Verified' },
    { value: 'unverified', label: 'Unverified' }
  ];

  const sourceTypeOptions = [
    { value: 'police', label: 'Police Reports' },
    { value: 'global_security', label: 'Global Security' },
    { value: 'us_soc', label: 'US SOC' },
    { value: 'news', label: 'News' },
    { value: 'crowdsourced', label: 'Crowdsourced' },
    { value: 'everbridge', label: 'Everbridge' },
    { value: 'alert_ready', label: 'Alert Ready' }
  ];

  const healthStatusOptions = [
    { value: 'healthy', label: 'Healthy' },
    { value: 'degraded', label: 'Degraded' },
    { value: 'offline', label: 'Offline' },
    { value: 'error', label: 'Error' }
  ];

  const handleCheckboxChange = (
    field: 'verificationStatus' | 'sourceTypes' | 'healthStatus',
    value: string,
    checked: boolean
  ) => {
    const currentValues = pendingFilters[field];
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    updatePendingFilters({ [field]: newValues });
  };

  const handleApply = () => {
    applyChanges();
    onFiltersChange(pendingFilters);
  };

  // Apply filters immediately for non-modal use
  React.useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sources by name, description, or type..."
            value={pendingFilters.search}
            onChange={(e) => updatePendingFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>
        <Select 
          value={pendingFilters.lastUpdated} 
          onValueChange={(value) => updatePendingFilters({ lastUpdated: value })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Last Updated" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter Groups */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Verification Status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Verification Status</Label>
          <div className="space-y-2">
            {verificationOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`verification-${option.value}`}
                  checked={pendingFilters.verificationStatus.includes(option.value)}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('verificationStatus', option.value, checked as boolean)
                  }
                />
                <Label htmlFor={`verification-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Source Types */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Source Types</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {sourceTypeOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${option.value}`}
                  checked={pendingFilters.sourceTypes.includes(option.value)}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('sourceTypes', option.value, checked as boolean)
                  }
                />
                <Label htmlFor={`type-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Health Status */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Health Status</Label>
          <div className="space-y-2">
            {healthStatusOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`health-${option.value}`}
                  checked={pendingFilters.healthStatus.includes(option.value)}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange('healthStatus', option.value, checked as boolean)
                  }
                />
                <Label htmlFor={`health-${option.value}`} className="text-sm">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-4 border-t">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {pendingFilters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {pendingFilters.search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => 
                updatePendingFilters({ search: '' })
              } />
            </Badge>
          )}
          
          {pendingFilters.verificationStatus.map(status => (
            <Badge key={status} variant="secondary" className="gap-1">
              {verificationOptions.find(o => o.value === status)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => 
                handleCheckboxChange('verificationStatus', status, false)
              } />
            </Badge>
          ))}
          
          {pendingFilters.sourceTypes.map(type => (
            <Badge key={type} variant="secondary" className="gap-1">
              {sourceTypeOptions.find(o => o.value === type)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => 
                handleCheckboxChange('sourceTypes', type, false)
              } />
            </Badge>
          ))}
          
          {pendingFilters.healthStatus.map(status => (
            <Badge key={status} variant="secondary" className="gap-1">
              {healthStatusOptions.find(o => o.value === status)?.label}
              <X className="h-3 w-3 cursor-pointer" onClick={() => 
                handleCheckboxChange('healthStatus', status, false)
              } />
            </Badge>
          ))}
        </div>
      )}

      <FilterControls
        hasUnsavedChanges={hasUnsavedChanges}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={activeFilterCount}
        onApply={handleApply}
        onCancel={cancelChanges}
        onReset={resetFilters}
        resetLabel="Clear All Filters"
      />
    </div>
  );
};

export default SourceFilters;
export { DEFAULT_FILTERS as DEFAULT_SOURCE_FILTERS };
