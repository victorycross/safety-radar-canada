
// Standardized Data Templates and Validation Interfaces

export interface ProvinceDataTemplate {
  id?: string;
  name: string;
  code: string; // 2-letter province code (ON, QC, BC, etc.)
  alert_level: 'normal' | 'warning' | 'severe';
  employee_count: number; // Must be 0-50000
}

export interface InternationalHubDataTemplate {
  id?: string;
  name: string;
  country: string;
  code: string; // Hub identifier code
  flag_emoji?: string;
  alert_level: 'normal' | 'warning' | 'severe';
  employee_count: number; // Must be 0-1000
  coordinates?: [number, number]; // [longitude, latitude]
  is_active: boolean;
}

export interface IncidentDataTemplate {
  id?: string;
  title: string;
  description: string;
  alert_level: 'normal' | 'warning' | 'severe';
  province_id?: string; // For Canadian incidents
  source: string; // Never 'test', 'unknown', or empty
  geographic_scope?: string;
  recommended_action?: string;
  verification_status: 'unverified' | 'verified' | 'false_alarm';
  confidence_score?: number; // 0.0 to 1.0
  severity_numeric?: number; // 1-5 scale
}

export interface HubIncidentDataTemplate {
  id?: string;
  title: string;
  description?: string;
  alert_level: 'normal' | 'warning' | 'severe';
  hub_id: string;
  source: string; // Never 'test' or empty
  geographic_scope?: string;
  recommended_action?: string;
  verification_status: 'unverified' | 'verified' | 'false_alarm';
  confidence_score?: number; // 0.0 to 1.0
}

export interface SecurityAlertDataTemplate {
  id: string; // Required unique identifier
  title: string;
  summary?: string;
  location: string; // Default: 'Global'
  category: 'cybersecurity' | 'physical_security' | 'intelligence' | 'other';
  source: string; // Default: 'CSE', never 'test'
  pub_date?: string; // ISO date string
  link?: string; // URL to original alert
}

export interface WeatherAlertDataTemplate {
  id: string; // Required unique identifier
  event_type?: string; // Storm, flood, extreme temperature, etc.
  severity?: 'minor' | 'moderate' | 'severe' | 'extreme';
  description?: string;
  onset?: string; // ISO date string
  expires?: string; // ISO date string
  geometry_coordinates?: {
    type: 'Polygon' | 'Point';
    coordinates: number[][];
  };
}

export interface ImmigrationTravelDataTemplate {
  id: string; // Required unique identifier
  title: string;
  content?: string;
  summary?: string;
  location: string; // Default: 'Canada'
  source: string; // Default: 'Immigration, Refugees and Citizenship Canada'
  category?: string;
  announcement_type?: 'policy_change' | 'service_update' | 'travel_advisory' | 'other';
  pub_date?: string; // ISO date string
  link?: string; // URL to original announcement
}

export interface EmployeeLocationDataTemplate {
  id?: string;
  city_id: string;
  province_id: string;
  home_base_count: number; // >= 0
  current_location_count: number; // >= 0
  travel_away_count: number; // >= 0
  updated_by?: string; // Never 'test' or similar
}

export interface TravelRecordDataTemplate {
  id?: string;
  employee_id: string; // Never 'TEST%' or 'EMP00%'
  home_city_id: string;
  current_city_id?: string;
  travel_status: 'home' | 'traveling' | 'away';
  departure_date?: string; // ISO date string
  return_date?: string; // ISO date string
  travel_platform?: string; // Never 'test' or 'manual'
  external_booking_id?: string;
  emergency_contact_info?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface AlertSourceDataTemplate {
  id?: string;
  name: string; // Never contains 'test'
  description?: string;
  source_type: 'rss' | 'api' | 'webhook' | 'manual';
  api_endpoint: string;
  is_active: boolean;
  polling_interval: number; // Seconds, default 300
  health_status: 'unknown' | 'healthy' | 'degraded' | 'error';
  configuration?: {
    auth_type?: 'none' | 'api_key' | 'oauth';
    headers?: Record<string, string>;
    rate_limit?: number;
  };
}

// Bulk Operations Templates
export interface BulkEmployeeUpdateTemplate {
  province_code: string; // 2-letter code
  city_name: string;
  home_base_count: number;
  current_location_count?: number;
  travel_away_count?: number;
  updated_by: string;
}

export interface BulkHubUpdateTemplate {
  hub_code: string;
  country: string;
  employee_count: number;
  alert_level?: 'normal' | 'warning' | 'severe';
  is_active?: boolean;
}

// Validation and Permission Types
export interface DataPermissions {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canBulkUpdate: boolean;
  canArchive: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Template Metadata for Documentation
export interface TemplateMetadata {
  name: string;
  description: string;
  requiredFields: string[];
  optionalFields: string[];
  validationRules: Record<string, string>;
  permissions: {
    admin: DataPermissions;
    power_user: DataPermissions;
    regular_user: DataPermissions;
  };
  relatedComponents: string[];
  exampleData: any;
}
