
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSupabaseDataContext } from "@/context/SupabaseDataProvider";
import { AlertLevel } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Users, Shield, Activity } from "lucide-react";
import IncidentForm from "@/components/forms/IncidentForm";
import { getProvinceCodeFromId, provinceNames } from "@/services/provinceMapping";
import { useHomeData } from "@/hooks/useHomeData";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import RealtimeStatus from "@/components/ui/RealtimeStatus";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

const ProvinceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { incidents, getIncidentsByProvince } = useSupabaseDataContext();
  const { provinces, loading, error } = useHomeData();
  const { user, checkPermission } = useAuth();
  const { status } = useRealtimeUpdates();
  const { toast } = useToast();
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  
  // Enhanced logging for debugging
  useEffect(() => {
    logger.info('ProvinceDetailPage: Route parameters and data', {
      routeId: id,
      provincesCount: provinces.length,
      provinces: provinces.map(p => ({ id: p.id, name: p.name, code: p.code })),
      loading,
      error
    });
  }, [id, provinces, loading, error]);
  
  // Find province by ID using the synced data
  const province = id ? provinces.find(p => p.id === id) : undefined;
  const provinceIncidents = id ? getIncidentsByProvince(id) : [];

  logger.info('ProvinceDetailPage: Found province match', {
    requestedId: id,
    foundProvince: province ? { id: province.id, name: province.name, code: province.code } : null,
    incidentsCount: provinceIncidents.length
  });

  // Update last update time when real-time data changes
  useEffect(() => {
    if (status.lastUpdate) {
      setLastUpdateTime(status.lastUpdate);
    }
  }, [status.lastUpdate]);

  // Show notification when new incidents are added to this province
  useEffect(() => {
    const recentIncidents = provinceIncidents.filter(
      incident => new Date(incident.timestamp).getTime() > Date.now() - 30000 // Last 30 seconds
    );
    
    if (recentIncidents.length > 0 && province) {
      toast({
        title: 'New Incident',
        description: `New incident reported in ${province.name}`,
        variant: 'destructive',
      });
    }
  }, [provinceIncidents.length, province, toast]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <RealtimeStatus />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Loading Province Details...</CardTitle>
            <CardDescription>
              Fetching data for province ID: {id}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <RealtimeStatus />
        </div>
        
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Data Loading Error</CardTitle>
            <CardDescription className="text-red-600">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Province ID:</strong> {id || 'Not provided'}</p>
              <p><strong>Available Provinces:</strong> {provinces.length}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => navigate("/")} variant="outline">
                Return to Dashboard
              </Button>
              <Button onClick={() => window.location.reload()}>
                Retry Loading
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!province) {
    // Try to get province code from ID for better error messaging
    const provinceCode = id ? getProvinceCodeFromId(id) : null;
    const provinceName = provinceCode ? provinceNames[provinceCode as keyof typeof provinceNames] : null;
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <RealtimeStatus />
        </div>
        
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Province Not Found</CardTitle>
            <CardDescription className="text-yellow-700">
              {provinceName 
                ? `Province ${provinceName} data is not available in the current dataset.`
                : 'The requested province information could not be found.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Requested Province ID:</strong> {id || 'Not provided'}</p>
              {provinceCode && (
                <p><strong>Province Code:</strong> {provinceCode.toUpperCase()}</p>
              )}
              <p><strong>Available Provinces:</strong> {provinces.length}</p>
              <div className="mt-2">
                <p><strong>Available Province IDs:</strong></p>
                <div className="max-h-32 overflow-y-auto text-xs bg-white p-2 rounded border">
                  {provinces.map(p => (
                    <div key={p.id} className="flex justify-between">
                      <span>{p.name}</span>
                      <span className="text-gray-500">{p.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => navigate("/")} variant="outline">
                Return to Dashboard
              </Button>
              <Button onClick={() => window.location.reload()}>
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const getAlertBadge = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
      case AlertLevel.SEVERE:
        return <Badge variant="destructive">Severe Risk</Badge>;
      case AlertLevel.WARNING:
        return <Badge className="bg-yellow-500 text-white">Warning</Badge>;
      case AlertLevel.NORMAL:
        return <Badge className="bg-green-500 text-white">Normal</Badge>;
    }
  };

  // Sort incidents by date, newest first
  const sortedIncidents = [...provinceIncidents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        <div className="flex items-center gap-3">
          <RealtimeStatus />
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Last updated: {lastUpdateTime.toLocaleTimeString()}
          </Badge>
        </div>
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{province.name}</h1>
          <div className="flex items-center space-x-3 mt-1">
            {getAlertBadge(province.alertLevel)}
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>{province.employeeCount.toLocaleString()} employees</span>
            </div>
            {user && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {checkPermission('manage_incidents') ? 'Manager' : 'Viewer'}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      {province.alertLevel !== AlertLevel.NORMAL && (
        <Card className={province.alertLevel === AlertLevel.SEVERE ? "border-red-500 bg-red-50" : "border-yellow-500 bg-yellow-50"}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <AlertTriangle className={`mr-2 ${province.alertLevel === AlertLevel.SEVERE ? "text-red-500" : "text-yellow-500"}`} />
              {province.alertLevel === AlertLevel.SEVERE ? "Severe Risk Alert" : "Warning Alert"}
            </CardTitle>
            <CardDescription>
              {province.alertLevel === AlertLevel.SEVERE 
                ? "Immediate action required - security situation critical" 
                : "Exercise caution - potential security concerns in this region"}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Incidents in {province.name}</CardTitle>
                  <CardDescription>
                    {provinceIncidents.length} incident{provinceIncidents.length !== 1 ? 's' : ''} reported
                  </CardDescription>
                </div>
                {status.isConnected && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Live Updates
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {provinceIncidents.length > 0 ? (
                <div className="space-y-4">
                  {sortedIncidents.map(incident => (
                    <div key={incident.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{incident.title}</h3>
                        <div className="flex items-center gap-2">
                          {getAlertBadge(incident.alertLevel)}
                          {/* Show if incident is very recent (less than 5 minutes old) */}
                          {new Date(incident.timestamp).getTime() > Date.now() - 5 * 60 * 1000 && (
                            <Badge variant="secondary" className="text-xs">New</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm mb-2">{incident.description}</p>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <div>
                          Source: {incident.source}
                        </div>
                        <div>
                          {new Date(incident.timestamp).toLocaleString('en-CA')}
                        </div>
                      </div>
                      {incident.recommendedAction && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <span className="font-medium">Recommended action:</span> {incident.recommendedAction}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No incidents reported in this province
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          {user && checkPermission('write') && (
            <Card>
              <CardHeader>
                <CardTitle>Report Incident</CardTitle>
                <CardDescription>Report a new incident in {province.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <IncidentForm />
              </CardContent>
            </Card>
          )}
          
          {!user && (
            <Card>
              <CardHeader>
                <CardTitle>Authentication Required</CardTitle>
                <CardDescription>Sign in to report incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/auth')} className="w-full">
                  Sign In
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProvinceDetailPage;
