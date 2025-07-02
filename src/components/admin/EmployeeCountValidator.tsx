
import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface EmployeeCountValidatorProps {
  cityName: string;
  currentCounts: {
    homeBase: number;
    current: number;
    travelAway: number;
  };
  newCounts: {
    homeBase: number;
    current: number;
    travelAway: number;
  };
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const EmployeeCountValidator: React.FC<EmployeeCountValidatorProps> = ({
  cityName,
  currentCounts,
  newCounts,
  onConfirm,
  onCancel,
  isOpen
}) => {
  const [reason, setReason] = useState('');
  const [requireReason, setRequireReason] = useState(false);

  const calculateChanges = () => {
    const currentTotal = currentCounts.homeBase + currentCounts.current + currentCounts.travelAway;
    const newTotal = newCounts.homeBase + newCounts.current + newCounts.travelAway;
    
    const totalChange = newTotal - currentTotal;
    const percentageChange = currentTotal > 0 ? Math.abs((totalChange / currentTotal) * 100) : 0;
    
    const homeBaseChange = newCounts.homeBase - currentCounts.homeBase;
    const homeBasePercentage = currentCounts.homeBase > 0 ? Math.abs((homeBaseChange / currentCounts.homeBase) * 100) : 0;
    
    return {
      totalChange,
      percentageChange,
      homeBaseChange,
      homeBasePercentage,
      isLargeDecrease: totalChange < 0 && percentageChange > 25,
      isVeryLargeChange: percentageChange > 50,
      hasHomeBaseDecrease: homeBaseChange < 0 && homeBasePercentage > 25
    };
  };

  const changes = calculateChanges();

  React.useEffect(() => {
    setRequireReason(changes.isVeryLargeChange || changes.hasHomeBaseDecrease);
  }, [changes.isVeryLargeChange, changes.hasHomeBaseDecrease]);

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      return; // Don't proceed without reason for large changes
    }
    onConfirm(reason.trim() || undefined);
  };

  const getSeverityLevel = () => {
    if (changes.isVeryLargeChange) return 'critical';
    if (changes.isLargeDecrease || changes.hasHomeBaseDecrease) return 'warning';
    return 'normal';
  };

  const severity = getSeverityLevel();

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {severity === 'critical' ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : severity === 'warning' ? (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            )}
            Confirm Employee Count Changes
          </DialogTitle>
          <DialogDescription>
            Review the proposed changes to {cityName} employee counts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Change Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Current Counts</h4>
              <div className="space-y-1 text-sm">
                <div>Home Base: <span className="font-medium">{currentCounts.homeBase}</span></div>
                <div>Current Location: <span className="font-medium">{currentCounts.current}</span></div>
                <div>Travel Away: <span className="font-medium">{currentCounts.travelAway}</span></div>
                <div className="pt-1 border-t">
                  Total: <span className="font-medium">{currentCounts.homeBase + currentCounts.current + currentCounts.travelAway}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">New Counts</h4>
              <div className="space-y-1 text-sm">
                <div>Home Base: <span className="font-medium">{newCounts.homeBase}</span></div>
                <div>Current Location: <span className="font-medium">{newCounts.current}</span></div>
                <div>Travel Away: <span className="font-medium">{newCounts.travelAway}</span></div>
                <div className="pt-1 border-t">
                  Total: <span className="font-medium">{newCounts.homeBase + newCounts.current + newCounts.travelAway}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {severity !== 'normal' && (
            <Alert variant={severity === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <div className="font-medium">
                  {severity === 'critical' ? 'Critical Change Detected' : 'Large Change Detected'}
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {changes.isVeryLargeChange && (
                    <li>Total employee count change: {changes.totalChange > 0 ? '+' : ''}{changes.totalChange} ({changes.percentageChange.toFixed(1)}%)</li>
                  )}
                  {changes.hasHomeBaseDecrease && (
                    <li>Home base count decreasing by {Math.abs(changes.homeBaseChange)} ({changes.homeBasePercentage.toFixed(1)}%)</li>
                  )}
                  {changes.isLargeDecrease && (
                    <li>Large decrease may indicate data entry error or significant operational change</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Reason Input */}
          {(requireReason || severity !== 'normal') && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                {requireReason ? 'Reason (Required)' : 'Reason (Optional)'}
              </Label>
              <Textarea
                id="reason"
                placeholder="Please explain the reason for this change..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={requireReason && !reason.trim() ? 'border-red-500' : ''}
              />
              {requireReason && !reason.trim() && (
                <p className="text-sm text-red-600">A reason is required for large changes</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={requireReason && !reason.trim()}
              variant={severity === 'critical' ? 'destructive' : 'default'}
            >
              {severity === 'critical' ? 'Confirm Critical Change' : 'Confirm Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeCountValidator;
