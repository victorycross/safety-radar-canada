
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { updateEmployeeCount, fetchEmployeeHistory, EmployeeHistoryEntry } from '@/services/employeeService';
import { toast } from '@/components/ui/use-toast';
import { AlertTriangle, History, Save, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import BulkEmployeeManagement from './BulkEmployeeManagement';

const EmployeeManagementTab = () => {
  const { provinces, refreshData } = useSupabaseDataContext();
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [newEmployeeCount, setNewEmployeeCount] = useState<string>('');
  const [changeReason, setChangeReason] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [history, setHistory] = useState<EmployeeHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const selectedProvince = provinces.find(p => p.id === selectedProvinceId);

  useEffect(() => {
    if (selectedProvinceId) {
      loadHistory(selectedProvinceId);
      const province = provinces.find(p => p.id === selectedProvinceId);
      if (province) {
        setNewEmployeeCount(province.employeeCount.toString());
      }
    }
  }, [selectedProvinceId, provinces]);

  const loadHistory = async (provinceId: string) => {
    setIsLoadingHistory(true);
    try {
      const historyData = await fetchEmployeeHistory(provinceId);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: "Error",
        description: "Failed to load employee count history",
        variant: "destructive"
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedProvinceId || !newEmployeeCount) {
      toast({
        title: "Validation Error",
        description: "Please select a province and enter an employee count",
        variant: "destructive"
      });
      return;
    }

    const count = parseInt(newEmployeeCount);
    if (isNaN(count) || count < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid employee count",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      await updateEmployeeCount({
        provinceId: selectedProvinceId,
        employeeCount: count,
        changeReason: changeReason || 'Manual update via admin interface'
      });

      toast({
        title: "Success",
        description: `Employee count updated for ${selectedProvince?.name}`,
      });

      // Refresh data and reload history
      await refreshData();
      await loadHistory(selectedProvinceId);
      setChangeReason('');
    } catch (error: any) {
      console.error('Update error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update employee count",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const calculatePercentageChange = (current: number, previous: number | null) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / previous * 100);
  };

  const getChangeIcon = (current: number, previous: number | null) => {
    const change = calculatePercentageChange(current, previous);
    if (change === null) return null;
    
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-600" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Individual Province Management
          </CardTitle>
          <CardDescription>
            Update employee counts for individual provinces with automatic validation and history tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province-select">Select Province</Label>
              <select
                id="province-select"
                value={selectedProvinceId}
                onChange={(e) => setSelectedProvinceId(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Choose a province...</option>
                {provinces.map(province => (
                  <option key={province.id} value={province.id}>
                    {province.name} - Current: {province.employeeCount.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employee-count">New Employee Count</Label>
              <Input
                id="employee-count"
                type="number"
                value={newEmployeeCount}
                onChange={(e) => setNewEmployeeCount(e.target.value)}
                placeholder="Enter employee count"
                min="0"
                max="100000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="change-reason">Change Reason (Optional)</Label>
            <Textarea
              id="change-reason"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="e.g., Q4 organizational restructure, new hiring initiative..."
              rows={2}
            />
          </div>

          {selectedProvince && newEmployeeCount && (
            <div className="bg-muted/50 p-3 rounded-md">
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span>
                  Updating {selectedProvince.name} from {selectedProvince.employeeCount.toLocaleString()} 
                  to {parseInt(newEmployeeCount).toLocaleString()} employees
                </span>
              </div>
              {(() => {
                const change = calculatePercentageChange(parseInt(newEmployeeCount), selectedProvince.employeeCount);
                if (change && Math.abs(change) > 25) {
                  return (
                    <div className="mt-2 text-sm text-orange-600 font-medium">
                      ⚠️ Large change detected: {change > 0 ? '+' : ''}{change.toFixed(1)}%
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}

          <Button 
            onClick={handleUpdate} 
            disabled={!selectedProvinceId || !newEmployeeCount || isUpdating}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            {isUpdating ? 'Updating...' : 'Update Employee Count'}
          </Button>
        </CardContent>
      </Card>

      <BulkEmployeeManagement />

      {selectedProvince && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Change History - {selectedProvince.name}
            </CardTitle>
            <CardDescription>
              Historical employee count changes for this province
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="text-center py-4">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No change history available
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry) => (
                  <div key={entry.id} className="border rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getChangeIcon(entry.employeeCount, entry.previousCount)}
                        <span className="font-medium">
                          {entry.employeeCount.toLocaleString()} employees
                        </span>
                        {entry.previousCount && (
                          <Badge variant="outline">
                            {entry.previousCount > entry.employeeCount ? '-' : '+'}
                            {Math.abs(entry.employeeCount - entry.previousCount).toLocaleString()}
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.createdAt), 'PPp')}
                      </span>
                    </div>
                    {entry.changeReason && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {entry.changeReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployeeManagementTab;
