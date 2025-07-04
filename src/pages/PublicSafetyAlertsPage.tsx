import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, RefreshCw, Download, Filter } from 'lucide-react';
import CriticalAlertsHero from '@/components/dashboard/CriticalAlertsHero';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import { useHomeData } from '@/hooks/useHomeData';
import { useLocationVisibility } from '@/hooks/useLocationVisibility';
import DashboardLoadingState from '@/components/dashboard/DashboardLoadingState';
import { Link } from 'react-router-dom';

const PublicSafetyAlertsPage = () => {
  const { 
    provinces, 
    alertProvinces, 
    visibleAlertProvinces,
    alertHubs,
    loading, 
    error, 
    refreshData 
  } = useHomeData();

  const actualProvinceIds = provinces.map(p => p.id);
  const { isProvinceVisible } = useLocationVisibility(actualProvinceIds);
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Alerts</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading && provinces.length === 0) {
    return <DashboardLoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Cloud className="h-8 w-8 text-blue-600" />
              Public Safety Alerts
            </h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive weather and public safety alert monitoring across Canada and international hubs
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={refreshData} size="sm" disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {alertProvinces.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Provinces with Alerts
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {alertHubs?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">
                  International Hubs
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Link to="/alert-ready">
                  <Button variant="outline" className="w-full">
                    View Alert Feed
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Alert Display */}
        <div className="space-y-6">
          {/* Critical Alerts */}
          <CriticalAlertsHero
            alertProvinces={alertProvinces}
            visibleAlertProvinces={visibleAlertProvinces}
            alertHubs={alertHubs || []}
            loading={loading}
          />

          {/* Recent Alerts Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alert Feed</CardTitle>
              <CardDescription>
                Latest weather and public safety alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentAlerts />
            </CardContent>
          </Card>
        </div>

        {/* Additional Alert Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Alert Sources</CardTitle>
              <CardDescription>
                Data is aggregated from multiple authoritative sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Environment and Climate Change Canada</li>
                <li>• Provincial Emergency Management Agencies</li>
                <li>• Public Safety Canada</li>
                <li>• Municipal Emergency Services</li>
                <li>• International Weather Services</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert Categories</CardTitle>
              <CardDescription>
                Types of alerts monitored by the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Severe Weather Warnings</li>
                <li>• Emergency Management Alerts</li>
                <li>• Public Safety Advisories</li>
                <li>• Transportation Disruptions</li>
                <li>• Infrastructure Incidents</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicSafetyAlertsPage;