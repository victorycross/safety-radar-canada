
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DailyWidget from "@/components/dashboard/DailyWidget";
import { Download } from "lucide-react";

const WidgetPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Desktop Widget</h1>
        <p className="text-muted-foreground">Security status widget for employee desktop installation</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Widget Preview</CardTitle>
            <CardDescription>Preview of the desktop security status widget with check-in capability</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6 bg-slate-100 rounded-md">
            <DailyWidget />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Installation Instructions</CardTitle>
            <CardDescription>How to install the Security Barometer widget on your desktop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Requirements</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Windows 10/11 or macOS 10.14+</li>
                <li>Administrator privileges for installation</li>
                <li>Active company network access</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Installation Steps</h3>
              <ol className="list-decimal pl-5 space-y-2 text-sm">
                <li>Download the widget installer using the button below</li>
                <li>Run the installer and follow the on-screen prompts</li>
                <li>When prompted, enter your employee ID for region assignment</li>
                <li>Choose your widget position preference (top-right, bottom-left, etc.)</li>
                <li>Click "Complete Installation"</li>
              </ol>
            </div>
            
            <div className="pt-2">
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download Widget Installer
              </Button>
            </div>
            
            <div className="bg-muted p-3 rounded-md text-sm mt-4">
              <p><strong>Note:</strong> The Security Barometer widget automatically updates in real-time 
              when new security alerts are published for your region. Daily check-ins are required
              to confirm your safety status during high-alert situations.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WidgetPage;
