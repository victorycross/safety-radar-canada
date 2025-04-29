
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSecurity } from '@/context/SecurityContext';
import { AlertLevel } from '@/types';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Circle, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

// This should be replaced with your Mapbox public token
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94LWdoLXRlc3QiLCJhIjoiY2w4MjZrc3RmMGJudDN2bGc1YzJlZDFzYiJ9.PKUUoJk1xIIRUoBLl8xgsA';

const GlobeMap = () => {
  const { provinces } = useSecurity();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapboxToken, setMapboxToken] = useState(MAPBOX_TOKEN);

  const getAlertLevelBadge = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
      case AlertLevel.SEVERE:
        return (
          <Badge className="bg-danger hover:bg-danger/90">Severe</Badge>
        );
      case AlertLevel.WARNING:
        return (
          <Badge className="bg-warning hover:bg-warning/90">Warning</Badge>
        );
      case AlertLevel.NORMAL:
        return (
          <Badge className="bg-success hover:bg-success/90">Normal</Badge>
        );
    }
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      // Initialize map
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        projection: 'globe',
        zoom: 3,
        center: [-95, 60], // Centered on Canada
        pitch: 45,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Disable scroll zoom for smoother experience
      map.current.scrollZoom.disable();

      // Add atmosphere and fog effects
      map.current.on('style.load', () => {
        map.current?.setFog({
          color: 'rgb(255, 255, 255)',
          'high-color': 'rgb(200, 200, 225)',
          'horizon-blend': 0.2,
        });

        // Add markers for provinces with alerts
        provinces.forEach(province => {
          // This is a simplified mapping - in a real app you'd have more precise coordinates
          const coordinates = getProvinceCoordinates(province.id);
          if (coordinates && province.alertLevel !== AlertLevel.NORMAL) {
            const el = document.createElement('div');
            el.className = `w-4 h-4 rounded-full ${getMarkerColor(province.alertLevel)} pulse-dot`;
            
            new mapboxgl.Marker(el)
              .setLngLat(coordinates)
              .setPopup(new mapboxgl.Popup({ offset: 25 })
                .setHTML(`<strong>${province.name}</strong><br>Status: ${getAlertLevelText(province.alertLevel)}`))
              .addTo(map.current!);
          }
        });

        setMapInitialized(true);
      });

    } catch (error) {
      console.error("Error initializing map:", error);
    }

    // Cleanup
    return () => {
      map.current?.remove();
    };
  }, [provinces, mapboxToken]);

  // Helper functions for map markers
  const getProvinceCoordinates = (provinceId: string): [number, number] | null => {
    // Approximate coordinates for Canadian provinces
    const coordinates: Record<string, [number, number]> = {
      bc: [-123.3656, 48.4284], // Victoria
      ab: [-113.4909, 53.5444], // Edmonton
      sk: [-104.6189, 50.4452], // Regina
      mb: [-97.1385, 49.8951], // Winnipeg
      on: [-79.3832, 43.6532], // Toronto
      qc: [-71.2082, 46.8139], // Quebec City
      nb: [-66.6432, 45.9636], // Fredericton
      ns: [-63.5724, 44.6476], // Halifax
      pe: [-63.1311, 46.2382], // Charlottetown
      nl: [-52.7125, 47.5615], // St. John's
      yt: [-135.0568, 60.7212], // Whitehorse
      nt: [-114.3718, 62.4540], // Yellowknife
      nu: [-68.5167, 64.2823], // Iqaluit
    };
    
    return coordinates[provinceId] || null;
  };

  const getMarkerColor = (alertLevel: AlertLevel): string => {
    switch (alertLevel) {
      case AlertLevel.SEVERE:
        return 'bg-danger';
      case AlertLevel.WARNING:
        return 'bg-warning';
      default:
        return 'bg-success';
    }
  };

  const getAlertLevelText = (alertLevel: AlertLevel): string => {
    switch (alertLevel) {
      case AlertLevel.SEVERE:
        return 'Severe Alert';
      case AlertLevel.WARNING:
        return 'Warning';
      case AlertLevel.NORMAL:
        return 'Normal';
    }
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <div className="mb-4 p-4 pb-0">
        <h2 className="text-xl font-bold">Canada Security Map</h2>
        <p className="text-sm text-muted-foreground">Provincial security status overview</p>
      </div>
      
      {!mapInitialized && (
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              Please enter your Mapbox public token to load the map. 
              You can get one at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a>
            </p>
            <input
              type="text"
              className="w-full p-2 border rounded mb-2"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              placeholder="Enter Mapbox public token"
            />
            <Button 
              onClick={() => {
                if (map.current) map.current.remove();
                map.current = null;
                setMapInitialized(false);
              }}
              size="sm"
            >
              Apply Token
            </Button>
          </div>
        </div>
      )}

      <div ref={mapContainer} className="h-[400px] w-full rounded-lg overflow-hidden" />
      
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {provinces.filter(p => p.employeeCount > 0).map((province) => (
          <div key={province.id} className="border rounded-md p-3">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">{province.name}</h3>
              {getAlertLevelBadge(province.alertLevel)}
            </div>
            
            <div className="text-sm text-muted-foreground mb-2">
              {province.employeeCount.toLocaleString()} employees
            </div>
            
            <Link to={`/province/${province.id}`}>
              <Button variant="outline" size="sm" className="w-full">
                <Circle className="mr-1 h-4 w-4" />
                View Details
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default GlobeMap;
