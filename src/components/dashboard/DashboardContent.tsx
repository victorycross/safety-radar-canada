
import React from 'react';
import { DashboardMetrics } from '@/types/dashboard';
import { Province, InternationalHub } from '@/types/dashboard';
import AlertsSummaryCard from './AlertsSummaryCard';
import { Card, CardContent } from '@/components/ui/card';
import SimpleGlobeMap from '@/components/map/SimpleGlobeMap';
import EmployeeDistributionChart from './EmployeeDistributionChart';
import EnhancedMetricsWidget from './EnhancedMetricsWidget';
import DataStatusIndicator from './DataStatusIndicator';
import { useNavigate } from 'react-router-dom';

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
  loading,
  lastDataUpdate,
  isProcessing,
  hasDataErrors,
  dataSourcesCount,
  healthySourcesCount,
  processingQueueCount,
  systemErrors
}) => {
  const navigate = useNavigate();

  const handleViewLocationAlerts = (type: 'province' | 'hub', locationId: string, locationName: string) => {
    // Navigate to alert ready page with location filter
    const searchParams = new URLSearchParams({
      location: locationName,
      type: type,
      tab: 'all-alerts'
    });
    navigate(`/alert-ready?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Data Status Indicator */}
        <DataStatusIndicator
          lastUpdated={lastDataUpdate}
          isProcessing={isProcessing}
          hasErrors={hasDataErrors}
          dataSourcesCount={dataSourcesCount}
          healthySourcesCount={healthySourcesCount}
        />

        {/* Alerts Summary Card */}
        <AlertsSummaryCard
          alertProvinces={alertProvinces}
          alertHubs={alertHubs}
          loading={loading}
        />

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Metrics */}
            <EnhancedMetricsWidget
              metrics={{
                ...metrics,
                visibleProvincesCount,
                totalProvinces,
                alertProvincesCount: alertProvinces.length,
                incidentsCount,
                totalHubs: internationalHubs.length,
                alertHubsCount: alertHubs.length,
                employeesCount: metrics.employeesCount,
                hubEmployeesCount: metrics.hubEmployeesCount || 0
              }}
              loading={loading}
            />

            {/* Interactive Map */}
            <SimpleGlobeMap />

            {/* Employee Distribution Chart */}
            <EmployeeDistributionChart />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-semibold mb-2">Quick Actions</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Access key features and tools
                  </p>
                   <div className="space-y-2">
                    <button
                      onClick={() => navigate('/public-safety-alerts')}
                      className="w-full text-left p-3 rounded-md hover:bg-gray-100 transition-colors text-sm"
                    >
                      🌦️ Public Safety Alerts
                    </button>
                    <button
                      onClick={() => navigate('/alert-ready')}
                      className="w-full text-left p-3 rounded-md hover:bg-gray-100 transition-colors text-sm"
                    >
                      📢 View Alert Feed
                    </button>
                    <button
                      onClick={() => navigate('/admin')}
                      className="w-full text-left p-3 rounded-md hover:bg-gray-100 transition-colors text-sm"
                    >
                      ⚙️ Admin Panel
                    </button>
                    <button
                      onClick={() => navigate('/report')}
                      className="w-full text-left p-3 rounded-md hover:bg-gray-100 transition-colors text-sm"
                    >
                      📝 Report Incident
                    </button>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
