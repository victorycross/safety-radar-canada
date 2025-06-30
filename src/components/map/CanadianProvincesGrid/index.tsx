
import React from 'react';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { Card, CardContent } from '@/components/ui/card';
import { useSimpleLocationFilter } from '@/hooks/useSimpleLocationFilter';
import { fallbackProvinces } from './data';
import GridHeader from './GridHeader';
import CompactLocationCard from '../CompactLocationCard';
import Legend from './Legend';
import { Province } from '@/types/dashboard';
import { logger } from '@/utils/logger';

const CanadianProvincesGrid = () => {
  const { provinces: supabaseProvinces } = useSupabaseDataContext();

  // Transform Supabase provinces to match our interface
  const transformedProvinces: Province[] = supabaseProvinces?.length > 0 
    ? supabaseProvinces.map(province => ({
        id: province.id,
        name: province.name,
        code: province.code,
        alertLevel: province.alert_level as 'normal' | 'warning' | 'severe',
        employeeCount: province.employee_count || 0
      }))
    : fallbackProvinces;

  logger.debug('CanadianProvincesGrid: Using data source', {
    source: supabaseProvinces?.length > 0 ? 'Supabase' : 'Fallback',
    provincesCount: transformedProvinces.length
  });
  
  // Extract actual province IDs for the hook
  const actualProvinceIds = transformedProvinces.map(p => p.id);
  
  const {
    isProvinceVisible,
    resetFilters,
    visibleProvinceCount,
    totalProvinces,
    hasFilters
  } = useSimpleLocationFilter(actualProvinceIds, []);
  
  // Filter provinces based on visibility settings
  const visibleProvinces = transformedProvinces.filter(province => isProvinceVisible(province.id));

  const handleRefresh = () => {
    // Force re-render by resetting the component
    window.location.reload();
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <GridHeader
        refreshKey={0}
        isRefreshing={false}
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
              emoji={province.id === 'bc' ? '🏔️' : province.id === 'ab' ? '🛢️' : province.id === 'on' ? '🏙️' : '🍁'}
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
