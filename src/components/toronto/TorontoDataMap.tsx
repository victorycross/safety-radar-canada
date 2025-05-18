
import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card } from "@/components/ui/card";

// This is a public demo token, would need to be replaced with a proper token in production
// for a real application
const MAPBOX_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY2xxZ3Fhazh0MDFvazJpbDZkZTcyaDdnMCJ9.diDf22ThgnlDPFmma3Gzbw";

interface TorontoIncident {
  id: string;
  event_id: string | null;
  category: string | null;
  division: string | null;
  occurrence_date: string | null;
  premises_type: string | null;
  neighborhood: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface TorontoDataMapProps {
  incidents: TorontoIncident[];
}

const TorontoDataMap: React.FC<TorontoDataMapProps> = ({ incidents }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // Toronto coordinates for map center
  const torontoCoords = { lat: 43.651070, lng: -79.347015 };

  useEffect(() => {
    // Initialize map only once
    if (!map.current && mapContainer.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [torontoCoords.lng, torontoCoords.lat],
        zoom: 10
      });
      
      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      map.current.on('load', () => {
        setMapInitialized(true);
      });
    }
    
    return () => {
      if (map.current) {
        // Clean up map on component unmount
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Add markers when map is ready or when incidents change
  useEffect(() => {
    if (mapInitialized && map.current) {
      // Remove any existing markers
      const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
      existingMarkers.forEach(marker => marker.remove());
      
      // Add a marker for each incident with valid coordinates
      incidents.forEach(incident => {
        if (incident.latitude && incident.longitude) {
          // Create popup content
          const popupContent = document.createElement('div');
          popupContent.innerHTML = `
            <div class="p-2 max-w-xs">
              <h3 class="font-bold">${incident.category || 'Unknown Incident'}</h3>
              <p class="text-sm mt-1">${incident.neighborhood || 'Unknown area'}</p>
              <p class="text-sm text-muted-foreground mt-1">
                ${incident.division ? `Division: ${incident.division}` : ''}
                ${incident.premises_type ? `<br>Premises: ${incident.premises_type}` : ''}
              </p>
            </div>
          `;
          
          // Create a popup
          const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent);
          
          // Create a marker
          new mapboxgl.Marker()
            .setLngLat([incident.longitude, incident.latitude])
            .setPopup(popup)
            .addTo(map.current!);
        }
      });
      
      // If we have incidents with coordinates, fit the map to their bounds
      const validIncidents = incidents.filter(
        inc => inc.latitude && inc.longitude
      );
      
      if (validIncidents.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        
        validIncidents.forEach(incident => {
          if (incident.latitude && incident.longitude) {
            bounds.extend([incident.longitude, incident.latitude]);
          }
        });
        
        map.current.fitBounds(bounds, {
          padding: 50,
          maxZoom: 15
        });
      }
    }
  }, [incidents, mapInitialized]);
  
  return (
    <Card>
      <div 
        ref={mapContainer} 
        className="h-[500px] w-full rounded-md"
        style={{ background: "#f0f0f0" }} 
      >
        {!mapInitialized && (
          <div className="flex h-full justify-center items-center text-muted-foreground">
            Loading map...
          </div>
        )}
      </div>
    </Card>
  );
};

export default TorontoDataMap;
