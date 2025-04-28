
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
}

export interface User {
  id: string;
  name: string;
  isAuthorized: boolean;
  provinceId: string;
}
