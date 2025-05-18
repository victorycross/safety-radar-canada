
import React from 'react';
import { AlertLevel, Province } from '@/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Circle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProvinceCardProps {
  province: Province;
}

const ProvinceCard = ({ province }: ProvinceCardProps) => {
  const getAlertLevelBadge = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
      case AlertLevel.SEVERE:
        return <Badge className="bg-danger hover:bg-danger/90">Severe</Badge>;
      case AlertLevel.WARNING:
        return <Badge className="bg-warning hover:bg-warning/90">Warning</Badge>;
      case AlertLevel.NORMAL:
        return <Badge className="bg-success hover:bg-success/90">Normal</Badge>;
    }
  };

  return (
    <div className="border rounded-md p-3">
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
  );
};

export default ProvinceCard;
