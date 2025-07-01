
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

// This component has been removed as part of dummy data cleanup
// All data should come from real sources or user input
const TestingSampleData = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Testing Data Removed
        </CardTitle>
        <CardDescription>
          Sample data functionality has been removed. All data should come from real sources.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            To populate the system with data, please use the actual data entry interfaces 
            or import real data through the bulk operations section.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestingSampleData;
