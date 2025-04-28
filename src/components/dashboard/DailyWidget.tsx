
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { AlertLevel } from "@/types";
import { useSecurity } from "@/context/SecurityContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";

const DailyWidget = () => {
  const { provinces } = useSecurity();
  const [selectedProvince, setSelectedProvince] = useState(provinces[0]?.id || "");
  
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
