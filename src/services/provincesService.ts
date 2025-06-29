
import { supabase } from '@/integrations/supabase/client';
import { Province, AlertLevel } from '@/types';

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
