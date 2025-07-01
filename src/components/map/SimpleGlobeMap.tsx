
import React, { useState } from 'react';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { Card } from '../ui/card';
import { Map, AlertTriangle } from 'lucide-react';
import { provincePositions } from './mapConstants';
import ProvinceOverlay from './ProvinceOverlay';
import MapLegend from './MapLegend';
import ProvinceCard from './ProvinceCard';

const SimpleGlobeMap = () => {
  const { provinces, incidents } = useSupabaseDataContext();
  const [activeProvinceId, setActiveProvinceId] = useState<string | null>(null);

  // Get all incidents for a specific province
  const getIncidentsForProvince = (provinceId: string) => {
    return incidents.filter(incident => incident.provinceId === provinceId);
  };

  // Show province information on hover
  const handleProvinceHover = (provinceId: string | null) => {
    setActiveProvinceId(provinceId);
  };

  // Filter provinces with actual employee data
  const provincesWithEmployees = provinces.filter(p => p.employeeCount > 0);

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <div className="mb-4 p-4 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Canada Security Map</h2>
            <p className="text-sm text-muted-foreground">Provincial security status overview</p>
          </div>
          <div className="flex items-center">
            <Map className="h-5 w-5 text-muted-foreground mr-1" />
            <span className="text-sm text-muted-foreground">Interactive Map</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-[500px] w-full overflow-hidden p-4">
        <div className="canada-map-container h-full w-full relative">
          {/* Base image of Canada */}
          <img 
            src="/lovable-uploads/baf68e9a-1d80-4327-ac1c-6ee360585f04.png" 
            alt="Map of Canada showing provinces and territories" 
            className="w-full h-full object-contain"
          />
          
          {/* Interactive province overlays */}
          <div className="absolute inset-0">
            {provinces.map(province => (
              <ProvinceOverlay
                key={province.id}
                province={province}
                position={provincePositions[province.id as keyof typeof provincePositions]}
                incidents={getIncidentsForProvince(province.id)}
                activeProvinceId={activeProvinceId}
                onHover={handleProvinceHover}
              />
            ))}
          </div>
        </div>
        
        {/* Map legend component */}
        <MapLegend />
      </div>
      
      {/* Province cards at the bottom */}
      <div className="mt-4 p-4">
        {provincesWithEmployees.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {provincesWithEmployees.map((province) => (
              <ProvinceCard key={province.id} province={province} />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="text-lg font-semibold mb-2">No Employee Data Available</h3>
            <p className="text-muted-foreground">
              Employee distribution data will appear here once it's been entered through the admin interface.
            </p>
          </Card>
        )}
      </div>
    </Card>
  );
};

export default SimpleGlobeMap;
