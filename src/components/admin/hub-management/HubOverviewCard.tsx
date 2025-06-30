
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InternationalHub } from '@/types/dashboard';
import { AlertLevel } from '@/types';

interface HubOverviewCardProps {
  hubs: InternationalHub[];
  selectedHub: string | null;
  onHubSelect: (hubId: string | null) => void;
  getAlertLevelColor: (level: AlertLevel) => string;
  getAlertLevelText: (level: AlertLevel) => string;
}

const HubOverviewCard: React.FC<HubOverviewCardProps> = ({
  hubs,
  selectedHub,
  onHubSelect,
  getAlertLevelColor,
  getAlertLevelText
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>International Hubs</span>
          <Badge variant="outline">{hubs.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hubs.map((hub) => (
            <div key={hub.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{hub.flagEmoji}</span>
                <div>
                  <h3 className="font-medium">{hub.name}</h3>
                  <p className="text-sm text-gray-600">{hub.country} • {hub.code}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-sm font-bold">{hub.employeeCount}</div>
                  <div className="text-xs text-gray-600">Employees</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold">{hub.localIncidents}</div>
                  <div className="text-xs text-gray-600">Incidents</div>
                </div>
                <Badge
                  variant="secondary"
                  className={`${getAlertLevelColor(hub.alertLevel)} text-white`}
                >
                  {getAlertLevelText(hub.alertLevel)}
                </Badge>
                <div className="flex items-center space-x-2">
                  <Link to={`/hub/${hub.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onHubSelect(selectedHub === hub.id ? null : hub.id)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hubs.length === 0 && (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No International Hubs</h3>
            <p className="text-gray-600 mb-4">No international hubs are currently configured.</p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add First Hub
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HubOverviewCard;
