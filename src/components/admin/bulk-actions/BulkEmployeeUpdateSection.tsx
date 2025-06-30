
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Users, AlertTriangle } from 'lucide-react';

interface BulkEmployeeUpdateSectionProps {
  onUpdateComplete: () => void;
}

const BulkEmployeeUpdateSection: React.FC<BulkEmployeeUpdateSectionProps> = ({ onUpdateComplete }) => {
  const [bulkEmployeeData, setBulkEmployeeData] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleBulkEmployeeUpdate = async () => {
    if (!bulkEmployeeData.trim()) return;

    setLoading(true);
    try {
      const lines = bulkEmployeeData.split('\n').filter(line => line.trim());
      
      // Simulate bulk update process
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast({
        title: 'Bulk Update Complete',
        description: `Updated employee counts for ${lines.length} hubs`,
      });

      setBulkEmployeeData('');
      onUpdateComplete();
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Please check your data format and try again',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Bulk Employee Count Update</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="employee-data">Employee Count Data</Label>
          <Textarea
            id="employee-data"
            placeholder="Enter data in format: HubID,EmployeeCount&#10;hub-1,250&#10;hub-2,180"
            value={bulkEmployeeData}
            onChange={(e) => setBulkEmployeeData(e.target.value)}
            rows={6}
          />
        </div>
        
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Format Requirements:</p>
              <ul className="mt-1 list-disc list-inside space-y-1">
                <li>One hub per line: HubID,EmployeeCount</li>
                <li>Use comma separation</li>
                <li>Hub ID must match existing hubs</li>
              </ul>
            </div>
          </div>
        </div>
        
        <Button 
          onClick={handleBulkEmployeeUpdate} 
          disabled={!bulkEmployeeData.trim() || loading}
          className="w-full"
        >
          {loading ? 'Updating...' : 'Update Employee Counts'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BulkEmployeeUpdateSection;
