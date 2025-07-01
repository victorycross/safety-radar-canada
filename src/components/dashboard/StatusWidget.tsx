
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { AlertLevel } from "@/types";
import { Badge } from "../ui/badge";
import { useSupabaseDataContext } from "@/context/SupabaseDataProvider";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Eye, AlertTriangle, Archive } from "lucide-react";
import { useSecurity } from "@/context/SecurityContext";
import ArchiveAlertDialog from "./ArchiveAlertDialog";
import { useArchiveAlerts } from "@/hooks/useArchiveAlerts";

interface StatusWidgetProps {
  provinceId: string;
  onViewAlerts?: (provinceId: string, provinceName: string) => void;
}

const StatusWidget: React.FC<StatusWidgetProps> = ({ provinceId, onViewAlerts }) => {
  const { getProvinceById, getIncidentsByProvince, loading, refreshData } = useSupabaseDataContext();
  const { user } = useSecurity();
  const { archiveIncidents } = useArchiveAlerts();
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  
  if (loading) {
    return <StatusWidgetSkeleton />;
  }
  
  const province = getProvinceById(provinceId);
  const incidents = getIncidentsByProvince(provinceId);
  const activeIncidents = incidents.filter(incident => !incident.archived_at);
  
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
        return "bg-red-500";
      case AlertLevel.WARNING:
        return "bg-orange-500";
      case AlertLevel.NORMAL:
        return "bg-green-500";
      default:
        return "bg-gray-400";
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
  const recentIncident = activeIncidents.length > 0 
    ? activeIncidents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0] 
    : null;
  
  // Format current date for display
  const currentDate = new Date().toLocaleString('en-CA', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const handleViewAlerts = () => {
    if (onViewAlerts) {
      onViewAlerts(provinceId, province.name);
    }
  };

  const handleArchiveComplete = () => {
    refreshData();
    setShowArchiveDialog(false);
  };
  
  const canArchive = user?.isAuthorized && activeIncidents.length > 0;
  
  return (
    <>
      <Card className="cursor-pointer transition-all hover:shadow-md">
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
            Last updated: {currentDate}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleViewAlerts}>
              <Eye className="h-3 w-3 mr-1" />
              View Alerts
            </Button>
            {canArchive && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowArchiveDialog(true)}
                className="text-orange-600 hover:text-orange-700"
              >
                <Archive className="h-3 w-3 mr-1" />
                Archive
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <ArchiveAlertDialog
        open={showArchiveDialog}
        onOpenChange={setShowArchiveDialog}
        incidents={activeIncidents}
        locationName={province.name}
        onArchiveComplete={handleArchiveComplete}
      />
    </>
  );
};

const StatusWidgetSkeleton = () => (
  <Card>
    <CardHeader className="bg-muted">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-4 w-28 mt-1" />
    </CardHeader>
    <CardContent className="pt-6">
      <Skeleton className="h-4 w-full mb-4" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6 mt-2" />
    </CardContent>
    <CardFooter className="flex justify-between border-t pt-4">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="h-3 w-24" />
    </CardFooter>
  </Card>
);

export default StatusWidget;
