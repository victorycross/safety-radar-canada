
import React, { createContext, useContext } from 'react';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Incident, Province } from '@/types';
import { logger } from '@/utils/logger';

interface SupabaseDataContextType {
  provinces: Province[];
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getProvinceById: (id: string) => Province | undefined;
  getIncidentsByProvince: (provinceId: string) => Incident[];
  addIncident: (incident: Omit<Incident, 'id' | 'timestamp'>) => Promise<void>;
  reportIncident: (incident: Omit<Incident, 'id' | 'timestamp'>) => Promise<void>;
  updateProvinceAlertLevel: (provinceId: string, alertLevel: any) => Promise<void>;
  getCorrelatedIncidents: (incidentId: string) => Incident[];
  getIncidentsByConfidence: (minConfidence: number) => Incident[];
  getGeotaggedIncidents: () => Incident[];
  triggerDataIngestion: () => Promise<void>;
}

const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(undefined);

export const useSupabaseDataContext = () => {
  const context = useContext(SupabaseDataContext);
  if (context === undefined) {
    throw new Error('useSupabaseDataContext must be used within a SupabaseDataProvider');
  }
  return context;
};

export const SupabaseDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  logger.debug('SupabaseDataProvider: Initializing');
  
  const supabaseData = useSupabaseData();
  
  logger.debug('SupabaseDataProvider: Data state', {
    provincesCount: supabaseData.provinces?.length || 0,
    incidentsCount: supabaseData.incidents?.length || 0,
    loading: supabaseData.loading,
    hasError: !!supabaseData.error
  });

  return (
    <SupabaseDataContext.Provider value={supabaseData}>
      {children}
    </SupabaseDataContext.Provider>
  );
};
