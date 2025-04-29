
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { AlertLevel } from "@/types";
import { useSecurity } from "@/context/SecurityContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from "../ui/use-toast";

const DailyWidget = () => {
  const { provinces } = useSecurity();
  const [selectedProvince, setSelectedProvince] = useState(provinces[0]?.id || "");
  const [checkInStatus, setCheckInStatus] = useState<"idle" | "success" | "loading">("idle");
  
  // Find the selected province
  const province = provinces.find(p => p.id === selectedProvince);
  
  const getStatusColor = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
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
  
  const getStatusText = (alertLevel: AlertLevel) => {
    switch (alertLevel) {
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

  const handleCheckIn = () => {
    setCheckInStatus("loading");
    
    // Simulate API call with timeout
    setTimeout(() => {
      setCheckInStatus("success");
      toast({
        title: "Check-in Successful",
        description: "Your security status check-in has been recorded.",
      });
      
      // Reset status after a delay
      setTimeout(() => {
        setCheckInStatus("idle");
      }, 3000);
    }, 1000);
  };

  return (
    <Card className="w-80 shadow-md">
      <CardHeader className="bg-primary/90 text-white pb-2 pt-3">
        <CardTitle className="text-base flex justify-between items-center">
          <span>Security Status</span>
          <div className="text-xs bg-white/20 rounded px-2 py-0.5">Desktop Widget</div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-3 pb-0">
        <div className="flex flex-col space-y-3">
          <div className="space-y-1">
            <Label htmlFor="province-select" className="text-xs">Select Province</Label>
            <Select value={selectedProvince} onValueChange={setSelectedProvince}>
              <SelectTrigger id="province-select" className="h-8 text-xs">
                <SelectValue placeholder="Select a province" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map(province => (
                  <SelectItem key={province.id} value={province.id} className="text-xs">
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {province && (
            <div className={`rounded-md p-3 text-white ${getStatusColor(province.alertLevel)}`}>
              <div className="text-sm font-medium flex justify-between">
                <span>Current Status:</span>
                <span>{getStatusText(province.alertLevel)}</span>
              </div>
              <div className="text-xs mt-1">
                {province.employeeCount} employees in region
              </div>
            </div>
          )}
          
          <div className="pt-1">
            <Button 
              onClick={handleCheckIn} 
              disabled={checkInStatus !== "idle"}
              className="w-full h-9 bg-primary hover:bg-primary/90 text-white"
            >
              {checkInStatus === "loading" ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Checking in...
                </span>
              ) : checkInStatus === "success" ? (
                <span className="flex items-center">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Checked in!
                </span>
              ) : (
                "Check In Now"
              )}
            </Button>
            {checkInStatus === "success" && (
              <p className="text-xs text-center text-green-600 mt-1">Check-in recorded successfully!</p>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="text-xs text-muted-foreground justify-between pt-2 pb-3">
        <span>Last updated: 4:30 PM</span>
        <span>Security Barometer</span>
      </CardFooter>
    </Card>
  );
};

export default DailyWidget;
