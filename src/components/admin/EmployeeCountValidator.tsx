
import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

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
  onConfirm: (reason?: string, adminOverride?: boolean) => void;
  onCancel: () => void;
  isOpen: boolean;
  isAdmin?: boolean;
}

const EmployeeCountValidator: React.FC<EmployeeCountValidatorProps> = ({
  cityName,
  currentCounts,
  newCounts,
  onConfirm,
  onCancel,
  isOpen,
  isAdmin = false
}) => {
  const [reason, setReason] = useState('');
  const [adminOverride, setAdminOverride] = useState(false);

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
      isWarningLevel: percentageChange >= 25 && percentageChange < 50,
      isCriticalLevel: percentageChange >= 50,
      hasSignificantHomeBaseChange: homeBaseChange < 0 && homeBasePercentage >= 25
    };
  };

  const changes = calculateChanges();

  const getValidationLevel = () => {
    if (adminOverride) return 'override';
    if (changes.isCriticalLevel) return 'critical';
    if (changes.isWarningLevel || changes.hasSignificantHomeBaseChange) return 'warning';
    return 'normal';
  };

  const validationLevel = getValidationLevel();
  const requireReason = validationLevel === 'critical' && !adminOverride;

  const handleConfirm = () => {
    if (requireReason && !reason.trim()) {
      return; // Don't proceed without reason for critical changes
    }
    onConfirm(reason.trim() || undefined, adminOverride);
  };

  const getAlertVariant = () => {
    if (adminOverride) return 'default';
    if (validationLevel === 'critical') return 'destructive';
    return 'default';
  };

  const getAlertIcon = () => {
    if (adminOverride) return <Shield className="h-4 w-4" />;
    if (validationLevel === 'critical') return <AlertTriangle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getAlertTitle = () => {
    if (adminOverride) return 'Admin Override Enabled';
    if (validationLevel === 'critical') return 'Critical Change Detected';
    return 'Large Change Detected';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {validationLevel === 'critical' && !adminOverride ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : validationLevel === 'warning' && !adminOverride ? (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            ) : adminOverride ? (
              <Shield className="h-5 w-5 text-blue-600" />
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
          {/* Admin Override Toggle */}
          {isAdmin && (validationLevel === 'warning' || validationLevel === 'critical') && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <div>
                  <Label htmlFor="admin-override" className="text-sm font-medium text-blue-900">
                    Admin Override
                  </Label>
                  <p className="text-xs text-blue-700">
                    Bypass validation warnings and proceed immediately
                  </p>
                </div>
              </div>
              <Switch
                id="admin-override"
                checked={adminOverride}
                onCheckedChange={setAdminOverride}
              />
            </div>
          )}

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

          {/* Validation Warnings */}
          {(validationLevel === 'warning' || validationLevel === 'critical') && !adminOverride && (
            <Alert variant={getAlertVariant()}>
              {getAlertIcon()}
              <AlertDescription className="space-y-2">
                <div className="font-medium">
                  {getAlertTitle()}
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Total employee count change: {changes.totalChange > 0 ? '+' : ''}{changes.totalChange} ({changes.percentageChange.toFixed(1)}%)</li>
                  {changes.hasSignificantHomeBaseChange && (
                    <li>Home base count decreasing by {Math.abs(changes.homeBaseChange)} ({changes.homeBasePercentage.toFixed(1)}%)</li>
                  )}
                  {validationLevel === 'critical' && (
                    <li className="text-red-600 font-medium">Large changes require explanation to proceed</li>
                  )}
                  {validationLevel === 'warning' && (
                    <li className="text-yellow-600">Please verify this change is intentional</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {adminOverride && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium text-blue-900">Admin Override Active</div>
                <p className="text-blue-700">All validation checks have been bypassed. This change will be logged with admin override status.</p>
              </AlertDescription>
            </Alert>
          )}

          {/* Reason Input */}
          {(validationLevel === 'warning' || validationLevel === 'critical' || adminOverride) && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                {requireReason ? 'Reason (Required)' : adminOverride ? 'Override Reason (Optional)' : 'Reason (Optional)'}
              </Label>
              <Textarea
                id="reason"
                placeholder={
                  adminOverride 
                    ? "Explain why admin override was necessary..." 
                    : requireReason 
                      ? "Please explain the reason for this large change..."
                      : "Optional: Explain the reason for this change..."
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={requireReason && !reason.trim() ? 'border-red-500' : ''}
              />
              {requireReason && !reason.trim() && (
                <p className="text-sm text-red-600">A reason is required for critical changes ({'>'}50%)</p>
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
              variant={validationLevel === 'critical' && !adminOverride ? 'destructive' : 'default'}
            >
              {adminOverride 
                ? 'Apply with Override' 
                : validationLevel === 'critical' 
                  ? 'Confirm Critical Change' 
                  : 'Confirm Changes'
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeCountValidator;
