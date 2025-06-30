
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const QuickActions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common troubleshooting steps</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Refresh Application
        </Button>
        <Button variant="outline" onClick={() => localStorage.clear()}>
          Clear Local Storage
        </Button>
        <Button variant="outline" onClick={() => console.clear()}>
          Clear Console
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
