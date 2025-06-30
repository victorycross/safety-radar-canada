
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  Settings, 
  TestTube, 
  Trash2, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock
} from 'lucide-react';
import { useSourceManagement } from '@/hooks/useSourceManagement';

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

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleTest = async (source: any) => {
    setTestingSourceId(source.id);
    try {
      await testSource(source);
    } finally {
      setTestingSourceId(null);
    }
  };

  const handleDelete = async (sourceId: string) => {
    if (confirm('Are you sure you want to delete this source? This action cannot be undone.')) {
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
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-64"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Sources</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="healthy">Healthy Only</option>
            <option value="error">Error Only</option>
          </select>
        </div>

        <Button onClick={triggerIngestion} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Run Ingestion
        </Button>
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSources.map((source) => {
          const uptime = getSourceUptime(source.id);
          const isTestingThis = testingSourceId === source.id;
          
          return (
            <Card key={source.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {source.name}
                      {getHealthIcon(source.health_status)}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {source.description || 'No description'}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {source.source_type}
                    </Badge>
                    <Switch
                      checked={source.is_active}
                      onCheckedChange={(checked) => toggleSourceStatus(source.id, checked)}
                      size="sm"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Uptime</div>
                    <div className="font-medium">{uptime}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Poll Interval</div>
                    <div className="font-medium">{source.polling_interval}s</div>
                  </div>
                </div>

                {/* Last Poll */}
                <div className="text-sm">
                  <div className="text-muted-foreground">Last Poll</div>
                  <div className="font-medium">
                    {source.last_poll_at 
                      ? new Date(source.last_poll_at).toLocaleString()
                      : 'Never'
                    }
                  </div>
                </div>

                {/* Status Badge */}
                <Badge 
                  variant={source.health_status === 'healthy' ? 'default' : 'destructive'}
                  className="w-full justify-center"
                >
                  {source.health_status.toUpperCase()}
                </Badge>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTest(source)}
                    disabled={isTestingThis}
                    className="flex-1"
                  >
                    {isTestingThis ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(source.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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
