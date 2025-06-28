
import React from 'react';
import CanadianProvincesGrid from '@/components/map/CanadianProvincesGrid';
import InternationalHubs from '@/components/map/InternationalHubs';
import IncidentsList from '@/components/incidents/IncidentsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatusWidget from '@/components/dashboard/StatusWidget';
import { AlertLevel } from '@/types';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, Bell, Loader2 } from 'lucide-react';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import EmployeeDistributionChart from '@/components/dashboard/EmployeeDistributionChart';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { useLocationVisibility } from '@/hooks/useLocationVisibility';

const HomePage = () => {
  const { provinces, loading } = useSupabaseDataContext();
  const { isProvinceVisible } = useLocationVisibility();
  
  // Get provinces with severe or warning statuses (only count visible provinces for display)
  const alertProvinces = provinces.filter(province => 
    province.alertLevel === AlertLevel.SEVERE || province.alertLevel === AlertLevel.WARNING
  );

  // Filter alert provinces based on visibility for display purposes
  const visibleAlertProvinces = alertProvinces.filter(province => isProvinceVisible(province.id));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading security dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Dashboard</h1>
        <p className="text-muted-foreground">Monitor security events across Canadian operations and international financial hubs</p>
      </div>
      
      {alertProvinces.length > 0 && (
        <Card className="border-warning bg-warning-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Alerts</CardTitle>
            <CardDescription>
              {alertProvinces.length} {alertProvinces.length === 1 ? 'province' : 'provinces'} with security alerts
              {visibleAlertProvinces.length !== alertProvinces.length && (
                <span className="text-xs text-muted-foreground ml-2">
                  ({visibleAlertProvinces.length} visible in current view)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleAlertProvinces.map((province) => (
                <StatusWidget key={province.id} provinceId={province.id} />
              ))}
            </div>
            {visibleAlertProvinces.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                All provinces with alerts are currently hidden. Use the "Customize View" button to show them.
              </div>
            )}
            <div className="mt-4 flex justify-between">
              <Link to="/alert-ready">
                <Button variant="outline" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span>Alert Ready Feed</span>
                </Button>
              </Link>
              <Link to="/widget">
                <Button variant="outline" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Employee Check-In Widget</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      
      {alertProvinces.length === 0 && (
        <Card className="border-success bg-success-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">All Clear</CardTitle>
            <CardDescription>
              No provinces currently reporting security alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <p className="text-center text-success font-medium">All provinces are reporting normal security status</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Visual Map Sections */}
      <div className="space-y-6">
        <CanadianProvincesGrid />
        <InternationalHubs />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <RecentAlerts />
        </div>
        
        <div className="space-y-6">
          <IncidentsList />
          <EmployeeDistributionChart />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
