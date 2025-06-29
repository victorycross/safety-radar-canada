
import { supabase } from '@/integrations/supabase/client';

export interface TravelRecord {
  id: string;
  employeeId: string;
  homeCityId: string;
  currentCityId: string | null;
  travelStatus: 'home' | 'traveling' | 'at_destination' | 'returning';
  departureDate: string | null;
  returnDate: string | null;
  travelPlatform: string | null;
  externalBookingId: string | null;
  emergencyContactInfo: any;
  createdAt: string;
  updatedAt: string;
}

export interface TravelIntegrationConfig {
  id: string;
  platformName: string;
  isActive: boolean;
  apiEndpoint: string | null;
  authenticationConfig: any;
  syncFrequencyMinutes: number | null;
  lastSyncAt: string | null;
  syncStatus: 'pending' | 'success' | 'error' | 'disabled';
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export const fetchTravelRecords = async (): Promise<TravelRecord[]> => {
  const { data, error } = await supabase
    .from('travel_records')
    .select('*')
    .order('updated_at', { ascending: false });
  
  if (error) throw error;
  
  return data?.map(record => ({
    id: record.id,
    employeeId: record.employee_id,
    homeCityId: record.home_city_id,
    currentCityId: record.current_city_id,
    travelStatus: record.travel_status as TravelRecord['travelStatus'],
    departureDate: record.departure_date,
    returnDate: record.return_date,
    travelPlatform: record.travel_platform,
    externalBookingId: record.external_booking_id,
    emergencyContactInfo: record.emergency_contact_info,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  })) || [];
};

export const fetchTravelIntegrationConfigs = async (): Promise<TravelIntegrationConfig[]> => {
  const { data, error } = await supabase
    .from('travel_integration_config')
    .select('*')
    .order('platform_name');
  
  if (error) throw error;
  
  return data?.map(config => ({
    id: config.id,
    platformName: config.platform_name,
    isActive: config.is_active,
    apiEndpoint: config.api_endpoint,
    authenticationConfig: config.authentication_config,
    syncFrequencyMinutes: config.sync_frequency_minutes,
    lastSyncAt: config.last_sync_at,
    syncStatus: config.sync_status as TravelIntegrationConfig['syncStatus'],
    errorMessage: config.error_message,
    createdAt: config.created_at,
    updatedAt: config.updated_at
  })) || [];
};

export const createTravelIntegrationConfig = async (config: {
  platformName: string;
  isActive: boolean;
  apiEndpoint?: string;
  authenticationConfig?: any;
  syncFrequencyMinutes?: number;
}) => {
  const { data, error } = await supabase
    .from('travel_integration_config')
    .insert({
      platform_name: config.platformName,
      is_active: config.isActive,
      api_endpoint: config.apiEndpoint,
      authentication_config: config.authenticationConfig,
      sync_frequency_minutes: config.syncFrequencyMinutes
    })
    .select();
  
  if (error) throw error;
  return data;
};

export const updateTravelIntegrationConfig = async (
  id: string,
  updates: Partial<{
    isActive: boolean;
    apiEndpoint: string;
    authenticationConfig: any;
    syncFrequencyMinutes: number;
    syncStatus: TravelIntegrationConfig['syncStatus'];
    errorMessage: string;
  }>
) => {
  const { data, error } = await supabase
    .from('travel_integration_config')
    .update({
      is_active: updates.isActive,
      api_endpoint: updates.apiEndpoint,
      authentication_config: updates.authenticationConfig,
      sync_frequency_minutes: updates.syncFrequencyMinutes,
      sync_status: updates.syncStatus,
      error_message: updates.errorMessage,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data;
};
