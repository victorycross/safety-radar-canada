
import React from 'react';
import DashboardContent from '@/components/dashboard/DashboardContent';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import { useHomeData } from '@/hooks/useHomeData';
import { useLocationVisibility } from '@/hooks/useLocationVisibility';
import { logger } from '@/utils/logger';

const HomePage = () => {
  logger.debug('HomePage: Component rendering');
  
  const {
    provinces,
    internationalHubs,
    alertProvinces,
    visibleAlertProvinces,
    alertHubs,
    metrics,
    loading,
    refreshData
  } = useHomeData();

  const provinceIds = provinces.map(p => p.id);
  const { isProvinceVisible } = useLocationVisibility(provinceIds);
  
  // Filter provinces for display
  const displayProvinces = provinces.filter(province => isProvinceVisible(province.id));

  logger.debug('HomePage: Data loaded', {
    provincesCount: provinces.length,
    alertProvincesCount: alertProvinces.length,
    visibleAlertProvincesCount: visibleAlertProvinces.length,
    loading
  });

  if (loading) {
    logger.debug('HomePage: Showing loading state');
    return <DashboardLoadingState />;
  }

  logger.debug('HomePage: Rendering dashboard content');

  return (
    <DashboardContent
      alertProvinces={alertProvinces}
      visibleAlertProvinces={visibleAlertProvinces}
      visibleProvincesCount={metrics.visibleProvincesCount}
      totalProvinces={metrics.totalProvinces}
      displayProvinces={displayProvinces}
      internationalHubs={internationalHubs}
      alertHubs={alertHubs}
      incidentsCount={metrics.incidentsCount}
      metrics={metrics}
      onRefresh={refreshData}
      loading={loading}
    />
  );
};

export default HomePage;
