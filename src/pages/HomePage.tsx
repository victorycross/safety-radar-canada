
import React from 'react';
import { Loader2 } from 'lucide-react';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { useLocationVisibility } from '@/hooks/useLocationVisibility';
import { AlertLevel } from '@/types';
import DashboardHeader from '@/components/layout/DashboardHeader';
import CriticalAlertsHero from '@/components/dashboard/CriticalAlertsHero';
import DashboardTabs from '@/components/dashboard/DashboardTabs';

const HomePage = () => {
  const { provinces, incidents, loading, refreshData } = useSupabaseDataContext();
  const { isProvinceVisible } = useLocationVisibility();
  
  // International hubs data - consolidated here
  const internationalHubs = [
    { id: 'nyc', name: 'New York', country: 'United States' },
    { id: 'london', name: 'London', country: 'United Kingdom' },
    { id: 'hk', name: 'Hong Kong', country: 'China' },
    { id: 'singapore', name: 'Singapore', country: 'Singapore' },
    { id: 'tokyo', name: 'Tokyo', country: 'Japan' },
    { id: 'frankfurt', name: 'Frankfurt', country: 'Germany' },
    { id: 'zurich', name: 'Zurich', country: 'Switzerland' },
    { id: 'dubai', name: 'Dubai', country: 'UAE' },
    { id: 'sydney', name: 'Sydney', country: 'Australia' },
    { id: 'toronto-intl', name: 'Toronto Financial District', country: 'Canada' }
  ];

  // Fallback provinces data
  const fallbackProvinces = [
    { id: 'ab', name: 'Alberta', code: 'AB', alertLevel: 'normal' as const, employeeCount: 15420 },
    { id: 'bc', name: 'British Columbia', code: 'BC', alertLevel: 'normal' as const, employeeCount: 23150 },
    { id: 'mb', name: 'Manitoba', code: 'MB', alertLevel: 'normal' as const, employeeCount: 5890 },
    { id: 'nb', name: 'New Brunswick', code: 'NB', alertLevel: 'normal' as const, employeeCount: 3420 },
    { id: 'nl', name: 'Newfoundland and Labrador', code: 'NL', alertLevel: 'normal' as const, employeeCount: 2180 },
    { id: 'ns', name: 'Nova Scotia', code: 'NS', alertLevel: 'normal' as const, employeeCount: 4350 },
    { id: 'on', name: 'Ontario', code: 'ON', alertLevel: 'normal' as const, employeeCount: 45200 },
    { id: 'pe', name: 'Prince Edward Island', code: 'PE', alertLevel: 'normal' as const, employeeCount: 890 },
    { id: 'qc', name: 'Quebec', code: 'QC', alertLevel: 'normal' as const, employeeCount: 32100 },
    { id: 'sk', name: 'Saskatchewan', code: 'SK', alertLevel: 'normal' as const, employeeCount: 4750 },
    { id: 'nt', name: 'Northwest Territories', code: 'NT', alertLevel: 'normal' as const, employeeCount: 220 },
    { id: 'nu', name: 'Nunavut', code: 'NU', alertLevel: 'normal' as const, employeeCount: 180 },
    { id: 'yt', name: 'Yukon', code: 'YT', alertLevel: 'normal' as const, employeeCount: 150 }
  ];

  // Use data from context if available, otherwise use fallback data
  const displayProvinces = provinces.length > 0 ? provinces : fallbackProvinces;
  
  // Get provinces with severe or warning statuses
  const alertProvinces = displayProvinces.filter(province => 
    province.alertLevel === AlertLevel.SEVERE || province.alertLevel === AlertLevel.WARNING
  );

  // Filter alert provinces based on visibility for display purposes
  const visibleAlertProvinces = alertProvinces.filter(province => isProvinceVisible(province.id));

  // Get visible provinces count
  const visibleProvincesCount = displayProvinces.filter(province => isProvinceVisible(province.id)).length;

  // Recent incidents count
  const recentIncidentsCount = incidents.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading security dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        alertCount={alertProvinces.length}
        visibleProvincesCount={visibleProvincesCount}
        totalProvinces={displayProvinces.length}
        onRefresh={refreshData}
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
          totalProvinces={displayProvinces.length}
          internationalHubsCount={internationalHubs.length}
          incidentsCount={recentIncidentsCount}
        />
      </div>
    </div>
  );
};

export default HomePage;
