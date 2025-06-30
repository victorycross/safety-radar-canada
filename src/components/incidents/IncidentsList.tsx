
import React from 'react';
import { AlertLevel, IncidentSource, VerificationStatus } from '@/types';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Info, CheckCircle, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';

const IncidentsList = () => {
  const { incidents, provinces, loading } = useSupabaseDataContext();
  
  // Sort incidents by timestamp, most recent first
  const sortedIncidents = [...incidents].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  const getAlertLevelBadge = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
      case AlertLevel.SEVERE:
        return (
          <Badge className="bg-danger hover:bg-danger/90">
            <AlertCircle className="mr-1 h-3 w-3" />
            Severe
          </Badge>
        );
      case AlertLevel.WARNING:
        return (
          <Badge className="bg-warning hover:bg-warning/90">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Warning
          </Badge>
        );
      case AlertLevel.NORMAL:
        return (
          <Badge className="bg-success hover:bg-success/90">
            <Info className="mr-1 h-3 w-3" />
            Normal
          </Badge>
        );
    }
  };
  
  const getVerificationBadge = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return (
          <Badge variant="outline" className="text-success border-success">
            <CheckCircle className="mr-1 h-3 w-3" />
            Verified
          </Badge>
        );
      case VerificationStatus.UNVERIFIED:
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Unverified
          </Badge>
        );
    }
  };
  
  const getSourceBadge = (source: IncidentSource) => {
    return (
      <Badge variant="secondary" className="bg-secondary/50">
        {source}
      </Badge>
    );
  };
  
  const formatDate = (timestamp: string | Date) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getProvinceName = (provinceId: string) => {
    const province = provinces.find(p => p.id === provinceId);
    return province ? province.name : provinceId;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Recent Incidents</h2>
          <p className="text-sm text-muted-foreground">
            Loading incidents...
          </p>
        </div>
        
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (sortedIncidents.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Recent Incidents</h2>
          <p className="text-sm text-muted-foreground">
            No incidents to display
          </p>
        </div>
        
        <Card className="text-center py-8 border-2 border-dashed rounded-lg">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-lg font-medium">No incidents found</p>
          <p className="text-muted-foreground">
            There are currently no incidents in the system
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold">Recent Incidents</h2>
        <p className="text-sm text-muted-foreground">
          Showing {sortedIncidents.length} incidents across all provinces
        </p>
      </div>
      
      {sortedIncidents.map((incident) => (
        <Card key={incident.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <div>
                <CardTitle className="text-lg">{incident.title}</CardTitle>
                <CardDescription>
                  {formatDate(incident.timestamp)} • {getProvinceName(incident.provinceId)}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                {getAlertLevelBadge(incident.alertLevel)}
                {getVerificationBadge(incident.verificationStatus)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-3">{incident.description}</p>
            
            <div className="flex justify-between items-center">
              <div>
                {getSourceBadge(incident.source)}
              </div>
              
              {incident.recommendedAction && (
                <div className="text-sm">
                  <span className="font-medium">Recommended action:</span> {incident.recommendedAction}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default IncidentsList;
