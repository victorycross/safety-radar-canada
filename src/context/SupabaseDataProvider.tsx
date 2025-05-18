
import React, { createContext, useContext, ReactNode } from 'react';
import { AlertLevel, Incident } from '@/types';
import { useSupabaseData } from '@/hooks/useSupabaseData';

// The shape of our context
interface SupabaseDataContextType {
  provinces: ReturnType<typeof useSupabaseData>["provinces"];
  incidents: ReturnType<typeof useSupabaseData>["incidents"];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getProvinceById: (provinceId: string) => ReturnType<typeof useSupabaseData>["getProvinceById"] extends (id: string) => infer R ? R : never;
  getIncidentsByProvince: (provinceId: string) => Incident[];
  addIncident: ReturnType<typeof useSupabaseData>["addIncident"];
  reportIncident: ReturnType<typeof useSupabaseData>["reportIncident"];
  updateProvinceAlertLevel: ReturnType<typeof useSupabaseData>["updateProvinceAlertLevel"];
}

const SupabaseDataContext = createContext<SupabaseDataContextType | undefined>(undefined);

export function SupabaseDataProvider({ children }: { children: ReactNode }) {
  const supabaseData = useSupabaseData();
  
  return (
    <SupabaseDataContext.Provider value={{
      provinces: supabaseData.provinces,
      incidents: supabaseData.incidents,
      loading: supabaseData.loading,
      error: supabaseData.error,
      refreshData: supabaseData.refreshData,
      getProvinceById: supabaseData.getProvinceById,
      getIncidentsByProvince: supabaseData.getIncidentsByProvince,
      addIncident: supabaseData.addIncident,
      reportIncident: supabaseData.reportIncident,
      updateProvinceAlertLevel: supabaseData.updateProvinceAlertLevel
    }}>
      {children}
    </SupabaseDataContext.Provider>
  );
}

export function useSupabaseDataContext() {
  const context = useContext(SupabaseDataContext);
  if (context === undefined) {
    throw new Error('useSupabaseDataContext must be used within a SupabaseDataProvider');
  }
  return context;
}
