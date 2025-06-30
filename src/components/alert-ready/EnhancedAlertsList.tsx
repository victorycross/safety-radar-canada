
import React, { useState } from 'react';
import { AlertTriangle, Info, Loader2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import UniversalAlertCard from '@/components/alerts/UniversalAlertCard';
import { UniversalAlert } from '@/types/alerts';

interface AlertSource {
  id: string;
  name: string;
  source_type: string;
  is_active: boolean;
  health_status: string;
}

interface EnhancedAlertsListProps {
  alerts: UniversalAlert[];
  sources: AlertSource[];
  loading: boolean;
  error: string | null;
  fetchAlerts: () => void;
  activeView: string;
}

const EnhancedAlertsList = ({ alerts, sources, loading, error, fetchAlerts, activeView }: EnhancedAlertsListProps) => {
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-2" />
        <p className="text-lg font-medium">Error loading alerts</p>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={fetchAlerts} className="mt-4">Try Again</Button>
      </div>
    );
  }

  // Apply filters
  let filteredAlerts = alerts;
  
  if (sourceFilter !== 'all') {
    filteredAlerts = filteredAlerts.filter(alert => 
      alert.source.toLowerCase().includes(sourceFilter.toLowerCase())
    );
  }
  
  if (categoryFilter !== 'all') {
    filteredAlerts = filteredAlerts.filter(alert => 
      alert.category.toLowerCase().includes(categoryFilter.toLowerCase())
    );
  }

  // Get unique categories for filter
  const categories = Array.from(new Set(alerts.map(alert => alert.category))).filter(Boolean);
  
  if (filteredAlerts.length === 0 && alerts.length > 0) {
    return (
      <div className="space-y-4">
        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {sources.map(source => (
                <SelectItem key={source.id} value={source.name.toLowerCase()}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSourceFilter('all');
              setCategoryFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>

        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-lg font-medium">No alerts match your filters</p>
          <p className="text-muted-foreground">
            Try adjusting your filters to see more results
          </p>
        </div>
      </div>
    );
  }
  
  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed rounded-lg">
        <Info className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
        <p className="text-lg font-medium">No alerts found</p>
        <p className="text-muted-foreground">
          There are currently no active alerts from any configured sources
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {sources.map(source => (
              <SelectItem key={source.id} value={source.name.toLowerCase()}>
                <div className="flex items-center gap-2">
                  {source.name}
                  <Badge 
                    variant={source.health_status === 'healthy' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {source.health_status}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category.toLowerCase()}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            setSourceFilter('all');
            setCategoryFilter('all');
          }}
        >
          Clear Filters
        </Button>
        
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {filteredAlerts.length} of {alerts.length} alerts
          </span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <UniversalAlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
};

export default EnhancedAlertsList;
