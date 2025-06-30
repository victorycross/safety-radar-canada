
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Globe, 
  Bell, 
  AlertTriangle, 
  BarChart3, 
  Clock 
} from 'lucide-react';
import CanadianProvincesGrid from '@/components/map/CanadianProvincesGrid';
import InternationalHubs from '@/components/map/InternationalHubs';
import RecentAlerts from './RecentAlerts';
import IncidentsList from '@/components/incidents/IncidentsList';
import EmployeeDistributionChart from './EmployeeDistributionChart';
import EnhancedMetricsWidget from './EnhancedMetricsWidget';
import { InternationalHub, DashboardMetrics } from '@/types/dashboard';

interface DashboardTabsProps {
  visibleProvincesCount: number;
  totalProvinces: number;
  internationalHubsCount: number;
  incidentsCount: number;
  internationalHubs: InternationalHub[];
  hubsLoading?: boolean;
  onRefreshHubs?: () => void;
  metrics?: DashboardMetrics;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  visibleProvincesCount,
  totalProvinces,
  internationalHubsCount,
  incidentsCount,
  internationalHubs,
  hubsLoading = false,
  onRefreshHubs,
  metrics
}) => {
  return (
    <div className="space-y-6">
      {/* Enhanced Metrics Overview */}
      {metrics && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Security Overview</h3>
          <EnhancedMetricsWidget metrics={metrics} />
        </div>
      )}

      <Tabs defaultValue="provinces" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 h-auto p-1">
          <TabsTrigger value="provinces" className="flex items-center space-x-2 py-3">
            <MapPin className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm font-medium">Provinces</div>
              <div className="text-xs text-muted-foreground">{visibleProvincesCount}/{totalProvinces}</div>
            </div>
          </TabsTrigger>
          
          <TabsTrigger value="international" className="flex items-center space-x-2 py-3">
            <Globe className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm font-medium">International</div>
              <div className="text-xs text-muted-foreground">{internationalHubsCount} hubs</div>
            </div>
          </TabsTrigger>
          
          <TabsTrigger value="alerts" className="flex items-center space-x-2 py-3">
            <Bell className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm font-medium">Emergency</div>
              <div className="text-xs text-muted-foreground">Alerts</div>
            </div>
          </TabsTrigger>
          
          <TabsTrigger value="incidents" className="flex items-center space-x-2 py-3">
            <AlertTriangle className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm font-medium">Incidents</div>
              <div className="text-xs text-muted-foreground">{incidentsCount}</div>
            </div>
          </TabsTrigger>
          
          <TabsTrigger value="analytics" className="flex items-center space-x-2 py-3">
            <BarChart3 className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm font-medium">Analytics</div>
              <div className="text-xs text-muted-foreground">Charts</div>
            </div>
          </TabsTrigger>
          
          <TabsTrigger value="history" className="flex items-center space-x-2 py-3">
            <Clock className="h-4 w-4" />
            <div className="text-left">
              <div className="text-sm font-medium">History</div>
              <div className="text-xs text-muted-foreground">Past 30d</div>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="provinces" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Canadian Provinces & Territories</h3>
            <p className="text-sm text-muted-foreground">
              Showing {visibleProvincesCount} of {totalProvinces} provinces
            </p>
          </div>
          <CanadianProvincesGrid />
        </TabsContent>

        <TabsContent value="international" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">International Financial Hubs</h3>
            <p className="text-sm text-muted-foreground">
              {internationalHubsCount} key locations worldwide
            </p>
          </div>
          <InternationalHubs 
            hubs={internationalHubs}
            loading={hubsLoading}
            onRefresh={onRefreshHubs}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Emergency Alert Feed</h3>
            <p className="text-sm text-muted-foreground">
              Latest alerts from emergency services
            </p>
          </div>
          <RecentAlerts />
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Security Incidents</h3>
            <p className="text-sm text-muted-foreground">
              {incidentsCount} recent incidents
            </p>
          </div>
          <IncidentsList />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Employee Distribution</h3>
            <p className="text-sm text-muted-foreground">
              Geographic distribution overview
            </p>
          </div>
          <EmployeeDistributionChart />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Historical Data</h3>
            <p className="text-sm text-muted-foreground">
              Past 30 days activity
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Recent Incidents</h4>
              <IncidentsList />
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Alert History</h4>
              <RecentAlerts />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardTabs;
