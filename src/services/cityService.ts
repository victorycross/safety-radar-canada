
import { supabase } from '@/integrations/supabase/client';

export interface City {
  id: string;
  name: string;
  provinceId: string;
  code: string;
  isMajorCity: boolean;
  population: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeLocation {
  id: string;
  cityId: string;
  provinceId: string;
  homeBaseCount: number;
  currentLocationCount: number;
  travelAwayCount: number;
  lastUpdatedAt: string;
  updatedBy: string | null;
  city?: City;
}

export interface LocationHistory {
  id: string;
  cityId: string;
  homeBaseCount: number;
  currentLocationCount: number;
  travelAwayCount: number;
  previousHomeBaseCount: number | null;
  previousCurrentLocationCount: number | null;
  previousTravelAwayCount: number | null;
  changeReason: string | null;
  changeType: string;
  changedBy: string | null;
  dataSource: string | null;
  createdAt: string;
  city?: City;
}

export const fetchCities = async (): Promise<City[]> => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name');
  
  if (error) throw error;
  
  return data?.map(city => ({
    id: city.id,
    name: city.name,
    provinceId: city.province_id,
    code: city.code,
    isMajorCity: city.is_major_city,
    population: city.population,
    createdAt: city.created_at,
    updatedAt: city.updated_at
  })) || [];
};

export const fetchCitiesByProvince = async (provinceId: string): Promise<City[]> => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .eq('province_id', provinceId)
    .order('name');
  
  if (error) throw error;
  
  return data?.map(city => ({
    id: city.id,
    name: city.name,
    provinceId: city.province_id,
    code: city.code,
    isMajorCity: city.is_major_city,
    population: city.population,
    createdAt: city.created_at,
    updatedAt: city.updated_at
  })) || [];
};

export const fetchEmployeeLocations = async (): Promise<EmployeeLocation[]> => {
  const { data, error } = await supabase
    .from('employee_locations')
    .select(`
      *,
      cities!inner(
        id,
        name,
        code,
        province_id,
        is_major_city,
        population,
        created_at,
        updated_at
      )
    `)
    .order('last_updated_at', { ascending: false });
  
  if (error) throw error;
  
  return data?.map(location => ({
    id: location.id,
    cityId: location.city_id,
    provinceId: location.province_id,
    homeBaseCount: location.home_base_count,
    currentLocationCount: location.current_location_count,
    travelAwayCount: location.travel_away_count,
    lastUpdatedAt: location.last_updated_at,
    updatedBy: location.updated_by,
    city: {
      id: location.cities.id,
      name: location.cities.name,
      provinceId: location.cities.province_id,
      code: location.cities.code,
      isMajorCity: location.cities.is_major_city,
      population: location.cities.population,
      createdAt: location.cities.created_at,
      updatedAt: location.cities.updated_at
    }
  })) || [];
};

export const fetchEmployeeLocationsByProvince = async (provinceId: string): Promise<EmployeeLocation[]> => {
  const { data, error } = await supabase
    .from('employee_locations')
    .select(`
      *,
      cities!inner(
        id,
        name,
        code,
        province_id,
        is_major_city,
        population,
        created_at,
        updated_at
      )
    `)
    .eq('province_id', provinceId)
    .order('last_updated_at', { ascending: false });
  
  if (error) throw error;
  
  return data?.map(location => ({
    id: location.id,
    cityId: location.city_id,
    provinceId: location.province_id,
    homeBaseCount: location.home_base_count,
    currentLocationCount: location.current_location_count,
    travelAwayCount: location.travel_away_count,
    lastUpdatedAt: location.last_updated_at,
    updatedBy: location.updated_by,
    city: {
      id: location.cities.id,
      name: location.cities.name,
      provinceId: location.cities.province_id,
      code: location.cities.code,
      isMajorCity: location.cities.is_major_city,
      population: location.cities.population,
      createdAt: location.cities.created_at,
      updatedAt: location.cities.updated_at
    }
  })) || [];
};

export const updateEmployeeLocation = async (
  cityId: string,
  homeBaseCount: number,
  currentLocationCount: number,
  travelAwayCount: number,
  updatedBy: string = 'admin'
) => {
  const { data, error } = await supabase
    .from('employee_locations')
    .upsert({
      city_id: cityId,
      province_id: (await supabase.from('cities').select('province_id').eq('id', cityId).single()).data?.province_id,
      home_base_count: homeBaseCount,
      current_location_count: currentLocationCount,
      travel_away_count: travelAwayCount,
      updated_by: updatedBy,
      last_updated_at: new Date().toISOString()
    })
    .select();
  
  if (error) throw error;
  return data;
};

export const fetchLocationHistory = async (cityId?: string): Promise<LocationHistory[]> => {
  let query = supabase
    .from('location_history')
    .select(`
      *,
      cities!inner(
        id,
        name,
        code,
        province_id,
        is_major_city,
        population,
        created_at,
        updated_at
      )
    `)
    .order('created_at', { ascending: false });

  if (cityId) {
    query = query.eq('city_id', cityId);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  
  return data?.map(history => ({
    id: history.id,
    cityId: history.city_id,
    homeBaseCount: history.home_base_count,
    currentLocationCount: history.current_location_count,
    travelAwayCount: history.travel_away_count,
    previousHomeBaseCount: history.previous_home_base_count,
    previousCurrentLocationCount: history.previous_current_location_count,
    previousTravelAwayCount: history.previous_travel_away_count,
    changeReason: history.change_reason,
    changeType: history.change_type,
    changedBy: history.changed_by,
    dataSource: history.data_source,
    createdAt: history.created_at,
    city: {
      id: history.cities.id,
      name: history.cities.name,
      provinceId: history.cities.province_id,
      code: history.cities.code,
      isMajorCity: history.cities.is_major_city,
      population: history.cities.population,
      createdAt: history.cities.created_at,
      updatedAt: history.cities.updated_at
    }
  })) || [];
};
