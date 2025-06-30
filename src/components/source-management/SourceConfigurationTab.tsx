
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Download, Upload, Trash2 } from 'lucide-react';

const SourceConfigurationTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Global Configuration</h3>
        <p className="text-muted-foreground">Manage global settings and bulk operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Global Settings
            </CardTitle>
            <CardDescription>
              Configure default settings for all sources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              Configure Default Polling Intervals
            </Button>
            <Button variant="outline" className="w-full">
              Set Global Timeout Settings
            </Button>
            <Button variant="outline" className="w-full">
              Configure Health Check Settings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Bulk Operations
            </CardTitle>
            <CardDescription>
              Perform operations on multiple sources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Configuration
            </Button>
            <Button variant="outline" className="w-full">
              <Upload className="h-4 w-4 mr-2" />
              Import Configuration
            </Button>
            <Button variant="outline" className="w-full text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Bulk Delete Inactive
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SourceConfigurationTab;
