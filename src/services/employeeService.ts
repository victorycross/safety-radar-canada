
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
