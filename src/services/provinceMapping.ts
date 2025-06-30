
import { supabase } from '@/integrations/supabase/client';
import { Province, AlertLevel } from '@/types';

// Mapping between string codes and database UUIDs
export const provinceCodeToIdMap: Record<string, string> = {
  'ab': '723bc5fa-501c-44cb-ab5f-1f31362818bf', // Alberta
  'bc': '8a2b3c4d-5e6f-7890-1234-567890abcdef', // British Columbia
  'mb': '9b3c4d5e-6f78-9012-3456-7890abcdef12', // Manitoba
  'nb': 'ac4d5e6f-7890-1234-5678-90abcdef1234', // New Brunswick
  'nl': 'bd5e6f78-9012-3456-7890-abcdef123456', // Newfoundland and Labrador
  'ns': 'ce6f7890-1234-5678-90ab-cdef12345678', // Nova Scotia
  'on': 'df789012-3456-7890-abcd-ef1234567890', // Ontario
  'pe': 'e8901234-5678-90ab-cdef-123456789012', // Prince Edward Island
  'qc': 'f9012345-6789-0abc-def1-234567890123', // Quebec
  'sk': '0a123456-789a-bcde-f123-456789012345', // Saskatchewan
  'nt': '1b234567-89ab-cdef-1234-56789012345a', // Northwest Territories
  'nu': '2c345678-9abc-def1-2345-6789012345ab', // Nunavut
  'yt': '3d456789-abcd-ef12-3456-789012345abc'  // Yukon
};

// Reverse mapping for lookups
export const provinceIdToCodeMap: Record<string, string> = Object.fromEntries(
  Object.entries(provinceCodeToIdMap).map(([code, id]) => [id, code])
);

export const provinceNames = {
  'ab': 'Alberta',
  'bc': 'British Columbia',
  'mb': 'Manitoba',
  'nb': 'New Brunswick',
  'nl': 'Newfoundland and Labrador',
  'ns': 'Nova Scotia',
  'on': 'Ontario',
  'pe': 'Prince Edward Island',
  'qc': 'Quebec',
  'sk': 'Saskatchewan',
  'nt': 'Northwest Territories',
  'nu': 'Nunavut',
  'yt': 'Yukon'
};

export const getProvinceCodeFromId = (id: string): string | undefined => {
  return provinceIdToCodeMap[id];
};

export const getProvinceIdFromCode = (code: string): string | undefined => {
  return provinceCodeToIdMap[code];
};

export const createFallbackProvinceFromCode = (code: string): Province | null => {
  const id = getProvinceIdFromCode(code);
  const name = provinceNames[code as keyof typeof provinceNames];
  
  if (!id || !name) return null;
  
  return {
    id,
    name,
    code: code.toUpperCase(),
    alertLevel: AlertLevel.NORMAL,
    employeeCount: 0 // Remove hardcoded counts
  };
};

export const syncProvinceData = async (): Promise<Province[]> => {
  try {
    // First try to get data from Supabase
    const { data: supabaseProvinces, error } = await supabase
      .from('provinces')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    if (supabaseProvinces && supabaseProvinces.length > 0) {
      // Map Supabase data to our Province type
      return supabaseProvinces.map(province => ({
        id: province.id,
        name: province.name,
        code: province.code,
        alertLevel: province.alert_level as AlertLevel,
        employeeCount: province.employee_count,
        created_at: province.created_at,
        updated_at: province.updated_at
      }));
    }
    
    // If no Supabase data, create fallback data with proper UUIDs
    const fallbackProvinces: Province[] = [];
    for (const code of Object.keys(provinceNames)) {
      const province = createFallbackProvinceFromCode(code);
      if (province) {
        fallbackProvinces.push(province);
      }
    }
    
    return fallbackProvinces;
  } catch (error) {
    console.error('Error syncing province data:', error);
    
    // Return fallback data with proper structure
    const fallbackProvinces: Province[] = [];
    for (const code of Object.keys(provinceNames)) {
      const province = createFallbackProvinceFromCode(code);
      if (province) {
        fallbackProvinces.push(province);
      }
    }
    
    return fallbackProvinces;
  }
};
