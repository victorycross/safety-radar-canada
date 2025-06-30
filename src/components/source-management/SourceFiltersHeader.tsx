
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw } from 'lucide-react';

interface SourceFiltersHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterType: string;
  setFilterType: (type: string) => void;
  onTriggerIngestion: () => void;
  loading: boolean;
}

const SourceFiltersHeader: React.FC<SourceFiltersHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  onTriggerIngestion,
  loading
}) => {
  return (
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

      <Button onClick={onTriggerIngestion} disabled={loading}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Run Ingestion
      </Button>
    </div>
  );
};

export default SourceFiltersHeader;
