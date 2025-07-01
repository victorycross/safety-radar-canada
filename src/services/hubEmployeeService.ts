
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface HubEmployeeLocation {
  id: string;
  hub_id: string;
  home_base_count: number;
  current_location_count: number;
  travel_away_count: number;
  created_at: string;
  updated_at: string;
  updated_by: string;
  hub?: {
    id: string;
    name: string;
    code: string;
    country: string;
  };
}

export interface BulkHubUpdateResult {
  success: boolean;
  hubId: string;
  error?: string;
}

export interface HubEmployeeUpdate {
  hubId: string;
  employeeCount: number;
  changeReason: string;
}

// Fetch all hub employee locations
export const fetchHubEmployeeLocations = async (): Promise<HubEmployeeLocation[]> => {
  const { data, error } = await supabase
    .from('hub_employee_locations')
    .select(`
      *,
      hub:international_hubs(id, name, code, country)
    `)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching hub employee locations:', error);
    throw error;
  }

  return data || [];
};

// Update hub employee location
export const updateHubEmployeeLocation = async (
  hubId: string,
  homeBaseCount: number,
  currentLocationCount: number,
  travelAwayCount: number,
  updatedBy: string
): Promise<void> => {
  const { error } = await supabase
    .from('hub_employee_locations')
    .upsert({
      hub_id: hubId,
      home_base_count: homeBaseCount,
      current_location_count: currentLocationCount,
      travel_away_count: travelAwayCount,
      updated_by: updatedBy,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error updating hub employee location:', error);
    throw error;
  }
};

// Recalculate all hub totals from location data
export const recalculateHubTotals = async (): Promise<void> => {
  const { error } = await supabase.rpc('recalculate_all_hub_totals');
  
  if (error) {
    console.error('Error recalculating hub totals:', error);
    throw error;
  }
};

// Validate data consistency between hub and location totals
export const validateHubDataConsistency = async (): Promise<{
  isConsistent: boolean;
  discrepancies: Array<{
    hubId: string;
    hubName: string;
    hubTotal: number;
    locationTotal: number;
    difference: number;
  }>;
}> => {
  try {
    // Get hub totals
    const { data: hubs, error: hubsError } = await supabase
      .from('international_hubs')
      .select('id, name, employee_count');
    
    if (hubsError) throw hubsError;
    
    // Get location totals grouped by hub
    const { data: locationTotals, error: locationError } = await supabase
      .from('hub_employee_locations')
      .select('hub_id, home_base_count');
    
    if (locationError) throw locationError;
    
    // Calculate totals by hub
    const locationTotalsByHub = locationTotals?.reduce((acc, location) => {
      acc[location.hub_id] = (acc[location.hub_id] || 0) + location.home_base_count;
      return acc;
    }, {} as Record<string, number>) || {};
    
    const discrepancies = [];
    let isConsistent = true;
    
    for (const hub of hubs || []) {
      const locationTotal = locationTotalsByHub[hub.id] || 0;
      const difference = Math.abs(hub.employee_count - locationTotal);
      
      if (difference > 0) {
        isConsistent = false;
        discrepancies.push({
          hubId: hub.id,
          hubName: hub.name,
          hubTotal: hub.employee_count,
          locationTotal,
          difference
        });
      }
    }
    
    return { isConsistent, discrepancies };
  } catch (error) {
    console.error('Error validating hub data consistency:', error);
    throw error;
  }
};

// Bulk update hub employee counts (transitional approach)
export const bulkUpdateHubEmployeeCounts = async (updates: HubEmployeeUpdate[]): Promise<BulkHubUpdateResult[]> => {
  const results: BulkHubUpdateResult[] = [];
  
  for (const update of updates) {
    try {
      // Update hub employee location record
      await updateHubEmployeeLocation(
        update.hubId,
        update.employeeCount,
        0, // current_location_count
        0, // travel_away_count
        'bulk_update'
      );
      
      results.push({ success: true, hubId: update.hubId });
    } catch (error: any) {
      results.push({ 
        success: false, 
        hubId: update.hubId, 
        error: error.message 
      });
    }
  }
  
  // After all updates, trigger a recalculation to ensure consistency
  try {
    await recalculateHubTotals();
  } catch (error) {
    console.error('Warning: Failed to recalculate hub totals after bulk update');
  }
  
  return results;
};
