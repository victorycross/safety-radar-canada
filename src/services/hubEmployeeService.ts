
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

// Fetch all hub employee locations with deduplication
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

  // Ensure we only have one record per hub (should be enforced by DB constraint now)
  const uniqueLocations = new Map();
  (data || []).forEach(location => {
    if (!uniqueLocations.has(location.hub_id)) {
      uniqueLocations.set(location.hub_id, location);
    }
  });

  return Array.from(uniqueLocations.values());
};

// Update hub employee location
export const updateHubEmployeeLocation = async (
  hubId: string,
  homeBaseCount: number,
  currentLocationCount: number,
  travelAwayCount: number,
  updatedBy: string
): Promise<void> => {
  try {
    // Pre-validate that the hub exists
    const { data: hubExists, error: hubError } = await supabase
      .from('international_hubs')
      .select('id')
      .eq('id', hubId)
      .single();

    if (hubError || !hubExists) {
      throw new Error(`Hub with ID ${hubId} not found`);
    }

    const { error } = await supabase
      .from('hub_employee_locations')
      .upsert({
        hub_id: hubId,
        home_base_count: homeBaseCount,
        current_location_count: currentLocationCount,
        travel_away_count: travelAwayCount,
        updated_by: updatedBy,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'hub_id'
      });

    if (error) {
      console.error('Error updating hub employee location:', error);
      // Provide more user-friendly error messages
      if (error.code === '23505') {
        throw new Error('Unable to update hub employee location due to a data conflict. Please try again.');
      }
      throw new Error(`Failed to update hub employee location: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Hub employee location update failed:', error);
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

// Validate data consistency using the new database function
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
    const { data, error } = await supabase.rpc('validate_all_hub_data_consistency');
    
    if (error) throw error;
    
    const discrepancies = [];
    let isConsistent = true;
    
    for (const record of data || []) {
      if (record.consistency_status !== 'consistent') {
        isConsistent = false;
        discrepancies.push({
          hubId: '', // We don't have hub ID in the response, but we have the name
          hubName: record.hub_name,
          hubTotal: record.hub_total,
          locationTotal: record.location_total,
          difference: Math.abs(record.hub_total - record.location_total)
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
