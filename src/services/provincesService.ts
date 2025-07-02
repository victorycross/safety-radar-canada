
import { supabase } from '@/integrations/supabase/client';
import { Province, AlertLevel } from '@/types';
import { logger } from '@/utils/logger';

export const fetchProvinces = async (): Promise<Province[]> => {
  const { data, error } = await supabase
    .from('provinces')
    .select('*')
    .order('name');
  
  if (error) throw error;
  
  if (data) {
    const mappedProvinces: Province[] = data.map(province => ({
      id: province.id,
      name: province.name,
      code: province.code,
      alertLevel: province.alert_level as AlertLevel,
      employeeCount: province.employee_count,
      incidents: [] // Will be populated separately
    }));
    
    return mappedProvinces;
  }
  
  return [];
};

export const updateProvinceAlertLevel = async (provinceId: string, alertLevel: AlertLevel) => {
  const { data, error } = await supabase
    .from('provinces')
    .update({ alert_level: alertLevel })
    .eq('id', provinceId)
    .select();
  
  if (error) throw error;
  return data;
};

// New function to sync province alert levels and validate data consistency
export const syncProvinceAlertLevels = async (): Promise<void> => {
  try {
    logger.debug('Synchronizing all province alert levels');
    
    const { error } = await supabase.rpc('sync_all_province_alert_levels');
    
    if (error) {
      logger.error('Error synchronizing province alert levels:', error);
      throw error;
    }
    
    logger.info('Province alert levels synchronized successfully');
  } catch (error) {
    logger.error('Error in syncProvinceAlertLevels:', error);
    throw error;
  }
};

// Validate data consistency between province records and incident counts
export const validateProvinceDataConsistency = async (): Promise<{
  isConsistent: boolean;
  discrepancies: Array<{
    provinceId: string;
    provinceName: string;
    provinceAlertLevel: AlertLevel;
    actualAlertLevel: AlertLevel;
    activeIncidentCount: number;
  }>;
}> => {
  try {
    logger.debug('Validating province data consistency');
    
    // Get province data
    const provinces = await fetchProvinces();
    
    // Get active incidents grouped by province
    const { data: incidentData, error } = await supabase
      .from('incidents')
      .select('province_id, alert_level')
      .is('archived_at', null);
    
    if (error) {
      logger.error('Error fetching incidents for validation:', error);
      throw error;
    }
    
    // Calculate actual alert levels per province
    const provinceIncidentCounts = incidentData?.reduce((acc, incident) => {
      if (!acc[incident.province_id]) {
        acc[incident.province_id] = {
          total: 0,
          severe: 0,
          warning: 0,
          normal: 0
        };
      }
      acc[incident.province_id].total++;
      acc[incident.province_id][incident.alert_level as AlertLevel]++;
      return acc;
    }, {} as Record<string, { total: number; severe: number; warning: number; normal: number }>) || {};
    
    const discrepancies = [];
    let isConsistent = true;
    
    for (const province of provinces) {
      const counts = provinceIncidentCounts[province.id] || { total: 0, severe: 0, warning: 0, normal: 0 };
      
      // Calculate what the alert level should be based on active incidents
      let expectedAlertLevel: AlertLevel = AlertLevel.NORMAL;
      if (counts.severe > 0) {
        expectedAlertLevel = AlertLevel.SEVERE;
      } else if (counts.warning > 0) {
        expectedAlertLevel = AlertLevel.WARNING;
      }
      
      if (province.alertLevel !== expectedAlertLevel) {
        isConsistent = false;
        discrepancies.push({
          provinceId: province.id,
          provinceName: province.name,
          provinceAlertLevel: province.alertLevel,
          actualAlertLevel: expectedAlertLevel,
          activeIncidentCount: counts.total
        });
        
        logger.warn('Province data inconsistency detected', {
          provinceId: province.id,
          provinceName: province.name,
          recordedAlertLevel: province.alertLevel,
          expectedAlertLevel,
          activeIncidents: counts.total
        });
      }
    }
    
    logger.info('Province data consistency validation completed', {
      isConsistent,
      discrepanciesFound: discrepancies.length
    });
    
    return { isConsistent, discrepancies };
  } catch (error) {
    logger.error('Error validating province data consistency:', error);
    throw error;
  }
};
