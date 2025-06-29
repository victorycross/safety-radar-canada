import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, Plus, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { updateEmployeeLocation } from '@/services/cityService';
import { useAuth } from '@/components/auth/AuthProvider';

const TestingSampleData = () => {
  const [loading, setLoading] = useState(false);
  const [sampleDataCreated, setSampleDataCreated] = useState(false);
  const { user, isPowerUserOrAdmin } = useAuth();

  const sampleData = [
    { cityName: 'Toronto', homeBase: 1250, current: 1180, traveling: 70 },
    { cityName: 'Montreal', homeBase: 850, current: 800, traveling: 50 },
    { cityName: 'Vancouver', homeBase: 620, current: 580, traveling: 40 },
    { cityName: 'Calgary', homeBase: 420, current: 400, traveling: 20 },
    { cityName: 'Ottawa', homeBase: 380, current: 360, traveling: 20 },
    { cityName: 'Edmonton', homeBase: 290, current: 275, traveling: 15 },
    { cityName: 'Halifax', homeBase: 150, current: 140, traveling: 10 },
    { cityName: 'Winnipeg', homeBase: 180, current: 170, traveling: 10 }
  ];

  const createSampleData = async () => {
    setLoading(true);
    try {
      // First, get city IDs for our sample cities
      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name')
        .in('name', sampleData.map(item => item.cityName));

      if (citiesError) throw citiesError;

      // Create employee location records for each city
      for (const sample of sampleData) {
        const city = cities?.find(c => c.name === sample.cityName);
        if (city) {
          await updateEmployeeLocation(
            city.id,
            sample.homeBase,
            sample.current,
            sample.traveling,
            'test-admin'
          );
        }
      }

      setSampleDataCreated(true);
      toast({
        title: 'Sample Data Created',
        description: `Added employee location data for ${sampleData.length} cities`,
      });

    } catch (error) {
      console.error('Error creating sample data:', error);
      toast({
        title: 'Error',
        description: 'Failed to create sample data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSampleData = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('employee_locations')
        .delete()
        .eq('updated_by', 'test-admin');

      if (error) throw error;

      setSampleDataCreated(false);
      toast({
        title: 'Sample Data Cleared',
        description: 'All test employee location data has been removed',
      });

    } catch (error) {
      console.error('Error clearing sample data:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear sample data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createSampleTravelRecords = async () => {
    if (!isPowerUserOrAdmin()) {
      toast({
        title: 'Insufficient Permissions',
        description: 'You need Power User or Admin privileges to create travel records.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      // Get some city IDs for travel records
      const { data: cities, error: citiesError } = await supabase
        .from('cities')
        .select('id, name')
        .in('name', ['Toronto', 'Montreal', 'Vancouver', 'Calgary']);

      if (citiesError) throw citiesError;

      const travelRecords = [
        {
          employee_id: 'EMP001',
          home_city_id: cities?.find(c => c.name === 'Toronto')?.id,
          current_city_id: cities?.find(c => c.name === 'Montreal')?.id,
          travel_status: 'at_destination',
          departure_date: new Date().toISOString(),
          return_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          travel_platform: 'manual'
        },
        {
          employee_id: 'EMP002',
          home_city_id: cities?.find(c => c.name === 'Vancouver')?.id,
          travel_status: 'traveling',
          departure_date: new Date().toISOString(),
          travel_platform: 'manual'
        }
      ];

      const { error } = await supabase
        .from('travel_records')
        .insert(travelRecords);

      if (error) throw error;

      toast({
        title: 'Travel Records Created',
        description: 'Added sample travel records for testing',
      });

    } catch (error) {
      console.error('Error creating travel records:', error);
      toast({
        title: 'Error',
        description: 'Failed to create travel records',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Testing & Sample Data
        </CardTitle>
        <CardDescription>
          Create sample data to test the city-level employee management system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!user && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <h4 className="font-medium text-yellow-800">Authentication Required</h4>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              Most features require authentication due to Row Level Security policies. 
              Please sign in to access all functionality.
            </p>
            <Button 
              onClick={() => window.location.href = '/auth'}
              size="sm"
              variant="outline"
            >
              Go to Sign In
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="font-medium">Employee Location Data</h4>
            <p className="text-sm text-muted-foreground">
              Creates employee distribution data for 8 major cities
            </p>
            <div className="space-x-2">
              <Button
                onClick={createSampleData}
                disabled={loading}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                {loading ? 'Creating...' : 'Create Sample Data'}
              </Button>
              <Button
                onClick={clearSampleData}
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Data
              </Button>
            </div>
            {sampleDataCreated && (
              <Badge variant="default" className="w-fit">
                Sample data active
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Travel Records</h4>
            <p className="text-sm text-muted-foreground">
              Creates sample employee travel records (Power User+ required)
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={createSampleTravelRecords}
                disabled={loading || !isPowerUserOrAdmin()}
                size="sm"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Add Travel Records
              </Button>
              {isPowerUserOrAdmin() && (
                <Badge variant="secondary" className="text-xs">
                  Authorized
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Sample Data Preview</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            {sampleData.map(item => (
              <div key={item.cityName} className="text-center p-2 bg-background rounded">
                <div className="font-medium">{item.cityName}</div>
                <div className="text-muted-foreground">
                  {item.homeBase + item.current + item.traveling} total
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded border border-blue-200">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Testing Instructions</h4>
          <ol className="text-xs text-blue-800 space-y-1">
            <li>1. Click "Create Sample Data" to populate cities with employee counts</li>
            <li>2. Go to "City Management" tab to see and modify the data</li>
            <li>3. Try the "Travel Integration" tab to test platform management</li>
            <li>4. Check "Bulk Operations" for mass data operations</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestingSampleData;
