
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { logger } from '@/utils/logger';
import { useToast } from '@/hooks/use-toast';

interface RealtimeStatus {
  isConnected: boolean;
  lastUpdate: Date | null;
  subscriptions: string[];
  errorCount: number;
}

export const useRealtimeUpdates = () => {
  const { refreshData } = useSupabaseDataContext();
  const { toast } = useToast();
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    lastUpdate: null,
    subscriptions: [],
    errorCount: 0
  });

  useEffect(() => {
    logger.debug('Setting up real-time subscriptions');

    // Province updates subscription
    const provincesSubscription = supabase
      .channel('provinces-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'provinces'
        },
        (payload) => {
          logger.debug('Province update received:', payload);
          
          setStatus(prev => ({
            ...prev,
            lastUpdate: new Date(),
            isConnected: true
          }));

          // Show toast notification for province changes
          if (payload.eventType === 'UPDATE') {
            const provinceName = payload.new?.name || 'Unknown Province';
            toast({
              title: 'Province Updated',
              description: `${provinceName} information has been updated`,
              duration: 3000,
            });
          }

          // Refresh data to get latest changes
          setTimeout(() => refreshData(), 100);
        }
      )
      .subscribe((status) => {
        logger.debug('Provinces subscription status:', status);
        setStatus(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          subscriptions: prev.subscriptions.includes('provinces') 
            ? prev.subscriptions 
            : [...prev.subscriptions, 'provinces']
        }));
      });

    // Incidents updates subscription
    const incidentsSubscription = supabase
      .channel('incidents-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'incidents'
        },
        (payload) => {
          logger.debug('Incident update received:', payload);
          
          setStatus(prev => ({
            ...prev,
            lastUpdate: new Date(),
            isConnected: true
          }));

          // Show toast notification for new incidents
          if (payload.eventType === 'INSERT') {
            const incidentTitle = payload.new?.title || 'New Incident';
            toast({
              title: 'New Incident Reported',
              description: incidentTitle,
              variant: 'destructive',
              duration: 5000,
            });
          }

          // Refresh data to get latest changes
          setTimeout(() => refreshData(), 100);
        }
      )
      .subscribe((status) => {
        logger.debug('Incidents subscription status:', status);
        setStatus(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          subscriptions: prev.subscriptions.includes('incidents') 
            ? prev.subscriptions 
            : [...prev.subscriptions, 'incidents']
        }));
      });

    // Employee data updates subscription
    const employeesSubscription = supabase
      .channel('employees-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees'
        },
        (payload) => {
          logger.debug('Employee update received:', payload);
          
          setStatus(prev => ({
            ...prev,
            lastUpdate: new Date()
          }));

          // Refresh data for employee count changes
          setTimeout(() => refreshData(), 100);
        }
      )
      .subscribe((status) => {
        logger.debug('Employees subscription status:', status);
        setStatus(prev => ({
          ...prev,
          subscriptions: prev.subscriptions.includes('employees') 
            ? prev.subscriptions 
            : [...prev.subscriptions, 'employees']
        }));
      });

    // Connection status monitoring
    const connectionMonitor = setInterval(() => {
      setStatus(prev => {
        if (prev.lastUpdate && Date.now() - prev.lastUpdate.getTime() > 60000) {
          // No updates for 1 minute, might be disconnected
          return {
            ...prev,
            isConnected: false,
            errorCount: prev.errorCount + 1
          };
        }
        return prev;
      });
    }, 30000); // Check every 30 seconds

    // Cleanup function
    return () => {
      logger.debug('Cleaning up real-time subscriptions');
      clearInterval(connectionMonitor);
      supabase.removeChannel(provincesSubscription);
      supabase.removeChannel(incidentsSubscription);
      supabase.removeChannel(employeesSubscription);
    };
  }, [refreshData, toast]);

  // Reconnection function
  const reconnect = () => {
    logger.debug('Attempting to reconnect real-time subscriptions');
    setStatus(prev => ({
      ...prev,
      errorCount: 0
    }));
    
    // Force refresh data
    refreshData();
  };

  return {
    status,
    reconnect
  };
};
