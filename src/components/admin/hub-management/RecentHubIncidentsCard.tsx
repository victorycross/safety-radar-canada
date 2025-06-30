
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { InternationalHub, HubIncident } from '@/types/dashboard';
import { AlertLevel } from '@/types';

interface RecentHubIncidentsCardProps {
  incidents: HubIncident[];
  hubs: InternationalHub[];
  getAlertLevelColor: (level: AlertLevel) => string;
  getAlertLevelText: (level: AlertLevel) => string;
}

const RecentHubIncidentsCard: React.FC<RecentHubIncidentsCardProps> = ({
  incidents,
  hubs,
  getAlertLevelColor,
  getAlertLevelText
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Hub Incidents</span>
          <Badge variant="outline">{incidents.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {incidents.length > 0 ? (
          <div className="space-y-4">
            {incidents.slice(0, 5).map((incident) => {
              const hub = hubs.find(h => h.id === incident.hubId);
              return (
                <div key={incident.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {hub?.flagEmoji} {hub?.name}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`${getAlertLevelColor(incident.alertLevel)} text-white text-xs`}
                        >
                          {getAlertLevelText(incident.alertLevel)}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-gray-900">{incident.title}</h3>
                      {incident.description && (
                        <p className="text-sm text-gray-600 mt-1">{incident.description}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Source: {incident.source}</span>
                        <span>Status: {incident.verificationStatus}</span>
                        <span>{new Date(incident.timestamp).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Incidents</h3>
            <p className="text-gray-600">No hub incidents have been recorded.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentHubIncidentsCard;
