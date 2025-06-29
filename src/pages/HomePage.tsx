
import React from 'react';
import { useHomeData } from '@/hooks/useHomeData';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardContent from '@/components/dashboard/DashboardContent';

const HomePage = () => {
  const {
    displayProvinces,
    internationalHubs,
    alertProvinces,
    visibleAlertProvinces,
    visibleProvincesCount,
    recentIncidentsCount,
    loading,
    refreshData
  } = useHomeData();

  if (loading) {
    return <DashboardLoadingState />;
  }

  return (
    <DashboardContent
      alertProvinces={alertProvinces}
      visibleAlertProvinces={visibleAlertProvinces}
      visibleProvincesCount={visibleProvincesCount}
      totalProvinces={displayProvinces.length}
      displayProvinces={displayProvinces}
      internationalHubs={internationalHubs}
      incidentsCount={recentIncidentsCount}
      onRefresh={refreshData}
      loading={loading}
    />
  );
};

export default HomePage;
