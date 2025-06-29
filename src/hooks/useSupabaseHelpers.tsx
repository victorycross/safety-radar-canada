
import { Province, Incident } from '@/types';

export const useSupabaseHelpers = (provinces: Province[], incidents: Incident[]) => {
  const getProvinceById = (provinceId: string) => {
    return provinces.find(province => province.id === provinceId);
  };

  const getIncidentsByProvince = (provinceId: string) => {
    return incidents.filter(incident => incident.provinceId === provinceId);
  };

  const getCorrelatedIncidents = (incidentId: string) => {
    return incidents.filter(incident => 
      incident.correlations?.some(corr => 
        corr.related_incident_id === incidentId || 
        incident.id === incidentId
      )
    );
  };

  const getIncidentsByConfidence = (minConfidence: number = 0, maxConfidence: number = 1) => {
    return incidents.filter(incident => 
      (incident.confidenceScore || 0) >= minConfidence && 
      (incident.confidenceScore || 0) <= maxConfidence
    );
  };

  const getGeotaggedIncidents = () => {
    return incidents.filter(incident => incident.geospatialData);
  };

  return {
    getProvinceById,
    getIncidentsByProvince,
    getCorrelatedIncidents,
    getIncidentsByConfidence,
    getGeotaggedIncidents
  };
};
