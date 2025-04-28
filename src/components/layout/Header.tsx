
import { Button } from "@/components/ui/button";
import { useSecurity } from "@/context/SecurityContext";
import { AlertLevel } from "@/types";
import { Bell, User } from "lucide-react";

const Header = () => {
  const { provinces } = useSecurity();
  
  // Get count of provinces by alert level
  const severeCount = provinces.filter(p => p.alertLevel === AlertLevel.SEVERE).length;
  const warningCount = provinces.filter(p => p.alertLevel === AlertLevel.WARNING).length;
  
  return (
    <header className="bg-white border-b p-4 flex justify-between items-center">
      <div>
        <h1 className="font-bold text-xl">Security Barometer</h1>
        <p className="text-sm text-muted-foreground">Canadian Operations Security Dashboard</p>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          {severeCount > 0 && (
            <div className="mr-3 flex items-center">
              <span className="h-3 w-3 rounded-full bg-danger mr-1"></span>
              <span className="text-sm text-danger font-medium">{severeCount} Severe</span>
            </div>
          )}
          
          {warningCount > 0 && (
            <div className="mr-3 flex items-center">
              <span className="h-3 w-3 rounded-full bg-warning mr-1"></span>
              <span className="text-sm text-warning font-medium">{warningCount} Warning</span>
            </div>
          )}
        </div>
        
        <Button variant="outline" size="icon">
          <Bell size={18} />
        </Button>
        
        <Button variant="outline" size="icon">
          <User size={18} />
        </Button>
      </div>
    </header>
  );
};

export default Header;
