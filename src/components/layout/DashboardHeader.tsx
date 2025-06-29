
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import LocationVisibilitySettings from '@/components/map/LocationVisibilitySettings';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  alertCount: number;
  visibleProvincesCount: number;
  totalProvinces: number;
  onRefresh: () => void;
  loading: boolean;
  provinces: any[];
  internationalHubs: any[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  alertCount,
  visibleProvincesCount,
  totalProvinces,
  onRefresh,
  loading,
  provinces,
  internationalHubs
}) => {
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
              {visibleProvincesCount}/{totalProvinces} Provinces
            </Badge>
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

          <LocationVisibilitySettings 
            provinces={provinces}
            internationalHubs={internationalHubs}
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
              <DropdownMenuItem asChild>
                <Link to="/widgets" className="flex items-center w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Employee Check-In
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
