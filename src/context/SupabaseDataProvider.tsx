
import React, { createContext, useContext, ReactNode } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Province } from '@/types/dashboard';
import { AlertLevel } from '@/types';
import { SupabaseProvince } from '@/types/supabase-types';

interface SupabaseDataContextType {
  provinces: Province[];
  incidents: any[];
  loading: boolean;
  error: string | null;
  refreshData: () => void;
  getProvinceById: (id: string) => Province | undefined;
  getIncidentsByProvince: (provinceId: string) => any[];
  addIncident: (incident: any) => Promise<void>;
  reportIncident: (incident: any) => Promise<void>;
  updateProvinceAlertLevel: (provinceId: string, alertLevel: AlertLevel) => Promise<void>;
  getCorrelatedIncidents: (incidentId: string) => any[];
  getIncidentsByConfidence: (minConfidence: number) => any[];
  getGeotaggedIncidents: () => any[];
  triggerDataIngestion: () => Promise<void>;
}

const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(undefined);

export const useSupabaseDataContext = () => {
  const context = useContext(SupabaseDataContext);
  if (!context) {
    throw new Error('useSupabaseDataContext must be used within a SupabaseDataProvider');
  }
  return context;
};

interface SupabaseDataProviderProps {
  children: ReactNode;
}

export const SupabaseDataProvider: React.FC<SupabaseDataProviderProps> = ({ children }) => {
  const supabaseData = useSupabaseData();
  
  // Transform Supabase provinces to match our Province interface
  const transformedProvinces: Province[] = supabaseData.provinces.map((province: any) => ({
    id: province.id,
    name: province.name,
    code: province.code,
    alertLevel: province.alertLevel || province.alert_level || AlertLevel.NORMAL,
    employeeCount: province.employeeCount || province.employee_count || 0,
    coordinates: province.coordinates,
    created_at: province.created_at,
    updated_at: province.updated_at
  }));

  const contextValue: SupabaseDataContextType = {
    ...supabaseData,
    provinces: transformedProvinces
  };

  return (
    <SupabaseDataContext.Provider value={contextValue}>
      {children}
    </SupabaseDataContext.Provider>
  );
};

export default SupabaseDataProvider;
