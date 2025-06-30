
import React from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import CriticalAlertsHero from '@/components/dashboard/CriticalAlertsHero';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import { Province, InternationalHub } from '@/types/dashboard';

interface DashboardContentProps {
  alertProvinces: Province[];
  visibleAlertProvinces: Province[];
  visibleProvincesCount: number;
  totalProvinces: number;
  displayProvinces: Province[];
  internationalHubs: InternationalHub[];
  incidentsCount: number;
  onRefresh: () => void;
  loading: boolean;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  alertProvinces,
  visibleAlertProvinces,
  visibleProvincesCount,
  totalProvinces,
  displayProvinces,
  internationalHubs,
  incidentsCount,
  onRefresh,
  loading
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        alertCount={alertProvinces.length}
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
          loading={loading}
        />

        {/* Main Dashboard Content in Tabs */}
        <DashboardTabs
          visibleProvincesCount={visibleProvincesCount}
          totalProvinces={totalProvinces}
          internationalHubsCount={internationalHubs.length}
          incidentsCount={incidentsCount}
        />
      </div>
    </div>
  );
};

export default DashboardContent;
