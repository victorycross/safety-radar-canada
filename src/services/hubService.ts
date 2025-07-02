
import { supabase } from '@/integrations/supabase/client';
import { InternationalHub, HubIncident, HubEmployeeLocation } from '@/types/dashboard';
import { AlertLevel } from '@/types';
import { logger } from '@/utils/logger';

export const fetchInternationalHubs = async (): Promise<InternationalHub[]> => {
  try {
    logger.debug('Fetching international hubs from database');
    
    const { data, error } = await supabase
      .from('international_hubs')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      logger.error('Error fetching international hubs:', error);
      throw error;
    }

    if (!data) {
      logger.warn('No international hubs data received from database');
      return [];
    }

    const hubs: InternationalHub[] = data.map(hub => ({
      id: hub.id,
      name: hub.name,
      country: hub.country,
      code: hub.code,
      flagEmoji: hub.flag_emoji,
      alertLevel: hub.alert_level as AlertLevel,
      employeeCount: hub.employee_count || 0,
      travelWarnings: hub.travel_warnings || 0,
      localIncidents: hub.local_incidents || 0,
      coordinates: hub.coordinates ? {
        lat: (hub.coordinates as any).x || 0,
        lng: (hub.coordinates as any).y || 0
      } : undefined,
      isActive: hub.is_active,
      created_at: hub.created_at,
      updated_at: hub.updated_at
    }));

    logger.info('International hubs fetched successfully', {
      count: hubs.length,
      hubs: hubs.map(h => ({ id: h.id, name: h.name, code: h.code }))
    });

    return hubs;
  } catch (error) {
    logger.error('Error in fetchInternationalHubs:', error);
    throw error;
  }
};

export const fetchHubIncidents = async (): Promise<HubIncident[]> => {
  try {
    logger.debug('Fetching hub incidents from database (active only)');
    
    const { data, error } = await supabase
      .from('hub_incidents')
      .select('*')
      .is('archived_at', null) // Only fetch non-archived incidents
      .order('timestamp', { ascending: false });

    if (error) {
      logger.error('Error fetching hub incidents:', error);
      throw error;
    }

    if (!data) {
      logger.warn('No hub incidents data received from database');
      return [];
    }

    const incidents: HubIncident[] = data.map(incident => ({
      id: incident.id,
      hubId: incident.hub_id,
      title: incident.title,
      description: incident.description,
      alertLevel: incident.alert_level as AlertLevel,
      source: incident.source,
      verificationStatus: incident.verification_status as 'verified' | 'unverified' | 'pending',
      confidenceScore: incident.confidence_score || 0.5,
      timestamp: incident.timestamp,
      recommendedAction: incident.recommended_action,
      geographicScope: incident.geographic_scope,
      rawPayload: incident.raw_payload,
      created_at: incident.created_at,
      updated_at: incident.updated_at
    }));

    logger.info('Hub incidents fetched successfully (active only)', { 
      count: incidents.length,
      incidents: incidents.map(i => ({ id: i.id, hubId: i.hubId, title: i.title }))
    });
    return incidents;
  } catch (error) {
    logger.error('Error in fetchHubIncidents:', error);
    throw error;
  }
};

export const getHubById = (hubs: InternationalHub[], hubId: string): InternationalHub | undefined => {
  return hubs.find(hub => hub.id === hubId);
};

export const getIncidentsByHub = (incidents: HubIncident[], hubId: string): HubIncident[] => {
  return incidents.filter(incident => incident.hubId === hubId);
};

export const addHubIncident = async (incidentData: Omit<HubIncident, 'id' | 'timestamp' | 'created_at' | 'updated_at'>): Promise<HubIncident> => {
  try {
    logger.debug('Adding new hub incident:', incidentData);

    const { data, error } = await supabase
      .from('hub_incidents')
      .insert({
        hub_id: incidentData.hubId,
        title: incidentData.title,
        description: incidentData.description,
        alert_level: incidentData.alertLevel,
        source: incidentData.source,
        verification_status: incidentData.verificationStatus,
        confidence_score: incidentData.confidenceScore,
        recommended_action: incidentData.recommendedAction,
        geographic_scope: incidentData.geographicScope,
        raw_payload: incidentData.rawPayload
      })
      .select()
      .single();

    if (error) {
      logger.error('Error adding hub incident:', error);
      throw error;
    }

    logger.info('Hub incident added successfully:', data.id);
    
    return {
      id: data.id,
      hubId: data.hub_id,
      title: data.title,
      description: data.description,
      alertLevel: data.alert_level as AlertLevel,
      source: data.source,
      verificationStatus: data.verification_status as 'verified' | 'unverified' | 'pending',
      confidenceScore: data.confidence_score,
      timestamp: data.timestamp,
      recommendedAction: data.recommended_action,
      geographicScope: data.geographic_scope,
      rawPayload: data.raw_payload,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    logger.error('Error in addHubIncident:', error);
    throw error;
  }
};

export const updateHubAlertLevel = async (hubId: string, alertLevel: AlertLevel): Promise<void> => {
  try {
    logger.debug('Updating hub alert level:', { hubId, alertLevel });

    const { error } = await supabase
      .from('international_hubs')
      .update({ 
        alert_level: alertLevel,
        updated_at: new Date().toISOString()
      })
      .eq('id', hubId);

    if (error) {
      logger.error('Error updating hub alert level:', error);
      throw error;
    }

    logger.info('Hub alert level updated successfully:', { hubId, alertLevel });
  } catch (error) {
    logger.error('Error in updateHubAlertLevel:', error);
    throw error;
  }
};

// New function to sync hub incident counts and validate data consistency
export const syncHubIncidentCounts = async (): Promise<void> => {
  try {
    logger.debug('Synchronizing all hub incident counts');
    
    const { error } = await supabase.rpc('sync_all_hub_incident_counts');
    
    if (error) {
      logger.error('Error synchronizing hub incident counts:', error);
      throw error;
    }
    
    logger.info('Hub incident counts synchronized successfully');
  } catch (error) {
    logger.error('Error in syncHubIncidentCounts:', error);
    throw error;
  }
};

// Validate data consistency between hub records and incident counts
export const validateHubDataConsistency = async (): Promise<{
  isConsistent: boolean;
  discrepancies: Array<{
    hubId: string;
    hubName: string;
    hubCount: number;
    actualCount: number;
    difference: number;
  }>;
}> => {
  try {
    logger.debug('Validating hub data consistency');
    
    // Get hub data
    const hubs = await fetchInternationalHubs();
    const incidents = await fetchHubIncidents();
    
    // Calculate actual incident counts per hub
    const actualCounts = incidents.reduce((acc, incident) => {
      acc[incident.hubId] = (acc[incident.hubId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const discrepancies = [];
    let isConsistent = true;
    
    for (const hub of hubs) {
      const actualCount = actualCounts[hub.id] || 0;
      const difference = Math.abs(hub.localIncidents - actualCount);
      
      if (difference > 0) {
        isConsistent = false;
        discrepancies.push({
          hubId: hub.id,
          hubName: hub.name,
          hubCount: hub.localIncidents,
          actualCount,
          difference
        });
        
        logger.warn('Hub data inconsistency detected', {
          hubId: hub.id,
          hubName: hub.name,
          recordedCount: hub.localIncidents,
          actualCount,
          difference
        });
      }
    }
    
    logger.info('Hub data consistency validation completed', {
      isConsistent,
      discrepanciesFound: discrepancies.length
    });
    
    return { isConsistent, discrepancies };
  } catch (error) {
    logger.error('Error validating hub data consistency:', error);
    throw error;
  }
};
