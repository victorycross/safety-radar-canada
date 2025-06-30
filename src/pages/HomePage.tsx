
import React from 'react';
import { useHomeData } from '@/hooks/useHomeData';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardContent from '@/components/dashboard/DashboardContent';
import { logger } from '@/utils/logger';

const HomePage = () => {
  logger.debug('HomePage: Component rendering started');
  
  const homeData = useHomeData();

  logger.debug('HomePage: Data loaded', {
    loading: homeData.loading,
    provincesCount: homeData.provinces.length,
    alertProvincesCount: homeData.alertProvinces.length,
    visibleProvincesCount: homeData.metrics.visibleProvincesCount,
    incidentsCount: homeData.metrics.incidentsCount
  });

  if (homeData.loading) {
    logger.debug('HomePage: Showing loading state');
    return <DashboardLoadingState />;
  }

  logger.debug('HomePage: Rendering dashboard content');

  return (
    <DashboardContent
      alertProvinces={homeData.alertProvinces}
      visibleAlertProvinces={homeData.visibleAlertProvinces}
      visibleProvincesCount={homeData.metrics.visibleProvincesCount}
      totalProvinces={homeData.metrics.totalProvinces}
      displayProvinces={homeData.provinces}
      internationalHubs={homeData.internationalHubs}
      incidentsCount={homeData.metrics.incidentsCount}
      onRefresh={homeData.refreshData}
      loading={homeData.loading}
    />
  );
};

export default HomePage;
