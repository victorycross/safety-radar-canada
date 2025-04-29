
import React, { useEffect, useRef, useState } from 'react';
import { useSecurity } from '@/context/SecurityContext';
import { AlertLevel } from '@/types';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Circle, Globe, Map } from 'lucide-react';
import { Link } from 'react-router-dom';

const SimpleGlobeMap = () => {
  const { provinces } = useSecurity();
  const globeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState({ x: 20, y: -10 });
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  // Add event listeners for dragging and rotating the globe
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      setIsDragging(true);
      setStartPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      // Calculate rotation change based on mouse movement
      const deltaX = e.clientX - startPosition.x;
      const deltaY = e.clientY - startPosition.y;
      
      setRotation(prev => ({
        x: prev.x + deltaY * 0.5,
        y: prev.y + deltaX * 0.5
      }));
      
      setStartPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const globe = globeRef.current;
    if (globe) {
      globe.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (globe) {
        globe.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startPosition]);

  // Auto-rotation effect
  useEffect(() => {
    const autoRotate = !isDragging;
    
    if (autoRotate) {
      const interval = setInterval(() => {
        setRotation(prev => ({
          x: prev.x,
          y: prev.y + 0.2
        }));
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [isDragging]);

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

  // Function to get approximate marker positions for Canadian provinces
  const getProvincePosition = (provinceId: string): { top: string, left: string } => {
    // Position percentages for approximate province locations on the globe
    const positions: Record<string, { top: string, left: string }> = {
      bc: { top: '38%', left: '18%' }, // British Columbia
      ab: { top: '38%', left: '23%' }, // Alberta
      sk: { top: '38%', left: '28%' }, // Saskatchewan
      mb: { top: '38%', left: '33%' }, // Manitoba
      on: { top: '39%', left: '38%' }, // Ontario
      qc: { top: '36%', left: '43%' }, // Quebec
      nb: { top: '36%', left: '48%' }, // New Brunswick
      ns: { top: '39%', left: '50%' }, // Nova Scotia
      pe: { top: '35%', left: '49%' }, // Prince Edward Island
      nl: { top: '32%', left: '52%' }, // Newfoundland and Labrador
      yt: { top: '28%', left: '16%' }, // Yukon
      nt: { top: '28%', left: '22%' }, // Northwest Territories
      nu: { top: '25%', left: '35%' }, // Nunavut
    };
    
    return positions[provinceId] || { top: '50%', left: '50%' };
  };

  // Filter provinces with alerts
  const provincesWithAlerts = provinces.filter(
    province => province.alertLevel !== AlertLevel.NORMAL
  );

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <div className="mb-4 p-4 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Canada Security Map</h2>
            <p className="text-sm text-muted-foreground">Provincial security status overview</p>
          </div>
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-muted-foreground mr-1" />
            <span className="text-sm text-muted-foreground">Interactive Globe</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-[400px] w-full overflow-hidden">
        {/* The globe container with rotation applied */}
        <div 
          ref={globeRef}
          className="globe-container absolute inset-0 flex items-center justify-center cursor-grab"
          style={{ perspective: '1000px' }}
        >
          <div 
            className="globe relative rounded-full"
            style={{ 
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              width: '350px',
              height: '350px',
            }}
          >
            {/* North America highlight - approximating Canada's position */}
            <div className="canada-highlight absolute" style={{
              top: '25%',
              left: '20%',
              width: '35%',
              height: '25%',
              borderRadius: '50%',
              background: 'rgba(148, 163, 184, 0.3)',
              pointerEvents: 'none',
              zIndex: 2
            }}></div>
            
            {/* Alert markers */}
            {provincesWithAlerts.map(province => {
              const position = getProvincePosition(province.id);
              const markerColor = province.alertLevel === AlertLevel.SEVERE ? 'bg-danger' : 'bg-warning';
              
              return (
                <div 
                  key={province.id}
                  className={`absolute w-3 h-3 rounded-full ${markerColor} pulse-dot z-10`}
                  style={{
                    top: position.top,
                    left: position.left
                  }}
                  title={`${province.name}: ${province.alertLevel === AlertLevel.SEVERE ? 'Severe Alert' : 'Warning'}`}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
      
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

export default SimpleGlobeMap;
