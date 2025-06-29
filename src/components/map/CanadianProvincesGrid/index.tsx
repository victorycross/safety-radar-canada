
import React from 'react';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { Card, CardContent } from '@/components/ui/card';
import { useLocationVisibility } from '@/hooks/useLocationVisibility';
import { fallbackProvinces } from './data';
import GridHeader from './GridHeader';
import ProvinceCard from './ProvinceCard';
import Legend from './Legend';

const CanadianProvincesGrid = () => {
  const { provinces } = useSupabaseDataContext();

  // Use data from context if available, otherwise use fallback data
  const displayProvinces = provinces.length > 0 ? provinces : fallbackProvinces;
  
  // Extract actual province IDs for the hook
  const actualProvinceIds = displayProvinces.map(p => p.id);
  
  const {
    getVisibleProvincesCount,
    getTotalProvincesCount,
    isProvinceVisible,
    isFiltered,
    refreshKey,
    isRefreshing,
    forceRefresh
  } = useLocationVisibility(actualProvinceIds);
  
  // Filter provinces based on visibility settings (key prop forces re-render)
  const visibleProvinces = displayProvinces.filter(province => isProvinceVisible(province.id));

  const visibleCount = getVisibleProvincesCount();
  const totalCount = getTotalProvincesCount();
  const filtered = isFiltered();

  return (
    <Card key={refreshKey} className="bg-white rounded-lg shadow-sm">
      <GridHeader
        refreshKey={refreshKey}
        isRefreshing={isRefreshing}
        onRefresh={forceRefresh}
        isFiltered={filtered}
        visibleCount={visibleCount}
        totalCount={totalCount}
      />
      
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-6">
          {visibleProvinces.map((province) => (
            <ProvinceCard key={province.id} province={province} />
          ))}
        </div>

        {visibleProvinces.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No provinces selected. Use the "Customize View" button to show locations.</p>
          </div>
        )}

        <Legend />
      </CardContent>
    </Card>
  );
};

export default CanadianProvincesGrid;
