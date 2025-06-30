
import React from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import CriticalAlertsHero from '@/components/dashboard/CriticalAlertsHero';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import { Province, InternationalHub, DashboardMetrics } from '@/types/dashboard';

interface DashboardContentProps {
  alertProvinces: Province[];
  visibleAlertProvinces: Province[];
  visibleProvincesCount: number;
  totalProvinces: number;
  displayProvinces: Province[];
  internationalHubs: InternationalHub[];
  alertHubs?: InternationalHub[];
  incidentsCount: number;
  metrics: DashboardMetrics;
  onRefresh: () => void;
  onRefreshHubs?: () => void;
  loading: boolean;
  hubsLoading?: boolean;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  alertProvinces,
  visibleAlertProvinces,
  visibleProvincesCount,
  totalProvinces,
  displayProvinces,
  internationalHubs,
  alertHubs = [],
  incidentsCount,
  metrics,
  onRefresh,
  onRefreshHubs,
  loading,
  hubsLoading = false
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        alertCount={alertProvinces.length + alertHubs.length}
        visibleProvincesCount={visibleProvincesCount}
        totalProvinces={totalProvinces}
        onRefresh={onRefresh}
        loading={loading}
        provinces={displayProvinces}
        internationalHubs={internationalHubs}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* Critical Alerts Hero Section - Always Visible */}
        <CriticalAlertsHero
          alertProvinces={alertProvinces}
          visibleAlertProvinces={visibleAlertProvinces}
          alertHubs={alertHubs}
          loading={loading}
        />

        {/* Main Dashboard Content in Tabs */}
        <DashboardTabs
          visibleProvincesCount={visibleProvincesCount}
          totalProvinces={totalProvinces}
          internationalHubsCount={internationalHubs.length}
          incidentsCount={incidentsCount}
          internationalHubs={internationalHubs}
          hubsLoading={hubsLoading}
          onRefreshHubs={onRefreshHubs}
          metrics={metrics}
        />
      </div>
    </div>
  );
};

export default DashboardContent;
