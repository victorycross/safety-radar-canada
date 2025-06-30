
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Users, AlertTriangle, FileText } from 'lucide-react';

const QuickActionsSection: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button variant="outline" className="justify-start">
            <Download className="h-4 w-4 mr-2" />
            Export All Hub Data
          </Button>
          <Button variant="outline" className="justify-start">
            <Users className="h-4 w-4 mr-2" />
            Generate Employee Report
          </Button>
          <Button variant="outline" className="justify-start">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Export Alert Summary
          </Button>
          <Button variant="outline" className="justify-start">
            <FileText className="h-4 w-4 mr-2" />
            Create Hub Audit Log
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsSection;
