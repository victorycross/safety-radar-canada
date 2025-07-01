
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { useLocationVisibility } from '@/hooks/useLocationVisibility';
import { useHubData } from '@/hooks/useHubData';
import { Province, InternationalHub, DashboardData } from '@/types/dashboard';
import { AlertLevel } from '@/types';
import { logger } from '@/utils/logger';
import { syncProvinceData } from '@/services/provinceMapping';
import { useEffect, useState } from 'react';

export const useHomeData = (): DashboardData => {
  const { provinces: supabaseProvinces, incidents, loading: supabaseLoading, refreshData: refreshSupabaseData } = useSupabaseDataContext();
  const { hubs: internationalHubs, alertHubs, loading: hubsLoading, refreshData: refreshHubData } = useHubData();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  logger.debug('useHomeData: Hook called', {
    supabaseProvincesCount: supabaseProvinces?.length || 0,
    incidentsCount: incidents?.length || 0,
    hubsCount: internationalHubs?.length || 0,
    supabaseLoading,
    hubsLoading
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

  // Listen for employee data updates
  useEffect(() => {
    const handleEmployeeDataUpdate = () => {
      // Refresh both Supabase data and province data
      refreshSupabaseData();
    };

    window.addEventListener('employeeDataUpdated', handleEmployeeDataUpdate);
    
    return () => {
      window.removeEventListener('employeeDataUpdated', handleEmployeeDataUpdate);
    };
  }, [refreshSupabaseData]);

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

  // Enhanced metrics including hub data
  const metrics: DashboardData['metrics'] = {
    totalProvinces: provinces.length,
    visibleProvincesCount,
    alertProvincesCount: alertProvinces.length,
    incidentsCount: recentIncidentsCount,
    employeesCount: provinces.reduce((sum, p) => sum + p.employeeCount, 0),
    totalHubs: internationalHubs.length,
    alertHubsCount: alertHubs.length,
    hubEmployeesCount: internationalHubs.reduce((sum, hub) => sum + hub.employeeCount, 0)
  };

  // Combined refresh function
  const refreshData = async () => {
    await Promise.all([
      refreshSupabaseData(),
      refreshHubData()
    ]);
  };

  return {
    provinces,
    internationalHubs,
    alertProvinces,
    visibleAlertProvinces,
    alertHubs,
    metrics,
    loading: loading || supabaseLoading || hubsLoading,
    error,
    refreshData
  };
};
