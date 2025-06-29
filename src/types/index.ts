
export enum AlertLevel {
  NORMAL = "normal",
  WARNING = "warning",
  SEVERE = "severe"
}

export enum IncidentSource {
  POLICE = "Police",
  GLOBAL_SECURITY = "Global Security",
  US_SOC = "US Security Operations Centre",
  EVERBRIDGE = "Everbridge",
  EMPLOYEE = "Employee Report",
  NEWS = "News Source",
  CROWDSOURCED = "Crowdsourced"
}

export enum VerificationStatus {
  VERIFIED = "Verified",
  UNVERIFIED = "Unverified"
}

export interface Province {
  id: string;
  name: string;
  code: string;
  alertLevel: AlertLevel;
  employeeCount: number;
  incidents: Incident[];
}

export interface GeospatialData {
  id: string;
  incident_id: string;
  latitude: number | null;
  longitude: number | null;
  geohash: string | null;
  affected_radius_km: number | null;
  population_impact: number | null;
  administrative_area: string | null;
  country_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface AlertCorrelation {
  related_incident_id: string;
  correlation_type: string;
  confidence_score: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  provinceId: string;
  timestamp: Date;
  alertLevel: AlertLevel;
  source: IncidentSource;
  verificationStatus: VerificationStatus;
  recommendedAction?: string;
  // Enhanced fields from new schema
  confidenceScore?: number;
  correlationId?: string;
  rawPayload?: any;
  dataSourceId?: string;
  geographicScope?: string;
  severityNumeric?: number;
  geospatialData?: GeospatialData;
  correlations?: AlertCorrelation[];
}

export interface User {
  id: string;
  name: string;
  isAuthorized: boolean;
  provinceId: string;
}
