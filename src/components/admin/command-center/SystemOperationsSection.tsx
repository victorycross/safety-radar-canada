
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Users, Building, Download } from 'lucide-react';

const SystemOperationsSection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          System Operations
        </CardTitle>
        <CardDescription>
          Bulk operations and data management functions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline"
            className="h-auto flex-col items-center gap-2 p-4"
          >
            <Users className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Bulk Employee Management</div>
              <div className="text-xs opacity-75">Import/export employees</div>
            </div>
          </Button>

          <Button 
            variant="outline"
            className="h-auto flex-col items-center gap-2 p-4"
          >
            <Building className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Hub Operations</div>
              <div className="text-xs opacity-75">Manage international hubs</div>
            </div>
          </Button>

          <Button 
            variant="outline"
            className="h-auto flex-col items-center gap-2 p-4"
          >
            <Download className="h-6 w-6" />
            <div className="text-center">
              <div className="font-medium">Data Export</div>
              <div className="text-xs opacity-75">Export system data</div>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemOperationsSection;
