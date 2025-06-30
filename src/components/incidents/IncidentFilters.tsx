import React from 'react';
import { AlertLevel, IncidentSource, VerificationStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, X, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { format } from 'date-fns';

interface IncidentFiltersProps {
  filters: {
    search: string;
    alertLevels: AlertLevel[];
    verificationStatuses: VerificationStatus[];
    provinces: string[];
    sources: IncidentSource[];
    dateFrom: string;
    dateTo: string;
  };
  onFiltersChange: (filters: any) => void;
  onClearFilters: () => void;
}

const IncidentFilters: React.FC<IncidentFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const { provinces } = useSupabaseDataContext();

  const alertLevelOptions = [
    { value: AlertLevel.NORMAL, label: 'Normal' },
    { value: AlertLevel.WARNING, label: 'Warning' },
    { value: AlertLevel.SEVERE, label: 'Severe' }
  ];

  const verificationOptions = [
    { value: VerificationStatus.VERIFIED, label: 'Verified' },
    { value: VerificationStatus.UNVERIFIED, label: 'Unverified' }
  ];

  const sourceOptions = [
    { value: IncidentSource.POLICE, label: 'Police' },
    { value: IncidentSource.GOVERNMENT, label: 'Government' },
    { value: IncidentSource.CYBERSECURITY, label: 'Cybersecurity' },
    { value: IncidentSource.EVERBRIDGE, label: 'Everbridge' },
    { value: IncidentSource.WEATHER, label: 'Weather' },
    { value: IncidentSource.TRAVEL, label: 'Travel' },
    { value: IncidentSource.MANUAL, label: 'Manual' }
  ];

  const handleCheckboxChange = (value: string, field: string, checked: boolean) => {
    const currentValues = filters[field as keyof typeof filters] as string[];
    const newValues = checked 
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    
    onFiltersChange({ [field]: newValues });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.alertLevels.length > 0) count++;
    if (filters.verificationStatuses.length > 0) count++;
    if (filters.provinces.length > 0) count++;
    if (filters.sources.length > 0) count++;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="space-y-2">
        <Label htmlFor="search">Search Incidents</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by title or description..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Alert Levels */}
        <div className="space-y-3">
          <Label>Alert Levels</Label>
          <div className="space-y-2">
            {alertLevelOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`alert-${option.value}`}
                  checked={filters.alertLevels.includes(option.value)}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange(option.value, 'alertLevels', checked as boolean)
                  }
                />
                <Label htmlFor={`alert-${option.value}`} className="text-sm font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Status */}
        <div className="space-y-3">
          <Label>Verification Status</Label>
          <div className="space-y-2">
            {verificationOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`verification-${option.value}`}
                  checked={filters.verificationStatuses.includes(option.value)}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange(option.value, 'verificationStatuses', checked as boolean)
                  }
                />
                <Label htmlFor={`verification-${option.value}`} className="text-sm font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div className="space-y-3">
          <Label>Information Sources</Label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {sourceOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`source-${option.value}`}
                  checked={filters.sources.includes(option.value)}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange(option.value, 'sources', checked as boolean)
                  }
                />
                <Label htmlFor={`source-${option.value}`} className="text-sm font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>From Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? format(new Date(filters.dateFrom), 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                onSelect={(date) => onFiltersChange({ dateFrom: date ? date.toISOString() : '' })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>To Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateTo ? format(new Date(filters.dateTo), 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                onSelect={(date) => onFiltersChange({ dateTo: date ? date.toISOString() : '' })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters and Controls */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
          </span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClearFilters}
          disabled={activeFilterCount === 0}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Clear Filters
        </Button>
      </div>
    </div>
  );
};

export default IncidentFilters;
