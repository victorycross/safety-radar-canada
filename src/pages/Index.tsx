import React from 'react';
import DashboardContent from '@/components/dashboard/DashboardContent';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import { useHomeData } from '@/hooks/useHomeData';
import { useLocationVisibility } from '@/hooks/useLocationVisibility';
import { useHubData } from '@/hooks/useHubData';
import { logger } from '@/utils/logger';

const Index = () => {
  const { 
    provinces, 
    internationalHubs,
    alertProvinces, 
    visibleAlertProvinces,
    alertHubs,
    metrics, 
    loading, 
    error, 
    refreshData 
  } = useHomeData();

  const { hubs: hubsData, loading: hubsLoading, refreshData: refreshHubData } = useHubData();

  const actualProvinceIds = provinces.map(p => p.id);
  const { 
    isProvinceVisible
  } = useLocationVisibility(actualProvinceIds);

  logger.debug('Index: Component rendered', {
    provincesCount: provinces.length,
    hubsCount: internationalHubs.length,
    alertProvincesCount: alertProvinces.length,
    alertHubsCount: alertHubs?.length || 0,
    loading,
    hubsLoading
  });

  // Get provinces visible based on current filter settings
  const displayProvinces = provinces.filter(province => isProvinceVisible(province.id));
  const visibleProvincesCount = displayProvinces.length;

  if (error) {
    logger.error('Index: Error state', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading && provinces.length === 0) {
    logger.debug('Index: Showing loading state');
    return <DashboardLoadingState />;
  }

  const combinedRefresh = async () => {
    await Promise.all([
      refreshData(),
      refreshHubData()
    ]);
  };

  return (
    <DashboardContent
      alertProvinces={alertProvinces}
      visibleAlertProvinces={visibleAlertProvinces}
      visibleProvincesCount={visibleProvincesCount}
      totalProvinces={provinces.length}
      displayProvinces={displayProvinces}
      internationalHubs={internationalHubs}
      alertHubs={alertHubs}
      incidentsCount={metrics.incidentsCount}
      metrics={metrics}
      onRefresh={combinedRefresh}
      onRefreshHubs={refreshHubData}
      loading={loading}
      hubsLoading={hubsLoading}
    />
  );
};

export default Index;
