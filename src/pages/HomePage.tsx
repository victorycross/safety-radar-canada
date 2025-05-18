
import React from 'react';
import SimpleGlobeMap from '@/components/map/SimpleGlobeMap';
import IncidentsList from '@/components/incidents/IncidentsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatusWidget from '@/components/dashboard/StatusWidget';
import { useSecurity } from '@/context/SecurityContext';
import { AlertLevel } from '@/types';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CheckCircle, Search, Database } from 'lucide-react';
import DataSourceUpdates from '@/components/sources/DataSourceUpdates';

const HomePage = () => {
  const { provinces } = useSecurity();
  
  // Get provinces with severe or warning statuses
  const alertProvinces = provinces.filter(province => 
    province.alertLevel === AlertLevel.SEVERE || province.alertLevel === AlertLevel.WARNING
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Security Dashboard</h1>
        <p className="text-muted-foreground">Monitor security events across Canadian operations</p>
      </div>
      
      {alertProvinces.length > 0 && (
        <Card className="border-warning bg-warning-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Alerts</CardTitle>
            <CardDescription>
              {alertProvinces.length} {alertProvinces.length === 1 ? 'province' : 'provinces'} with security alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alertProvinces.map((province) => (
                <StatusWidget key={province.id} provinceId={province.id} />
              ))}
            </div>
            <div className="mt-4 flex justify-end">
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
      
      {/* Data Source Updates Section */}
      <DataSourceUpdates />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleGlobeMap />
        
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Toronto Police Data</CardTitle>
              <CardDescription>
                Explore detailed reports from Toronto Police Service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm">
                Access our detailed database of Toronto Police incidents with filtering, mapping, and analysis tools.
              </p>
              <div className="flex justify-end">
                <Link to="/toronto-data">
                  <Button size="sm" className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    <span>Explore Toronto Data</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-success/20 bg-success/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Canada Open Data Portal</CardTitle>
              <CardDescription>
                Access public data from the Open Government Portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm">
                Explore datasets from Canada's Open Government Portal, including data from provinces and municipalities.
              </p>
              <div className="flex justify-end">
                <Link to="/open-data">
                  <Button size="sm" variant="outline" className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span>Explore Open Data</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <IncidentsList />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
