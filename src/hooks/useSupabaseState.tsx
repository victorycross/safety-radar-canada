
import { useState } from 'react';
import { Province, Incident } from '@/types';

export const useSupabaseState = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  return {
    provinces,
    setProvinces,
    incidents,
    setIncidents,
    loading,
    setLoading,
    error,
    setError
  };
};
