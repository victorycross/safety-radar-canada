
export enum AlertLevel {
  NORMAL = 'normal',
  WARNING = 'warning',
  SEVERE = 'severe'
}

export enum IncidentSource {
  GOVERNMENT = 'government',
  POLICE = 'police',
  WEATHER = 'weather',
  CYBERSECURITY = 'cybersecurity',
  TRAVEL = 'travel',
  EVERBRIDGE = 'everbridge',
  BC_ALERTS = 'bc_alerts',
  MANUAL = 'manual'
}

export enum VerificationStatus {
  VERIFIED = 'verified',
  UNVERIFIED = 'unverified',
  PENDING = 'pending'
}

export interface BaseIncident {
  id: string;
  title: string;
  description: string;
  alertLevel: AlertLevel;
  source: IncidentSource;
  timestamp: string;
  provinceId: string;
  verificationStatus: VerificationStatus;
  confidenceScore?: number;
  correlationId?: string;
}

export interface Incident extends BaseIncident {
  timestamp: Date;
  recommendedAction?: string;
  rawPayload?: any;
  dataSourceId?: string;
  geographicScope?: string;
  severityNumeric?: number;
  geospatialData?: any;
  correlations?: any[];
}

export interface Province {
  id: string;
  name: string;
  code: string;
  alertLevel: AlertLevel;
  employeeCount: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  isAuthorized?: boolean;
  role?: string;
}
