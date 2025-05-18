
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { AlertLevel } from "@/types";
import { useSecurity } from "@/context/SecurityContext";
import { Badge } from "../ui/badge";

interface StatusWidgetProps {
  provinceId: string;
}

const StatusWidget: React.FC<StatusWidgetProps> = ({ provinceId }) => {
  const { getProvinceById, getIncidentsByProvince } = useSecurity();
  
  const province = getProvinceById(provinceId);
  const incidents = getIncidentsByProvince(provinceId);
  
  if (!province) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Region Not Found</CardTitle>
        </CardHeader>
      </Card>
    );
  }
  
  const getStatusColor = () => {
    switch (province.alertLevel) {
      case AlertLevel.SEVERE:
        return "bg-danger";
      case AlertLevel.WARNING:
        return "bg-warning";
      case AlertLevel.NORMAL:
        return "bg-success";
      default:
        return "bg-muted";
    }
  };
  
  const getStatusText = () => {
    switch (province.alertLevel) {
      case AlertLevel.SEVERE:
        return "Take Action Required";
      case AlertLevel.WARNING:
        return "Exercise Caution";
      case AlertLevel.NORMAL:
        return "No Known Issues";
      default:
        return "Unknown Status";
    }
  };
  
  // Get most recent incident if exists
  const recentIncident = incidents.length > 0 
    ? incidents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] 
    : null;
  
  return (
    <Card>
      <CardHeader className={`${getStatusColor()} text-white`}>
        <CardTitle className="flex justify-between items-center">
          <span>{province.name} Status</span>
          <Badge variant="outline" className="border-white text-white">
            {province.employeeCount} Employees
          </Badge>
        </CardTitle>
        <CardDescription className="text-white/90">
          {getStatusText()}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {recentIncident ? (
          <div>
            <div className="font-medium">{recentIncident.title}</div>
            <p className="text-sm text-muted-foreground mt-1">{recentIncident.description}</p>
            
            {recentIncident.recommendedAction && (
              <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                <span className="font-medium">Recommended action:</span> {recentIncident.recommendedAction}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            No recent incidents reported
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleString('en-CA')}
        </div>
        <div className="text-xs font-medium">
          Security Barometer
        </div>
      </CardFooter>
    </Card>
  );
};

export default StatusWidget;
