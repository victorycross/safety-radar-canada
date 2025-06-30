
import { AlertLevel } from './index';

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

export interface InternationalHub {
  id: string;
  name: string;
  country: string;
  code: string;
  flagEmoji?: string;
  alertLevel: AlertLevel;
  employeeCount: number;
  travelWarnings: number;
  localIncidents: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface HubIncident {
  id: string;
  hubId: string;
  title: string;
  description?: string;
  alertLevel: AlertLevel;
  source: string;
  verificationStatus: 'verified' | 'unverified' | 'pending';
  confidenceScore: number;
  timestamp: string;
  recommendedAction?: string;
  geographicScope?: string;
  rawPayload?: any;
  created_at?: string;
  updated_at?: string;
}

export interface HubEmployeeLocation {
  id: string;
  hubId: string;
  homeBaseCount: number;
  currentLocationCount: number;
  travelAwayCount: number;
  updatedBy: string;
  updated_at?: string;
  created_at?: string;
}

export interface DashboardMetrics {
  totalProvinces: number;
  visibleProvincesCount: number;
  alertProvincesCount: number;
  incidentsCount: number;
  employeesCount: number;
  totalHubs?: number;
  alertHubsCount?: number;
  hubEmployeesCount?: number;
}

export interface DashboardData {
  provinces: Province[];
  internationalHubs: InternationalHub[];
  alertProvinces: Province[];
  visibleAlertProvinces: Province[];
  alertHubs?: InternationalHub[];
  metrics: DashboardMetrics;
  loading: boolean;
  error?: string | null;
  refreshData: () => void;
}
