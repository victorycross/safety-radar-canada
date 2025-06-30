
import { supabase } from '@/integrations/supabase/client';
import { Province, AlertLevel } from '@/types';
import { logger } from '@/utils/logger';

// Province names mapping - this remains static
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

// Dynamic mapping objects - will be populated from database
export let provinceCodeToIdMap: Record<string, string> = {};
export let provinceIdToCodeMap: Record<string, string> = {};

// Function to build mappings from database data
export const buildProvinceMappings = (provinces: Province[]) => {
  const codeToId: Record<string, string> = {};
  const idToCode: Record<string, string> = {};
  
  provinces.forEach(province => {
    const code = province.code.toLowerCase();
    codeToId[code] = province.id;
    idToCode[province.id] = code;
  });
  
  provinceCodeToIdMap = codeToId;
  provinceIdToCodeMap = idToCode;
  
  logger.debug('Province mappings built:', { codeToId, idToCode });
};

export const getProvinceCodeFromId = (id: string): string | undefined => {
  return provinceIdToCodeMap[id];
};

export const getProvinceIdFromCode = (code: string): string | undefined => {
  return provinceCodeToIdMap[code.toLowerCase()];
};

export const createFallbackProvinceFromCode = (code: string): Province | null => {
  const name = provinceNames[code.toLowerCase() as keyof typeof provinceNames];
  
  if (!name) {
    logger.warn('Unknown province code:', code);
    return null;
  }
  
  // Generate a consistent UUID for fallback (this should rarely be used)
  const fallbackId = `fallback-${code.toLowerCase()}`;
  
  return {
    id: fallbackId,
    name,
    code: code.toUpperCase(),
    alertLevel: AlertLevel.NORMAL,
    employeeCount: 0
  };
};

export const validateProvinceMappings = (provinces: Province[]): boolean => {
  const issues: string[] = [];
  
  // Check if all expected provinces are present
  const expectedCodes = Object.keys(provinceNames);
  const actualCodes = provinces.map(p => p.code.toLowerCase());
  
  const missingCodes = expectedCodes.filter(code => !actualCodes.includes(code));
  const extraCodes = actualCodes.filter(code => !expectedCodes.includes(code));
  
  if (missingCodes.length > 0) {
    issues.push(`Missing provinces: ${missingCodes.join(', ')}`);
  }
  
  if (extraCodes.length > 0) {
    issues.push(`Unexpected provinces: ${extraCodes.join(', ')}`);
  }
  
  // Check for duplicate codes
  const duplicateCodes = actualCodes.filter((code, index) => actualCodes.indexOf(code) !== index);
  if (duplicateCodes.length > 0) {
    issues.push(`Duplicate province codes: ${duplicateCodes.join(', ')}`);
  }
  
  if (issues.length > 0) {
    logger.warn('Province mapping validation issues:', issues);
    return false;
  }
  
  logger.info('Province mappings validated successfully');
  return true;
};

export const syncProvinceData = async (): Promise<Province[]> => {
  try {
    logger.debug('Starting province data sync');
    
    // First try to get data from Supabase
    const { data: supabaseProvinces, error } = await supabase
      .from('provinces')
      .select('*')
      .order('name');
    
    if (error) {
      logger.error('Error fetching provinces from Supabase:', error);
      throw error;
    }
    
    if (supabaseProvinces && supabaseProvinces.length > 0) {
      // Map Supabase data to our Province type
      const provinces: Province[] = supabaseProvinces.map(province => ({
        id: province.id,
        name: province.name,
        code: province.code,
        alertLevel: province.alert_level as AlertLevel,
        employeeCount: province.employee_count || 0,
        created_at: province.created_at,
        updated_at: province.updated_at
      }));
      
      // Build dynamic mappings from actual database data
      buildProvinceMappings(provinces);
      
      // Validate the mappings
      validateProvinceMappings(provinces);
      
      logger.info('Province data synced from database:', {
        count: provinces.length,
        provinces: provinces.map(p => ({ id: p.id, name: p.name, code: p.code }))
      });
      
      return provinces;
    }
    
    // If no database data, create fallback data
    logger.warn('No provinces found in database, creating fallback data');
    const fallbackProvinces: Province[] = [];
    
    for (const code of Object.keys(provinceNames)) {
      const province = createFallbackProvinceFromCode(code);
      if (province) {
        fallbackProvinces.push(province);
      }
    }
    
    if (fallbackProvinces.length > 0) {
      buildProvinceMappings(fallbackProvinces);
    }
    
    return fallbackProvinces;
    
  } catch (error) {
    logger.error('Error syncing province data:', error);
    
    // Return fallback data with proper structure
    const fallbackProvinces: Province[] = [];
    for (const code of Object.keys(provinceNames)) {
      const province = createFallbackProvinceFromCode(code);
      if (province) {
        fallbackProvinces.push(province);
      }
    }
    
    if (fallbackProvinces.length > 0) {
      buildProvinceMappings(fallbackProvinces);
    }
    
    return fallbackProvinces;
  }
};
