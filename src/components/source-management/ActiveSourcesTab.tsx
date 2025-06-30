
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { useSourceManagement } from '@/hooks/useSourceManagement';
import SourceFiltersHeader from './SourceFiltersHeader';
import SourceCard from './SourceCard';

const ActiveSourcesTab = () => {
  const { 
    sources, 
    loading, 
    toggleSourceStatus, 
    testSource, 
    deleteSource,
    getSourceUptime,
    triggerIngestion 
  } = useSourceManagement();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [testingSourceId, setTestingSourceId] = useState<string | null>(null);

  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.source_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'active' && source.is_active) ||
                         (filterType === 'inactive' && !source.is_active) ||
                         (filterType === 'healthy' && source.health_status === 'healthy') ||
                         (filterType === 'error' && source.health_status === 'error');
    
    return matchesSearch && matchesFilter;
  });

  const handleTest = async (source: any) => {
    setTestingSourceId(source.id);
    try {
      await testSource(source);
    } finally {
      setTestingSourceId(null);
    }
  };

  const handleDelete = async (sourceId: string, sourceName: string) => {
    if (confirm(`Are you sure you want to remove "${sourceName}"? This action cannot be undone.`)) {
      await deleteSource(sourceId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SourceFiltersHeader
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        onTriggerIngestion={triggerIngestion}
        loading={loading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSources.map((source) => {
          const uptime = getSourceUptime(source.id);
          const isTestingThis = testingSourceId === source.id;
          
          return (
            <SourceCard
              key={source.id}
              source={source}
              uptime={uptime}
              isTestingThis={isTestingThis}
              onToggleStatus={(checked) => toggleSourceStatus(source.id, checked)}
              onTest={() => handleTest(source)}
              onDelete={() => handleDelete(source.id, source.name)}
            />
          );
        })}
      </div>

      {filteredSources.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm || filterType !== 'all' 
                ? 'No sources match your search criteria' 
                : 'No sources configured yet'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActiveSourcesTab;
