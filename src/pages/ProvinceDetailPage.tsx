
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSecurity } from "@/context/SecurityContext";
import { AlertLevel } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Users } from "lucide-react";
import IncidentForm from "@/components/forms/IncidentForm";

const ProvinceDetailPage = () => {
  const { provinceId } = useParams<{ provinceId: string }>();
  const navigate = useNavigate();
  const { getProvinceById, getIncidentsByProvince } = useSecurity();
  
  const province = provinceId ? getProvinceById(provinceId) : undefined;
  const incidents = provinceId ? getIncidentsByProvince(provinceId) : [];

  if (!province) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle>Province Not Found</CardTitle>
            <CardDescription>The requested province information could not be found.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const getAlertBadge = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
      case AlertLevel.SEVERE:
        return <Badge className="bg-danger">Severe Risk</Badge>;
      case AlertLevel.WARNING:
        return <Badge className="bg-warning">Warning</Badge>;
      case AlertLevel.NORMAL:
        return <Badge className="bg-success">Normal</Badge>;
    }
  };

  // Sort incidents by date, newest first
  const sortedIncidents = [...incidents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
      </Button>
      
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{province.name}</h1>
          <div className="flex items-center space-x-3 mt-1">
            {getAlertBadge(province.alertLevel)}
            <div className="flex items-center text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>{province.employeeCount.toLocaleString()} employees</span>
            </div>
          </div>
        </div>
      </div>
      
      {province.alertLevel !== AlertLevel.NORMAL && (
        <Card className={province.alertLevel === AlertLevel.SEVERE ? "border-danger bg-danger-light" : "border-warning bg-warning-light"}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <AlertTriangle className={`mr-2 ${province.alertLevel === AlertLevel.SEVERE ? "text-danger" : "text-warning"}`} />
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
              <CardTitle>Recent Incidents in {province.name}</CardTitle>
              <CardDescription>
                {incidents.length} incident{incidents.length !== 1 ? 's' : ''} reported
              </CardDescription>
            </CardHeader>
            <CardContent>
              {incidents.length > 0 ? (
                <div className="space-y-4">
                  {sortedIncidents.map(incident => (
                    <div key={incident.id} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{incident.title}</h3>
                        {getAlertBadge(incident.alertLevel)}
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
          <Card>
            <CardHeader>
              <CardTitle>Report Incident</CardTitle>
              <CardDescription>Report a new incident in {province.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <IncidentForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProvinceDetailPage;
