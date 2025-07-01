
import React from 'react';
import DashboardContent from '@/components/dashboard/DashboardContent';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import { useHomeData } from '@/hooks/useHomeData';
import { useLocationVisibility } from '@/hooks/useLocationVisibility';
import { useDataIngestion } from '@/hooks/useDataIngestion';
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

  // Get data ingestion status for processing indicators
  const {
    sources,
    healthMetrics,
    queueStatus,
    loading: ingestionLoading
  } = useDataIngestion();

  const provinceIds = provinces.map(p => p.id);
  const { isProvinceVisible } = useLocationVisibility(provinceIds);
  
  // Filter provinces for display
  const displayProvinces = provinces.filter(province => isProvinceVisible(province.id));

  // Calculate processing status metrics
  const dataSourcesCount = sources?.length || 0;
  const healthySources = sources?.filter(s => s.health_status === 'healthy') || [];
  const healthySourcesCount = healthySources.length;
  const processingQueueCount = queueStatus?.pending || 0;
  const systemErrors = sources?.filter(s => s.health_status === 'error').length || 0;
  
  // Get last data update time from health metrics
  const lastDataUpdate = healthMetrics && healthMetrics.length > 0 
    ? new Date(healthMetrics[0].timestamp) 
    : undefined;
  
  const hasDataErrors = systemErrors > 0;
  const isProcessing = ingestionLoading || loading;

  logger.debug('HomePage: Data loaded', {
    provincesCount: provinces.length,
    alertProvincesCount: alertProvinces.length,
    visibleAlertProvincesCount: visibleAlertProvinces.length,
    dataSourcesCount,
    healthySourcesCount,
    systemErrors,
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
      lastDataUpdate={lastDataUpdate}
      isProcessing={isProcessing}
      hasDataErrors={hasDataErrors}
      dataSourcesCount={dataSourcesCount}
      healthySourcesCount={healthySourcesCount}
      processingQueueCount={processingQueueCount}
      systemErrors={systemErrors}
    />
  );
};

export default HomePage;
