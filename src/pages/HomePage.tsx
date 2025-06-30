
import React from 'react';
import { useHomeData } from '@/hooks/useHomeData';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import DashboardContent from '@/components/dashboard/DashboardContent';

const HomePage = () => {
  console.log('HomePage: Component rendering started');
  
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

  console.log('HomePage: Data loaded', {
    loading,
    displayProvincesCount: displayProvinces?.length,
    alertProvincesCount: alertProvinces?.length,
    visibleProvincesCount,
    recentIncidentsCount
  });

  if (loading) {
    console.log('HomePage: Showing loading state');
    return <DashboardLoadingState />;
  }

  console.log('HomePage: Rendering dashboard content');

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
