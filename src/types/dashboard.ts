
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
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface DashboardMetrics {
  totalProvinces: number;
  visibleProvincesCount: number;
  alertProvincesCount: number;
  incidentsCount: number;
  employeesCount: number;
}

export interface DashboardData {
  provinces: Province[];
  internationalHubs: InternationalHub[];
  alertProvinces: Province[];
  visibleAlertProvinces: Province[];
  metrics: DashboardMetrics;
  loading: boolean;
  error?: string | null;
  refreshData: () => void;
}
