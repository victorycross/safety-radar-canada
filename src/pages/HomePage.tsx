
import React from 'react';
import CanadaMap from '@/components/map/CanadaMap';
import IncidentsList from '@/components/incidents/IncidentsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import StatusWidget from '@/components/dashboard/StatusWidget';
import { useSecurity } from '@/context/SecurityContext';
import { AlertLevel } from '@/types';

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
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CanadaMap />
        
        <div className="space-y-6">
          <IncidentsList />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
