
import React from 'react';
import DashboardHeader from '@/components/layout/DashboardHeader';
import CriticalAlertsHero from '@/components/dashboard/CriticalAlertsHero';
import DashboardTabs from '@/components/dashboard/DashboardTabs';
import SystemHealthWidget from '@/components/dashboard/SystemHealthWidget';
import { Province, InternationalHub, DashboardMetrics } from '@/types/dashboard';
import { useAuth } from '@/components/auth/AuthProvider';

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
  // New processing status props
  lastDataUpdate?: Date;
  isProcessing?: boolean;
  hasDataErrors?: boolean;
  dataSourcesCount?: number;
  healthySourcesCount?: number;
  processingQueueCount?: number;
  systemErrors?: number;
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
  hubsLoading = false,
  lastDataUpdate,
  isProcessing = false,
  hasDataErrors = false,
  dataSourcesCount = 0,
  healthySourcesCount = 0,
  processingQueueCount = 0,
  systemErrors = 0
}) => {
  const { isAdmin } = useAuth();

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
        lastDataUpdate={lastDataUpdate}
        isProcessing={isProcessing}
        hasDataErrors={hasDataErrors}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* Critical Alerts Hero Section */}
        <CriticalAlertsHero
          alertProvinces={alertProvinces}
          visibleAlertProvinces={visibleAlertProvinces}
          alertHubs={alertHubs}
          loading={loading}
        />

        {/* System Health Widget - Admin Only */}
        {isAdmin() && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <SystemHealthWidget
                dataSourcesCount={dataSourcesCount}
                healthySourcesCount={healthySourcesCount}
                processingQueueCount={processingQueueCount}
                lastProcessingTime={lastDataUpdate}
                systemErrors={systemErrors}
              />
            </div>
          </div>
        )}

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
