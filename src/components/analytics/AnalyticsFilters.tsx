
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Filter, RefreshCw, Download, Settings } from 'lucide-react';
import { AlertLevel, IncidentSource } from '@/types';
import { AnalyticsFilters as IAnalyticsFilters } from '@/hooks/useAnalyticsState';

interface AnalyticsFiltersProps {
  filters: IAnalyticsFilters;
  onFiltersChange: (filters: Partial<IAnalyticsFilters>) => void;
  onReset: () => void;
  onExport: (format: 'pdf' | 'csv' | 'json') => void;
  autoRefresh: boolean;
  onAutoRefreshToggle: () => void;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  onExport,
  autoRefresh,
  onAutoRefreshToggle
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-CA');
  };

  const handleAlertLevelToggle = (level: AlertLevel, checked: boolean) => {
    const newLevels = checked
      ? [...filters.alertLevels, level]
      : filters.alertLevels.filter(l => l !== level);
    onFiltersChange({ alertLevels: newLevels });
  };

  const handleSourceToggle = (source: IncidentSource, checked: boolean) => {
    const newSources = checked
      ? [...filters.sources, source]
      : filters.sources.filter(s => s !== source);
    onFiltersChange({ sources: newSources });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Filter className="mr-2 h-5 w-5" />
            Analytics Filters
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAutoRefreshToggle}
              className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
            >
              <RefreshCw className={`mr-1 h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh
            </Button>
            <Button variant="outline" size="sm" onClick={onReset}>
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range */}
        <div>
          <label className="text-sm font-medium mb-2 block">Date Range</label>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-muted p-2 rounded">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {formatDate(filters.dateRange.from)} - {formatDate(filters.dateRange.to)}
              </span>
            </div>
            <Select
              value="30d"
              onValueChange={(value) => {
                const now = new Date();
                let from = new Date();
                
                switch (value) {
                  case '7d':
                    from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                  case '30d':
                    from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                  case '90d':
                    from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                  case '1y':
                    from = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                }
                
                onFiltersChange({ dateRange: { from, to: now } });
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">90 days</SelectItem>
                <SelectItem value="1y">1 year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Alert Levels */}
        <div>
          <label className="text-sm font-medium mb-3 block">Alert Levels</label>
          <div className="flex flex-wrap gap-2">
            {Object.values(AlertLevel).map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={`alert-${level}`}
                  checked={filters.alertLevels.includes(level)}
                  onCheckedChange={(checked) => handleAlertLevelToggle(level, checked as boolean)}
                />
                <Badge
                  variant={
                    level === AlertLevel.SEVERE ? 'destructive' :
                    level === AlertLevel.WARNING ? 'default' : 'secondary'
                  }
                  className="capitalize"
                >
                  {level}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div>
          <label className="text-sm font-medium mb-3 block">Sources</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(IncidentSource).map((source) => (
              <div key={source} className="flex items-center space-x-2">
                <Checkbox
                  id={`source-${source}`}
                  checked={filters.sources.includes(source)}
                  onCheckedChange={(checked) => handleSourceToggle(source, checked as boolean)}
                />
                <label
                  htmlFor={`source-${source}`}
                  className="text-sm cursor-pointer truncate"
                  title={source}
                >
                  {source}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Export Options */}
        <div className="border-t pt-4">
          <label className="text-sm font-medium mb-3 block">Export Data</label>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('pdf')}
              className="flex-1"
            >
              <Download className="mr-1 h-4 w-4" />
              PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('csv')}
              className="flex-1"
            >
              <Download className="mr-1 h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('json')}
              className="flex-1"
            >
              <Download className="mr-1 h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>

        {/* Refresh Interval */}
        <div>
          <label className="text-sm font-medium mb-2 block">Refresh Interval</label>
          <Select
            value={filters.refreshInterval.toString()}
            onValueChange={(value) => onFiltersChange({ refreshInterval: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10000">10 seconds</SelectItem>
              <SelectItem value="30000">30 seconds</SelectItem>
              <SelectItem value="60000">1 minute</SelectItem>
              <SelectItem value="300000">5 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsFilters;
