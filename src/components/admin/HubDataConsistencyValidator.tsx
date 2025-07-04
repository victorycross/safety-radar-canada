import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { validateHubDataConsistency, recalculateHubTotals } from '@/services/hubEmployeeService';

interface ConsistencyResult {
  hubName: string;
  hubTotal: number;
  locationTotal: number;
  difference: number;
}

const HubDataConsistencyValidator = () => {
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isConsistent: boolean;
    discrepancies: ConsistencyResult[];
  } | null>(null);
  const [fixing, setFixing] = useState(false);

  const runValidation = async () => {
    setLoading(true);
    try {
      const result = await validateHubDataConsistency();
      setValidationResult(result);
      
      if (result.isConsistent) {
        toast({
          title: 'Validation Complete',
          description: 'All hub data is consistent!',
        });
      } else {
        toast({
          title: 'Inconsistencies Found',
          description: `Found ${result.discrepancies.length} hub(s) with data inconsistencies`,
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Error validating hub data:', error);
      toast({
        title: 'Validation Failed',
        description: 'Failed to validate hub data consistency',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fixInconsistencies = async () => {
    setFixing(true);
    try {
      await recalculateHubTotals();
      toast({
        title: 'Data Fixed',
        description: 'Hub totals have been recalculated and synchronized',
      });
      
      // Re-run validation to confirm fix
      await runValidation();
    } catch (error) {
      console.error('Error fixing inconsistencies:', error);
      toast({
        title: 'Fix Failed',
        description: 'Failed to fix data inconsistencies',
        variant: 'destructive'
      });
    } finally {
      setFixing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Hub Data Consistency Validator
        </CardTitle>
        <CardDescription>
          Validate and fix data consistency between hub totals and location records
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runValidation} disabled={loading}>
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Validating...
              </>
            ) : (
              'Run Validation'
            )}
          </Button>
          
          {validationResult && !validationResult.isConsistent && (
            <Button onClick={fixInconsistencies} disabled={fixing} variant="outline">
              {fixing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Fixing...
                </>
              ) : (
                'Fix Inconsistencies'
              )}
            </Button>
          )}
        </div>

        {validationResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {validationResult.isConsistent ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-medium">All data is consistent</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="text-amber-700 font-medium">
                    Found {validationResult.discrepancies.length} inconsistencies
                  </span>
                </>
              )}
            </div>

            {validationResult.discrepancies.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Inconsistent Hubs:</h4>
                <div className="space-y-2">
                  {validationResult.discrepancies.map((discrepancy, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div>
                        <div className="font-medium">{discrepancy.hubName}</div>
                        <div className="text-sm text-muted-foreground">
                          Hub Total: {discrepancy.hubTotal} | Location Total: {discrepancy.locationTotal}
                        </div>
                      </div>
                      <Badge variant="secondary">
                        Diff: {discrepancy.difference}
                      </Badge>
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