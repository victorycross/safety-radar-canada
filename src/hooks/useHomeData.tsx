
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { useLocationVisibility } from '@/hooks/useLocationVisibility';
import { Province, InternationalHub, DashboardData } from '@/types/dashboard';
import { SupabaseProvince } from '@/types/supabase-types';
import { logger } from '@/utils/logger';

export const useHomeData = (): DashboardData => {
  const { provinces: supabaseProvinces, incidents, loading, refreshData } = useSupabaseDataContext();
  
  logger.debug('useHomeData: Hook called', {
    supabaseProvincesCount: supabaseProvinces?.length || 0,
    incidentsCount: incidents?.length || 0,
    loading
  });
  
  // International hubs data - consolidated here
  const internationalHubs: InternationalHub[] = [
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

  // Fallback provinces data - only used if no Supabase data
  const fallbackProvinces: Province[] = [
    { id: 'ab', name: 'Alberta', code: 'AB', alertLevel: 'normal', employeeCount: 15420 },
    { id: 'bc', name: 'British Columbia', code: 'BC', alertLevel: 'normal', employeeCount: 23150 },
    { id: 'mb', name: 'Manitoba', code: 'MB', alertLevel: 'normal', employeeCount: 5890 },
    { id: 'nb', name: 'New Brunswick', code: 'NB', alertLevel: 'normal', employeeCount: 3420 },
    { id: 'nl', name: 'Newfoundland and Labrador', code: 'NL', alertLevel: 'normal', employeeCount: 2180 },
    { id: 'ns', name: 'Nova Scotia', code: 'NS', alertLevel: 'normal', employeeCount: 4350 },
    { id: 'on', name: 'Ontario', code: 'ON', alertLevel: 'normal', employeeCount: 45200 },
    { id: 'pe', name: 'Prince Edward Island', code: 'PE', alertLevel: 'normal', employeeCount: 890 },
    { id: 'qc', name: 'Quebec', code: 'QC', alertLevel: 'normal', employeeCount: 32100 },
    { id: 'sk', name: 'Saskatchewan', code: 'SK', alertLevel: 'normal', employeeCount: 4750 },
    { id: 'nt', name: 'Northwest Territories', code: 'NT', alertLevel: 'normal', employeeCount: 220 },
    { id: 'nu', name: 'Nunavut', code: 'NU', alertLevel: 'normal', employeeCount: 180 },
    { id: 'yt', name: 'Yukon', code: 'YT', alertLevel: 'normal', employeeCount: 150 }
  ];

  // Transform Supabase data to match our interface, with proper property mapping
  const provinces: Province[] = supabaseProvinces?.length > 0 
    ? supabaseProvinces.map((province: SupabaseProvince) => ({
        id: province.id,
        name: province.name,
        code: province.code,
        alertLevel: (province.alert_level === 'normal' || 
                    province.alert_level === 'warning' || 
                    province.alert_level === 'severe') 
                   ? province.alert_level 
                   : 'normal',
        employeeCount: province.employee_count || 0
      }))
    : fallbackProvinces;

  logger.info('useHomeData: Using data source', {
    source: supabaseProvinces?.length > 0 ? 'Supabase' : 'Fallback',
    provincesCount: provinces.length
  });
  
  // Extract actual province IDs for the hook
  const actualProvinceIds = provinces.map(p => p.id);
  
  const { isProvinceVisible } = useLocationVisibility(actualProvinceIds);
  
  // Get provinces with severe or warning statuses
  const alertProvinces = provinces.filter(province => 
    province.alertLevel === 'severe' || province.alertLevel === 'warning'
  );

  // Filter alert provinces based on visibility for display purposes
  const visibleAlertProvinces = alertProvinces.filter(province => isProvinceVisible(province.id));

  // Get visible provinces count
  const visibleProvincesCount = provinces.filter(province => isProvinceVisible(province.id)).length;

  // Recent incidents count
  const recentIncidentsCount = incidents?.length || 0;

  const metrics: DashboardData['metrics'] = {
    totalProvinces: provinces.length,
    visibleProvincesCount,
    alertProvincesCount: alertProvinces.length,
    incidentsCount: recentIncidentsCount,
    employeesCount: provinces.reduce((sum, p) => sum + p.employeeCount, 0)
  };

  return {
    provinces,
    internationalHubs,
    alertProvinces,
    visibleAlertProvinces,
    metrics,
    loading,
    refreshData
  };
};
