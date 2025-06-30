
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useSimpleLocationFilter } from '@/hooks/useSimpleLocationFilter';
import GridHeader from './GridHeader';
import CompactLocationCard from '../CompactLocationCard';
import Legend from './Legend';
import { useHomeData } from '@/hooks/useHomeData';
import { getProvinceCodeFromId } from '@/services/provinceMapping';
import { provinceEmojis } from './data';
import { logger } from '@/utils/logger';

const CanadianProvincesGrid = () => {
  const { provinces, loading } = useHomeData();

  logger.debug('CanadianProvincesGrid: Using synced data', {
    provincesCount: provinces.length,
    loading
  });
  
  // Extract actual province IDs for the hook
  const actualProvinceIds = provinces.map(p => p.id);
  
  const {
    isProvinceVisible,
    resetFilters,
    visibleProvinceCount,
    totalProvinces,
    hasFilters
  } = useSimpleLocationFilter(actualProvinceIds, []);
  
  // Filter provinces based on visibility settings
  const visibleProvinces = provinces.filter(province => isProvinceVisible(province.id));

  const handleRefresh = () => {
    // Force re-render by reloading the page
    window.location.reload();
  };

  const getEmojiForProvince = (provinceId: string): string => {
    const code = getProvinceCodeFromId(provinceId);
    if (code && provinceEmojis[code as keyof typeof provinceEmojis]) {
      return provinceEmojis[code as keyof typeof provinceEmojis];
    }
    return '🍁'; // Default Canadian flag emoji
  };

  if (loading) {
    return (
      <Card className="bg-white rounded-lg shadow-sm">
        <CardContent className="p-6">
          <div className="text-center">Loading provinces...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <GridHeader
        refreshKey={0}
        isRefreshing={loading}
        onRefresh={handleRefresh}
        isFiltered={hasFilters}
        visibleCount={visibleProvinceCount}
        totalCount={totalProvinces}
        filterComponent={
          <div className="flex gap-2">
            {hasFilters && (
              <button 
                onClick={resetFilters}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        }
      />
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 mb-6">
          {visibleProvinces.map((province) => (
            <CompactLocationCard
              key={province.id}
              id={province.id}
              name={province.name}
              code={province.code}
              alertLevel={province.alertLevel}
              employeeCount={province.employeeCount}
              emoji={getEmojiForProvince(province.id)}
              linkTo={`/province/${province.id}`}
            />
          ))}
        </div>

        {visibleProvinces.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No provinces match the current filters.</p>
            <button 
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-800 underline mt-2"
            >
              Show all provinces
            </button>
          </div>
        )}

        <Legend />
      </CardContent>
    </Card>
  );
};

export default CanadianProvincesGrid;
