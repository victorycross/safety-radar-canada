
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

export interface BaseIncident {
  id: string;
  title: string;
  description: string;
  alertLevel: AlertLevel;
  source: IncidentSource;
  timestamp: string;
  provinceId: string;
  verificationStatus: 'verified' | 'unverified' | 'pending';
  confidenceScore?: number;
  correlationId?: string;
}
