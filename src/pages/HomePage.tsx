import React from 'react';
import CanadianProvincesGrid from '@/components/map/CanadianProvincesGrid';
import InternationalHubs from '@/components/map/InternationalHubs';
import IncidentsList from '@/components/incidents/IncidentsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import StatusWidget from '@/components/dashboard/StatusWidget';
import { AlertLevel } from '@/types';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, Bell, Loader2, Expand, Minimize2, RotateCcw } from 'lucide-react';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import EmployeeDistributionChart from '@/components/dashboard/EmployeeDistributionChart';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { useLocationVisibility } from '@/hooks/useLocationVisibility';
import { useAccordionState } from '@/hooks/useAccordionState';
import LocationVisibilitySettings from '@/components/map/LocationVisibilitySettings';

const HomePage = () => {
  const { provinces, incidents, loading } = useSupabaseDataContext();
  const { isProvinceVisible } = useLocationVisibility();
  const { 
    getOpenSections, 
    handleAccordionChange, 
    expandAll, 
    collapseAll, 
    resetToDefault,
    accordionState 
  } = useAccordionState();
  
  // International hubs data - consolidated here
  const internationalHubs = [
    { id: 'nyc', name: 'New York', country: 'United States' },
    { id: 'london', name: 'London', country: 'United Kingdom' },
    { id: 'hk', name: 'Hong Kong', country: 'China' },
    { id: 'singapore', name: 'Singapore', country: 'Singapore' },
    { id: 'tokyo', name: 'Tokyo', country: 'Japan' },
    { id: 'frankfurt', name: 'Frankfurt', country: 'Germany' },
    { id: 'zurich', name: 'Zurich', country: 'Switzerland' },
    { id: 'dubai', name: 'Dubai', country: 'UAE' },
    { id: 'sydney', name: 'Sydney', country: 'Australia' },
    { id: 'toronto-intl', name: 'Toronto Financial District', country: 'Canada' }
  ];

  // Fallback provinces data
  const fallbackProvinces = [
    { id: 'ab', name: 'Alberta', code: 'AB', alertLevel: 'normal' as const, employeeCount: 15420 },
    { id: 'bc', name: 'British Columbia', code: 'BC', alertLevel: 'normal' as const, employeeCount: 23150 },
    { id: 'mb', name: 'Manitoba', code: 'MB', alertLevel: 'normal' as const, employeeCount: 5890 },
    { id: 'nb', name: 'New Brunswick', code: 'NB', alertLevel: 'normal' as const, employeeCount: 3420 },
    { id: 'nl', name: 'Newfoundland and Labrador', code: 'NL', alertLevel: 'normal' as const, employeeCount: 2180 },
    { id: 'ns', name: 'Nova Scotia', code: 'NS', alertLevel: 'normal' as const, employeeCount: 4350 },
    { id: 'on', name: 'Ontario', code: 'ON', alertLevel: 'normal' as const, employeeCount: 45200 },
    { id: 'pe', name: 'Prince Edward Island', code: 'PE', alertLevel: 'normal' as const, employeeCount: 890 },
    { id: 'qc', name: 'Quebec', code: 'QC', alertLevel: 'normal' as const, employeeCount: 32100 },
    { id: 'sk', name: 'Saskatchewan', code: 'SK', alertLevel: 'normal' as const, employeeCount: 4750 },
    { id: 'nt', name: 'Northwest Territories', code: 'NT', alertLevel: 'normal' as const, employeeCount: 220 },
    { id: 'nu', name: 'Nunavut', code: 'NU', alertLevel: 'normal' as const, employeeCount: 180 },
    { id: 'yt', name: 'Yukon', code: 'YT', alertLevel: 'normal' as const, employeeCount: 150 }
  ];

  // Use data from context if available, otherwise use fallback data
  const displayProvinces = provinces.length > 0 ? provinces : fallbackProvinces;
  
  // Get provinces with severe or warning statuses (only count visible provinces for display)
  const alertProvinces = displayProvinces.filter(province => 
    province.alertLevel === AlertLevel.SEVERE || province.alertLevel === AlertLevel.WARNING
  );

  // Filter alert provinces based on visibility for display purposes
  const visibleAlertProvinces = alertProvinces.filter(province => isProvinceVisible(province.id));

  // Get visible provinces count
  const visibleProvincesCount = displayProvinces.filter(province => isProvinceVisible(province.id)).length;

  // Recent incidents count
  const recentIncidentsCount = incidents.length;

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor security events across Canadian operations and international financial hubs</p>
        </div>
        <div className="flex items-center gap-2">
          <LocationVisibilitySettings 
            provinces={displayProvinces}
            internationalHubs={internationalHubs}
          />
          <div className="flex items-center gap-1 border-l pl-2 ml-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={expandAll}
              className="flex items-center gap-1"
            >
              <Expand className="h-4 w-4" />
              Expand All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={collapseAll}
              className="flex items-center gap-1"
            >
              <Minimize2 className="h-4 w-4" />
              Collapse All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetToDefault}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>
      
      <Accordion 
        type="multiple" 
        value={getOpenSections()} 
        onValueChange={handleAccordionChange}
        className="space-y-4"
      >
        {/* Active Alerts Section */}
        <AccordionItem value="active-alerts" className="border-0">
          <AccordionTrigger className="hover:no-underline p-0 pb-4">
            <div className="text-left">
              <h2 className="text-xl font-semibold">
                {alertProvinces.length > 0 ? 'Active Alerts' : 'System Status'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {alertProvinces.length > 0 
                  ? `${alertProvinces.length} ${alertProvinces.length === 1 ? 'province' : 'provinces'} with security alerts`
                  : 'No provinces currently reporting security alerts'
                }
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
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
          </AccordionContent>
        </AccordionItem>

        {/* Canadian Provinces Section */}
        <AccordionItem value="provinces" className="border-0">
          <AccordionTrigger className="hover:no-underline p-0 pb-4">
            <div className="text-left">
              <h2 className="text-xl font-semibold">Canadian Provinces & Territories</h2>
              <p className="text-sm text-muted-foreground">
                Provincial security status overview ({visibleProvincesCount} of {displayProvinces.length} visible)
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <CanadianProvincesGrid />
          </AccordionContent>
        </AccordionItem>

        {/* International Hubs Section */}
        <AccordionItem value="international" className="border-0">
          <AccordionTrigger className="hover:no-underline p-0 pb-4">
            <div className="text-left">
              <h2 className="text-xl font-semibold">International Financial Hubs</h2>
              <p className="text-sm text-muted-foreground">
                Security status for key financial services locations ({internationalHubs.length} hubs)
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <InternationalHubs />
          </AccordionContent>
        </AccordionItem>

        {/* Recent Alerts Section */}
        <AccordionItem value="recent-alerts" className="border-0">
          <AccordionTrigger className="hover:no-underline p-0 pb-4">
            <div className="text-left">
              <h2 className="text-xl font-semibold">Recent Emergency Alerts</h2>
              <p className="text-sm text-muted-foreground">Latest alerts from emergency services</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <RecentAlerts />
          </AccordionContent>
        </AccordionItem>

        {/* Incidents Section */}
        <AccordionItem value="incidents" className="border-0">
          <AccordionTrigger className="hover:no-underline p-0 pb-4">
            <div className="text-left">
              <h2 className="text-xl font-semibold">Recent Incidents</h2>
              <p className="text-sm text-muted-foreground">
                Latest security incidents across all locations ({recentIncidentsCount} incidents)
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <IncidentsList />
          </AccordionContent>
        </AccordionItem>

        {/* Employee Distribution Chart Section */}
        <AccordionItem value="employee-chart" className="border-0">
          <AccordionTrigger className="hover:no-underline p-0 pb-4">
            <div className="text-left">
              <h2 className="text-xl font-semibold">Employee Distribution</h2>
              <p className="text-sm text-muted-foreground">Geographic distribution of employees</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <EmployeeDistributionChart />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default HomePage;
