import { supabase } from '@/integrations/supabase/client';

export interface EnhancedTravelRecord {
  id: string;
  employeeId: string;
  homeCityId: string;
  currentCityId: string | null;
  travelStatus: 'home' | 'traveling' | 'at_destination' | 'returning';
  locationStatus: 'at_home' | 'in_transit' | 'at_destination' | 'returning';
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approvedBy: string | null;
  approvedAt: string | null;
  riskLevel: 'low' | 'medium' | 'high';
  departureDate: string | null;
  returnDate: string | null;
  travelPlatform: string | null;
  externalBookingId: string | null;
  emergencyContactInfo: any;
  complianceNotes: string | null;
  lastLocationUpdate: string;
  createdAt: string;
  updatedAt: string;
}

export interface TravelBooking {
  id: string;
  travelRecordId: string;
  bookingPlatform: string;
  externalBookingRef: string | null;
  bookingType: 'flight' | 'hotel' | 'car' | 'train' | 'other';
  departureLocation: string | null;
  arrivalLocation: string | null;
  departureTime: string | null;
  arrivalTime: string | null;
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  costAmount: number | null;
  costCurrency: string;
  bookingDetails: any;
  createdAt: string;
  updatedAt: string;
}

export interface LocationTransition {
  id: string;
  employeeId: string;
  travelRecordId: string | null;
  fromLocationType: 'hub' | 'city' | 'province';
  fromLocationId: string;
  toLocationType: 'hub' | 'city' | 'province';
  toLocationId: string;
  transitionType: 'travel_start' | 'travel_end' | 'location_change' | 'manual_update';
  transitionStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  scheduledTime: string | null;
  actualTime: string | null;
  initiatedBy: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TravelPolicy {
  id: string;
  policyName: string;
  policyType: 'approval' | 'restriction' | 'requirement' | 'guideline';
  applicableLocations: string[];
  applicableRoles: string[];
  policyRules: any;
  isActive: boolean;
  enforcementLevel: 'info' | 'warning' | 'blocking';
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TravelComplianceResult {
  isCompliant: boolean;
  policyViolations: any[];
  recommendations: any[];
}

// Enhanced Travel Records
export const fetchEnhancedTravelRecords = async (): Promise<EnhancedTravelRecord[]> => {
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
    travelStatus: record.travel_status as EnhancedTravelRecord['travelStatus'],
    locationStatus: (record.location_status || 'at_home') as EnhancedTravelRecord['locationStatus'],
    approvalStatus: (record.approval_status || 'pending') as EnhancedTravelRecord['approvalStatus'],
    approvedBy: record.approved_by,
    approvedAt: record.approved_at,
    riskLevel: (record.risk_level || 'low') as EnhancedTravelRecord['riskLevel'],
    departureDate: record.departure_date,
    returnDate: record.return_date,
    travelPlatform: record.travel_platform,
    externalBookingId: record.external_booking_id,
    emergencyContactInfo: record.emergency_contact_info,
    complianceNotes: record.compliance_notes,
    lastLocationUpdate: record.last_location_update || record.updated_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at
  })) || [];
};

