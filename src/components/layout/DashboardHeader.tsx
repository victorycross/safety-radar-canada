
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SimpleLocationFilter from '@/components/map/SimpleLocationFilter';
import { useSimpleLocationFilter } from '@/hooks/useSimpleLocationFilter';
import DataStatusIndicator from '@/components/dashboard/DataStatusIndicator';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  alertCount: number;
  visibleProvincesCount: number;
  totalProvinces: number;
  onRefresh: () => void;
  loading: boolean;
  provinces: any[];
  internationalHubs: any[];
  // New processing status props
  lastDataUpdate?: Date;
  isProcessing?: boolean;
  hasDataErrors?: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  alertCount,
  visibleProvincesCount,
  totalProvinces,
  onRefresh,
  loading,
  provinces,
  internationalHubs,
  lastDataUpdate,
  isProcessing = false,
  hasDataErrors = false
}) => {
  const provinceIds = provinces.map(p => p.id);
  const hubIds = internationalHubs.map(h => h.id);
  
  const {
    isProvinceVisible,
    isHubVisible,
    toggleProvince,
    toggleHub,
    showAllProvinces,
    hideAllProvinces,
    showAllHubs,
    hideAllHubs,
    resetFilters,
    visibleProvinceCount,
    visibleHubCount,
    hasFilters
  } = useSimpleLocationFilter(provinceIds, hubIds);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
            <p className="text-sm text-gray-600">
              Monitor security events across Canadian operations
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {alertCount > 0 ? (
              <Badge variant="destructive" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>{alertCount} Active Alert{alertCount !== 1 ? 's' : ''}</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center space-x-1 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3" />
                <span>All Clear</span>
              </Badge>
            )}
            
            <Badge variant="outline" className="text-xs">
              {visibleProvinceCount + visibleHubCount}/{totalProvinces + internationalHubs.length} Locations
            </Badge>

            {/* Data Status Indicator */}
            <DataStatusIndicator
              lastUpdated={lastDataUpdate}
              isProcessing={isProcessing || loading}
              hasErrors={hasDataErrors}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <SimpleLocationFilter
            provinces={provinces}
            internationalHubs={internationalHubs}
            isProvinceVisible={isProvinceVisible}
            isHubVisible={isHubVisible}
            onToggleProvince={toggleProvince}
            onToggleHub={toggleHub}
            onShowAllProvinces={showAllProvinces}
            onHideAllProvinces={hideAllProvinces}
            onShowAllHubs={showAllHubs}
            onHideAllHubs={hideAllHubs}
            onResetFilters={resetFilters}
            visibleProvinceCount={visibleProvinceCount}
            visibleHubCount={visibleHubCount}
            hasFilters={hasFilters}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-1" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/alert-ready" className="flex items-center w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Alert Ready Feed
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
