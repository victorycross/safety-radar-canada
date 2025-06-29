
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Filter } from 'lucide-react';

interface GridHeaderProps {
  refreshKey: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  isFiltered: boolean;
  visibleCount: number;
  totalCount: number;
}

const GridHeader = ({
  refreshKey,
  isRefreshing,
  onRefresh,
  isFiltered,
  visibleCount,
  totalCount
}: GridHeaderProps) => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Canadian Provinces & Territories</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="gap-1 h-8"
              title="Refresh view"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            {isFiltered && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                <span>Filtered View</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm text-muted-foreground">Provincial security status overview</p>
            <span className="text-sm font-medium">
              Showing {visibleCount} of {totalCount} locations
            </span>
          </div>
        </div>
      </CardTitle>
    </CardHeader>
  );
};

export default GridHeader;
