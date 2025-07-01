
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface BulkUpdateResult {
  success: boolean;
  provinceId: string;
  error?: string;
}

export interface ProvinceEmployeeUpdate {
  provinceId: string;
  employeeCount: number;
  changeReason: string;
}

// Recalculate all province totals from city data
export const recalculateProvincesTotals = async (): Promise<void> => {
  const { error } = await supabase.rpc('recalculate_all_province_totals');
  
  if (error) {
    console.error('Error recalculating province totals:', error);
    throw error;
  }
};

// This function now works by distributing province totals across cities
// It's a transitional approach - ideally users should manage city-level data directly
export const bulkUpdateEmployeeCounts = async (updates: ProvinceEmployeeUpdate[]): Promise<BulkUpdateResult[]> => {
  const results: BulkUpdateResult[] = [];
  
  for (const update of updates) {
    try {
      // For now, we'll create/update a default city entry for the province
      // This is a transitional approach to maintain compatibility
      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name')
        .eq('province_id', update.provinceId)
        .limit(1);
      
      if (citiesError) throw citiesError;
      
      if (cities && cities.length > 0) {
        // Update the first city found for this province
        const { error: locationError } = await supabase
          .from('employee_locations')
          .upsert({
            city_id: cities[0].id,
            province_id: update.provinceId,
            home_base_count: update.employeeCount,
            current_location_count: 0,
            travel_away_count: 0,
            updated_by: 'bulk_update',
            last_updated_at: new Date().toISOString()
          });
        
        if (locationError) throw locationError;
        
        results.push({ success: true, provinceId: update.provinceId });
      } else {
        throw new Error('No cities found for province');
      }
    } catch (error: any) {
      results.push({ 
        success: false, 
        provinceId: update.provinceId, 
        error: error.message 
      });
    }
  }
  
  // After all updates, trigger a recalculation to ensure consistency
  try {
    await recalculateProvincesTotals();
  } catch (error) {
    console.error('Warning: Failed to recalculate province totals after bulk update');
  }
  
  return results;
};

// Validate data consistency between city and province totals
export const validateDataConsistency = async (): Promise<{
  isConsistent: boolean;
  discrepancies: Array<{
    provinceId: string;
    provinceName: string;
    provinceTotal: number;
    cityTotal: number;
    difference: number;
  }>;
}> => {
  try {
    // Get province totals
    const { data: provinces, error: provincesError } = await supabase
      .from('provinces')
      .select('id, name, employee_count');
    
    if (provincesError) throw provincesError;
    
    // Get city totals grouped by province
    const { data: cityTotals, error: cityError } = await supabase
      .from('employee_locations')
      .select('province_id, home_base_count');
    
    if (cityError) throw cityError;
    
    // Calculate totals by province
    const cityTotalsByProvince = cityTotals?.reduce((acc, location) => {
      acc[location.province_id] = (acc[location.province_id] || 0) + location.home_base_count;
      return acc;
    }, {} as Record<string, number>) || {};
    
    const discrepancies = [];
    let isConsistent = true;
    
    for (const province of provinces || []) {
      const cityTotal = cityTotalsByProvince[province.id] || 0;
      const difference = Math.abs(province.employee_count - cityTotal);
      
      if (difference > 0) {
        isConsistent = false;
        discrepancies.push({
          provinceId: province.id,
          provinceName: province.name,
          provinceTotal: province.employee_count,
          cityTotal,
          difference
        });
      }
    }
    
    return { isConsistent, discrepancies };
  } catch (error) {
    console.error('Error validating data consistency:', error);
    throw error;
  }
};
