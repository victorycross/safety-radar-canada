
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, RotateCcw, Check, X } from 'lucide-react';

interface FilterControlsProps {
  hasUnsavedChanges: boolean;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  onApply: () => void;
  onCancel: () => void;
  onReset: () => void;
  showApplyCancel?: boolean;
  applyLabel?: string;
  resetLabel?: string;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  hasUnsavedChanges,
  hasActiveFilters,
  activeFilterCount,
  onApply,
  onCancel,
  onReset,
  showApplyCancel = false,
  applyLabel = "Apply Changes",
  resetLabel = "Reset Filters"
}) => {
  return (
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
        {hasUnsavedChanges && showApplyCancel && (
          <span className="text-sm text-orange-600 ml-2">• Unsaved changes</span>
        )}
      </div>
      
      <div className="flex gap-2">
        {showApplyCancel && (
          <>
            <Button variant="outline" onClick={onCancel} className="gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
            <Button 
              onClick={onApply} 
              disabled={!hasUnsavedChanges}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {applyLabel}
            </Button>
          </>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onReset}
          disabled={!hasActiveFilters}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          {resetLabel}
        </Button>
      </div>
    </div>
  );
};

export default FilterControls;