export const createTravelRecord = async (record: {
  employeeId: string;
  homeCityId: string;
  currentCityId?: string;
  departureDate?: string;
  returnDate?: string;
  emergencyContactInfo?: any;
  riskLevel?: 'low' | 'medium' | 'high';
  complianceNotes?: string;
}) => {
  const { data, error } = await supabase
    .from('travel_records')
    .insert({
      employee_id: record.employeeId,
      home_city_id: record.homeCityId,
      current_city_id: record.currentCityId,
      departure_date: record.departureDate,
      return_date: record.returnDate,
      emergency_contact_info: record.emergencyContactInfo,
      risk_level: record.riskLevel || 'low',
      compliance_notes: record.complianceNotes,
      travel_status: 'home',
      location_status: 'at_home',
      approval_status: 'pending'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateTravelStatus = async (
  travelRecordId: string,
  updates: {
    travelStatus?: 'home' | 'traveling' | 'at_destination' | 'returning';
    locationStatus?: 'at_home' | 'in_transit' | 'at_destination' | 'returning';
    currentCityId?: string;
    approvalStatus?: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approvedBy?: string;
    riskLevel?: 'low' | 'medium' | 'high';
    complianceNotes?: string;
  }
) => {
  const updateData: any = {};
  
  if (updates.travelStatus) updateData.travel_status = updates.travelStatus;
  if (updates.locationStatus) updateData.location_status = updates.locationStatus;
  if (updates.currentCityId) updateData.current_city_id = updates.currentCityId;
  if (updates.approvalStatus) updateData.approval_status = updates.approvalStatus;
  if (updates.approvedBy) {
    updateData.approved_by = updates.approvedBy;
    updateData.approved_at = new Date().toISOString();
  }
  if (updates.riskLevel) updateData.risk_level = updates.riskLevel;
  if (updates.complianceNotes) updateData.compliance_notes = updates.complianceNotes;
  
  updateData.last_location_update = new Date().toISOString();
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('travel_records')
    .update(updateData)
    .eq('id', travelRecordId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Travel Bookings
export const fetchTravelBookings = async (travelRecordId?: string): Promise<TravelBooking[]> => {
  let query = supabase.from('travel_bookings').select('*');
  
  if (travelRecordId) {
    query = query.eq('travel_record_id', travelRecordId);
  }
  
  const { data, error } = await query.order('departure_time', { ascending: true });
  
  if (error) throw error;
  
  return data?.map(booking => ({
    id: booking.id,
    travelRecordId: booking.travel_record_id,
    bookingPlatform: booking.booking_platform,
    externalBookingRef: booking.external_booking_ref,
    bookingType: booking.booking_type as TravelBooking['bookingType'],
    departureLocation: booking.departure_location,
    arrivalLocation: booking.arrival_location,
    departureTime: booking.departure_time,
    arrivalTime: booking.arrival_time,
    bookingStatus: booking.booking_status as TravelBooking['bookingStatus'],
    costAmount: booking.cost_amount,
    costCurrency: booking.cost_currency || 'CAD',
    bookingDetails: booking.booking_details,
    createdAt: booking.created_at,
    updatedAt: booking.updated_at
  })) || [];
};

export const createTravelBooking = async (booking: {
  travelRecordId: string;
  bookingPlatform: string;
  externalBookingRef?: string;
  bookingType: 'flight' | 'hotel' | 'car' | 'train' | 'other';
  departureLocation?: string;
  arrivalLocation?: string;
  departureTime?: string;
  arrivalTime?: string;
  costAmount?: number;
  costCurrency?: string;
  bookingDetails?: any;
}) => {
  const { data, error } = await supabase
    .from('travel_bookings')
    .insert({
      travel_record_id: booking.travelRecordId,
      booking_platform: booking.bookingPlatform,
      external_booking_ref: booking.externalBookingRef,
      booking_type: booking.bookingType,
      departure_location: booking.departureLocation,
      arrival_location: booking.arrivalLocation,
      departure_time: booking.departureTime,
      arrival_time: booking.arrivalTime,
      cost_amount: booking.costAmount,
      cost_currency: booking.costCurrency || 'CAD',
      booking_details: booking.bookingDetails
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// Location Transitions
export const fetchLocationTransitions = async (employeeId?: string): Promise<LocationTransition[]> => {
  let query = supabase.from('location_transitions').select('*');
  
  if (employeeId) {
    query = query.eq('employee_id', employeeId);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return data?.map(transition => ({
    id: transition.id,
    employeeId: transition.employee_id,
    travelRecordId: transition.travel_record_id,
    fromLocationType: transition.from_location_type as LocationTransition['fromLocationType'],
    fromLocationId: transition.from_location_id,
    toLocationType: transition.to_location_type as LocationTransition['toLocationType'],
    toLocationId: transition.to_location_id,
    transitionType: transition.transition_type as LocationTransition['transitionType'],
    transitionStatus: transition.transition_status as LocationTransition['transitionStatus'],
    scheduledTime: transition.scheduled_time,
    actualTime: transition.actual_time,
    initiatedBy: transition.initiated_by,
    notes: transition.notes,
    createdAt: transition.created_at,
    updatedAt: transition.updated_at
  })) || [];
};

// Travel Policies
export const fetchTravelPolicies = async (): Promise<TravelPolicy[]> => {
  const { data, error } = await supabase
    .from('travel_policies')
    .select('*')
    .eq('is_active', true)
    .order('policy_name');
  
  if (error) throw error;
  
  return data?.map(policy => ({
    id: policy.id,
    policyName: policy.policy_name,
    policyType: policy.policy_type as TravelPolicy['policyType'],
    applicableLocations: policy.applicable_locations || [],
    applicableRoles: policy.applicable_roles || [],
    policyRules: policy.policy_rules,
    isActive: policy.is_active,
    enforcementLevel: policy.enforcement_level as TravelPolicy['enforcementLevel'],
    createdBy: policy.created_by,
    createdAt: policy.created_at,
    updatedAt: policy.updated_at
  })) || [];
};

export const validateTravelCompliance = async (
  employeeId: string,
  destinationCityId: string,
  travelStartDate: string
): Promise<TravelComplianceResult> => {
  const { data, error } = await supabase.rpc('validate_travel_compliance', {
    employee_id: employeeId,
    destination_city_id: destinationCityId,
    travel_start_date: travelStartDate
  });
  
  if (error) throw error;
  
  const result = data?.[0];
  return {
    isCompliant: result?.is_compliant || false,
    policyViolations: Array.isArray(result?.policy_violations) ? result.policy_violations : [],
    recommendations: Array.isArray(result?.recommendations) ? result.recommendations : []
  };
};

// Bulk Travel Operations
export const bulkUpdateTravelStatus = async (
  travelRecordIds: string[],
  updates: {
    travelStatus?: 'home' | 'traveling' | 'at_destination' | 'returning';
    locationStatus?: 'at_home' | 'in_transit' | 'at_destination' | 'returning';
    approvalStatus?: 'pending' | 'approved' | 'rejected' | 'cancelled';
    riskLevel?: 'low' | 'medium' | 'high';
  }
) => {
  const updateData: any = {
    last_location_update: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  if (updates.travelStatus) updateData.travel_status = updates.travelStatus;
  if (updates.locationStatus) updateData.location_status = updates.locationStatus;
  if (updates.approvalStatus) updateData.approval_status = updates.approvalStatus;
  if (updates.riskLevel) updateData.risk_level = updates.riskLevel;

  const { data, error } = await supabase
    .from('travel_records')
    .update(updateData)
    .in('id', travelRecordIds)
    .select();
  
  if (error) throw error;
  return data;
};