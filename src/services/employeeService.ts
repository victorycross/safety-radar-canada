
import { supabase } from '@/integrations/supabase/client';

export interface EmployeeHistoryEntry {
  id: string;
  provinceId: string;
  employeeCount: number;
  previousCount: number | null;
  changeReason: string | null;
  changedBy: string | null;
  createdAt: string;
}

export interface EmployeeUpdateData {
  provinceId: string;
  employeeCount: number;
  changeReason?: string;
}

export const updateEmployeeCount = async (data: EmployeeUpdateData) => {
  const { data: result, error } = await supabase
    .from('provinces')
    .update({ 
      employee_count: data.employeeCount,
      updated_at: new Date().toISOString()
    })
    .eq('id', data.provinceId)
    .select();
  
  if (error) throw error;
  return result;
};

export const fetchEmployeeHistory = async (provinceId?: string): Promise<EmployeeHistoryEntry[]> => {
  let query = supabase
    .from('employee_history')
    .select(`
      id,
      province_id,
      employee_count,
      previous_count,
      change_reason,
      changed_by,
      created_at,
      provinces!inner(name, code)
    `)
    .order('created_at', { ascending: false });

  if (provinceId) {
    query = query.eq('province_id', provinceId);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  
  return data?.map(entry => ({
    id: entry.id,
    provinceId: entry.province_id,
    employeeCount: entry.employee_count,
    previousCount: entry.previous_count,
    changeReason: entry.change_reason,
    changedBy: entry.changed_by,
    createdAt: entry.created_at
  })) || [];
};

export const bulkUpdateEmployeeCounts = async (updates: EmployeeUpdateData[]) => {
  const results = [];
  
  for (const update of updates) {
    try {
      const result = await updateEmployeeCount(update);
      results.push({ success: true, provinceId: update.provinceId, result });
    } catch (error) {
      results.push({ success: false, provinceId: update.provinceId, error });
    }
  }
  
  return results;
};
