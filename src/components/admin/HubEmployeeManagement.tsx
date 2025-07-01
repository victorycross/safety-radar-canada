
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Plane, Home, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useHubData } from '@/hooks/useHubData';
import { 
  fetchHubEmployeeLocations, 
  updateHubEmployeeLocation,
  type HubEmployeeLocation 
} from '@/services/hubEmployeeService';

interface HubEmployeeManagementProps {
  onDataUpdated?: () => void;
}

const HubEmployeeManagement: React.FC<HubEmployeeManagementProps> = ({ onDataUpdated }) => {
  const { hubs, refreshData } = useHubData();
  const [hubLocations, setHubLocations] = useState<HubEmployeeLocation[]>([]);
  const [selectedHub, setSelectedHub] = useState<string>('');
  const [homeBaseCount, setHomeBaseCount] = useState<number>(0);
  const [currentLocationCount, setCurrentLocationCount] = useState<number>(0);
  const [travelAwayCount, setTravelAwayCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const locationsData = await fetchHubEmployeeLocations();
      setHubLocations(locationsData);
    } catch (error) {
      console.error('Error loading hub employee data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hub employee data',
        variant: 'destructive'
      });
    }
  };

  const selectedHubData = hubs.find(hub => hub.id === selectedHub);
  const existingLocation = hubLocations.find(loc => loc.hub_id === selectedHub);

  useEffect(() => {
    if (existingLocation) {
      setHomeBaseCount(existingLocation.home_base_count);
      setCurrentLocationCount(existingLocation.current_location_count);
      setTravelAwayCount(existingLocation.travel_away_count);
    } else {
      setHomeBaseCount(0);
      setCurrentLocationCount(0);
      setTravelAwayCount(0);
    }
  }, [existingLocation]);

  const handleUpdateLocation = async () => {
    if (!selectedHub) {
      toast({
        title: 'Validation Error',
        description: 'Please select a hub',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await updateHubEmployeeLocation(
        selectedHub,
        homeBaseCount,
        currentLocationCount,
        travelAwayCount,
        'admin'
      );

      toast({
        title: 'Hub Location Updated',
        description: `Employee counts for ${selectedHubData?.name} have been updated. Hub totals will sync automatically.`,
      });

      await loadData();
      await refreshData(); // Refresh hub totals
      
      // Notify parent component
      if (onDataUpdated) {
        onDataUpdated();
      }
      
      // Dispatch custom event for dashboard refresh
      window.dispatchEvent(new CustomEvent('employeeDataUpdated'));
    } catch (error) {
      console.error('Error updating hub location:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update hub employee location counts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalEmployees = (location: HubEmployeeLocation) => {
    return location.home_base_count + location.current_location_count + location.travel_away_count;
  };

  return (
    <div className="space-y-6">
      {/* Primary Source Indicator */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Primary Hub Employee Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-700">
          <div className="space-y-2 text-sm">
            <p><strong>Authoritative Source:</strong> All hub totals are calculated from this location-level data</p>
            <p><strong>Real-time Sync:</strong> Dashboard updates automatically when you make changes here</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Hub-Level Employee Management
          </CardTitle>
          <CardDescription>
            Manage employee distribution at international hubs with travel status tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hub-select">International Hub</Label>
            <Select value={selectedHub} onValueChange={setSelectedHub}>
              <SelectTrigger>
                <SelectValue placeholder="Select a hub" />
              </SelectTrigger>
              <SelectContent>
                {hubs.map(hub => (
                  <SelectItem key={hub.id} value={hub.id}>
                    {hub.name} ({hub.code}) - {hub.country}
                    {hub.flagEmoji && ` ${hub.flagEmoji}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedHubData && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{selectedHubData.name}</h3>
                <div className="flex gap-2">
                  <Badge variant="outline">
                    {selectedHubData.country}
                  </Badge>
                  {selectedHubData.flagEmoji && (
                    <span className="text-lg">{selectedHubData.flagEmoji}</span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="home-base">
                    <Home className="inline h-4 w-4 mr-1" />
                    Home Base Count
                  </Label>
                  <Input
                    id="home-base"
                    type="number"
                    min="0"
                    value={homeBaseCount}
                    onChange={(e) => setHomeBaseCount(parseInt(e.target.value) || 0)}
                  />
                  <div className="text-xs text-muted-foreground">
                    Permanent employees based at this hub
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current-location">
                    <Users className="inline h-4 w-4 mr-1" />
                    Current Location
                  </Label>
                  <Input
                    id="current-location"
                    type="number"
                    min="0"
                    value={currentLocationCount}
                    onChange={(e) => setCurrentLocationCount(parseInt(e.target.value) || 0)}
                  />
                  <div className="text-xs text-muted-foreground">
                    Temporary visitors currently at this hub
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travel-away">
                    <Plane className="inline h-4 w-4 mr-1" />
                    Traveling Away
                  </Label>
                  <Input
                    id="travel-away"
                    type="number"
                    min="0"
                    value={travelAwayCount}
                    onChange={(e) => setTravelAwayCount(parseInt(e.target.value) || 0)}
                  />
                  <div className="text-xs text-muted-foreground">
                    Hub employees currently traveling elsewhere
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-background rounded border">
                <div className="text-sm text-muted-foreground">
                  Total Employees: <strong>{homeBaseCount + currentLocationCount + travelAwayCount}</strong>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Home Base: {homeBaseCount} | Current: {currentLocationCount} | Away: {travelAwayCount}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Note: Home Base count contributes to hub totals on the dashboard
                </div>
              </div>

              <Button 
                onClick={handleUpdateLocation} 
                disabled={loading}
                className="w-full mt-4"
              >
                {loading ? 'Updating...' : 'Update Employee Counts'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Hub Distributions</CardTitle>
          <CardDescription>
            Overview of employee distributions across all international hubs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hubLocations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hub-level employee data configured yet
              </div>
            ) : (
              hubLocations.map(location => (
                <div key={location.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{location.hub?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {location.hub?.code} • {location.hub?.country}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Total: {getTotalEmployees(location)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {location.home_base_count}H • {location.current_location_count}C • {location.travel_away_count}A
                      </div>
                    </div>
                    <Badge variant={getTotalEmployees(location) > 0 ? 'default' : 'secondary'}>
                      {getTotalEmployees(location) > 0 ? 'Active' : 'Empty'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HubEmployeeManagement;
