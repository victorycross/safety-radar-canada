
import { useState, useMemo } from 'react';
import { InternationalHub } from '@/types/dashboard';

export const useHubSearch = (hubs: InternationalHub[]) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHubs = useMemo(() => {
    if (!searchTerm.trim()) return hubs;

    const term = searchTerm.toLowerCase().trim();
    return hubs.filter(hub => 
      hub.name.toLowerCase().includes(term) ||
      hub.country.toLowerCase().includes(term) ||
      hub.code.toLowerCase().includes(term)
    );
  }, [hubs, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    filteredHubs
  };
};
