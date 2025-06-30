
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { useLocationVisibility } from '@/hooks/useLocationVisibility';
import { Province, InternationalHub, DashboardData } from '@/types/dashboard';
import { AlertLevel } from '@/types';
import { logger } from '@/utils/logger';
import { syncProvinceData } from '@/services/provinceMapping';
import { useEffect, useState } from 'react';

export const useHomeData = (): DashboardData => {
  const { provinces: supabaseProvinces, incidents, loading: supabaseLoading, refreshData } = useSupabaseDataContext();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  logger.debug('useHomeData: Hook called', {
    supabaseProvincesCount: supabaseProvinces?.length || 0,
    incidentsCount: incidents?.length || 0,
    supabaseLoading
  });

  // Sync province data when component mounts or when supabase data changes
  useEffect(() => {
    const loadProvinceData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const syncedProvinces = await syncProvinceData();
        setProvinces(syncedProvinces);
        
        logger.info('useHomeData: Province data loaded successfully', {
          provincesCount: syncedProvinces.length,
          hasSupabaseData: supabaseProvinces && supabaseProvinces.length > 0
        });
        
      } catch (error) {
        logger.error('useHomeData: Error loading province data', error);
        setError(error instanceof Error ? error.message : 'Failed to load province data');
        
        // Set empty array on error to prevent further issues
        setProvinces([]);
      } finally {
        setLoading(false);
      }
    };

    loadProvinceData();
  }, [supabaseProvinces]);

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
  
  // Extract actual province IDs for the hook
  const actualProvinceIds = provinces.map(p => p.id);
  
  const { isProvinceVisible } = useLocationVisibility(actualProvinceIds);
  
  // Get provinces with severe or warning statuses
  const alertProvinces = provinces.filter(province => 
    province.alertLevel === AlertLevel.SEVERE || province.alertLevel === AlertLevel.WARNING
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
    loading: loading || supabaseLoading,
    error,
    refreshData
  };
};
