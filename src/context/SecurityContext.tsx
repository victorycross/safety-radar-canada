import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertLevel, Incident, IncidentSource, Province, VerificationStatus, User } from '@/types';
import { incidentsData, provincesData } from '@/data/mockData';
import { toast } from '@/components/ui/use-toast';

interface SecurityContextType {
  provinces: Province[];
  incidents: Incident[];
  user: User | null;
  addIncident: (incident: Omit<Incident, 'id' | 'timestamp'>) => void;
  reportIncident: (incident: Omit<Incident, 'id' | 'timestamp'>) => void;
  updateProvinceAlertLevel: (provinceId: string, alertLevel: AlertLevel) => void;
  getProvinceById: (provinceId: string) => Province | undefined;
  getIncidentsByProvince: (provinceId: string) => Incident[];
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [provinces, setProvinces] = useState<Province[]>(provincesData);
  const [incidents, setIncidents] = useState<Incident[]>(incidentsData);
  const [user] = useState<User | null>({
    id: 'user-1',
    full_name: 'Demo User',
    isAuthorized: true,
  });

  const addIncident = (incidentData: Omit<Incident, 'id' | 'timestamp'>) => {
    const newIncident: Incident = {
      ...incidentData,
      id: `incident-${Date.now()}`,
      timestamp: new Date(),
    };

    setIncidents(prev => [...prev, newIncident]);
    updateProvinceAlertLevelBasedOnIncidents(incidentData.provinceId);
    toast({
      title: "Incident Added",
      description: "A new security incident has been recorded.",
    });
  };

  const reportIncident = (incidentData: Omit<Incident, 'id' | 'timestamp'>) => {
    const reportedIncident: Incident = {
      ...incidentData,
      id: `report-${Date.now()}`,
      timestamp: new Date(),
      verificationStatus: VerificationStatus.UNVERIFIED,
      source: IncidentSource.MANUAL,
    };

    setIncidents(prev => [...prev, reportedIncident]);
    toast({
      title: "Report Submitted",
      description: "Thank you for your report. It will be reviewed by our team.",
    });
  };

  const updateProvinceAlertLevel = (provinceId: string, alertLevel: AlertLevel) => {
    setProvinces(prev =>
      prev.map(province =>
        province.id === provinceId ? { ...province, alertLevel } : province
      )
    );
    toast({
      title: "Alert Level Updated",
      description: `Alert level for ${provinces.find(p => p.id === provinceId)?.name} has been updated.`,
    });
  };

  const updateProvinceAlertLevelBasedOnIncidents = (provinceId: string) => {
    const provinceIncidents = incidents.filter(incident => incident.provinceId === provinceId);
    
    if (provinceIncidents.some(incident => incident.alertLevel === AlertLevel.SEVERE)) {
      updateProvinceAlertLevel(provinceId, AlertLevel.SEVERE);
    } else if (provinceIncidents.some(incident => incident.alertLevel === AlertLevel.WARNING)) {
      updateProvinceAlertLevel(provinceId, AlertLevel.WARNING);
    } else {
      updateProvinceAlertLevel(provinceId, AlertLevel.NORMAL);
    }
  };

  const getProvinceById = (provinceId: string) => {
    return provinces.find(province => province.id === provinceId);
  };

  const getIncidentsByProvince = (provinceId: string) => {
    return incidents.filter(incident => incident.provinceId === provinceId);
  };

  const value = {
    provinces,
    incidents,
    user,
    addIncident,
    reportIncident,
    updateProvinceAlertLevel,
    getProvinceById,
    getIncidentsByProvince
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
