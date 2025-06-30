
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Shield, Bell } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import RealtimeStatus from "@/components/ui/RealtimeStatus";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  totalProvinces: number;
  alertCount: number;
  onSettingsClick?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  totalProvinces,
  alertCount,
  onSettingsClick
}) => {
  const { user, securityScore, isAdmin } = useAuth();
  const navigate = useNavigate();

  const getSecurityBadgeColor = () => {
    if (securityScore >= 80) return 'default';
    if (securityScore >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h1 className="text-3xl font-bold">Security Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Monitoring {totalProvinces} provinces
          {alertCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {alertCount} alerts
            </Badge>
          )}
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Real-time Status */}
        <RealtimeStatus />
        
        {/* Security Score */}
        {user && (
          <Badge variant={getSecurityBadgeColor()} className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Security: {securityScore}%
          </Badge>
        )}
        
        {/* Notification Bell */}
        {alertCount > 0 && (
          <Button variant="outline" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {alertCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                {alertCount > 9 ? '9+' : alertCount}
              </Badge>
            )}
          </Button>
        )}
        
        {/* Admin Security Settings */}
        {isAdmin() && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-1"
          >
            <Shield className="h-4 w-4" />
            Security
          </Button>
        )}
        
        {/* Settings */}
        <Button variant="outline" size="sm" onClick={onSettingsClick}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
