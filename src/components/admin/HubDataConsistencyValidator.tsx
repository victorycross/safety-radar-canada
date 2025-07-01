
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { validateHubDataConsistency, recalculateHubTotals } from '@/services/hubEmployeeService';

interface HubDataConsistencyValidatorProps {
  onDataFixed?: () => void;
}

const HubDataConsistencyValidator: React.FC<HubDataConsistencyValidatorProps> = ({ onDataFixed }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [validation, setValidation] = useState<{
    isConsistent: boolean;
    discrepancies: Array<{
      hubId: string;
      hubName: string;
      hubTotal: number;
      locationTotal: number;
      difference: number;
    }>;
  } | null>(null);

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const result = await validateHubDataConsistency();
      setValidation(result);
      
      if (result.isConsistent) {
        toast({
          title: "Hub Data Consistent",
          description: "Hub totals match location-level data",
        });
      } else {
        toast({
          title: "Hub Data Inconsistencies Found",
          description: `Found ${result.discrepancies.length} hubs with mismatched totals`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error validating hub data:', error);
      toast({
        title: "Validation Failed",
        description: "Failed to validate hub data consistency",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleFixDiscrepancies = async () => {
    setIsFixing(true);
    try {
      await recalculateHubTotals();
      
      toast({
        title: "Hub Data Synchronized",
        description: "Hub totals have been recalculated from location data",
      });
      
      // Re-validate to confirm fix
      await handleValidate();
      
      // Notify parent component to refresh
      if (onDataFixed) {
        onDataFixed();
      }
    } catch (error) {
      console.error('Error fixing hub discrepancies:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to synchronize hub totals",
        variant: "destructive"
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          {validation?.isConsistent ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : validation ? (
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
          Hub Data Consistency Check
        </CardTitle>
        <CardDescription className="text-blue-700">
          Validate that hub totals match location-level employee data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={handleValidate}
            disabled={isValidating}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`} />
            {isValidating ? 'Validating...' : 'Check Consistency'}
          </Button>
          
          {validation && !validation.isConsistent && (
            <Button 
              onClick={handleFixDiscrepancies}
              disabled={isFixing}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isFixing ? 'animate-spin' : ''}`} />
              {isFixing ? 'Syncing...' : 'Fix Discrepancies'}
            </Button>
          )}
        </div>

        {validation && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={validation.isConsistent ? "default" : "destructive"}>
                {validation.isConsistent ? "Consistent" : `${validation.discrepancies.length} Issues`}
              </Badge>
            </div>

            {!validation.isConsistent && validation.discrepancies.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-blue-800">Hub Data Discrepancies:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {validation.discrepancies.map((discrepancy) => (
                    <div key={discrepancy.hubId} className="text-xs bg-white p-2 rounded border">
                      <div className="font-medium">{discrepancy.hubName}</div>
                      <div className="text-muted-foreground">
                        Hub: {discrepancy.hubTotal} | Location Total: {discrepancy.locationTotal} 
                        <span className="text-red-600 ml-1">(Diff: {discrepancy.difference})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HubDataConsistencyValidator;
