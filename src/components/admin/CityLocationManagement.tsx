
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Users, Plane, Home, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { 
  fetchCities, 
  fetchEmployeeLocations, 
  updateEmployeeLocation,
  type City,
  type EmployeeLocation 
} from '@/services/cityService';

const CityLocationManagement = () => {
  const { provinces, refreshData } = useSupabaseDataContext();
  const [cities, setCities] = useState<City[]>([]);
  const [employeeLocations, setEmployeeLocations] = useState<EmployeeLocation[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [homeBaseCount, setHomeBaseCount] = useState<number>(0);
  const [currentLocationCount, setCurrentLocationCount] = useState<number>(0);
  const [travelAwayCount, setTravelAwayCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [citiesData, locationsData] = await Promise.all([
        fetchCities(),
        fetchEmployeeLocations()
      ]);
      setCities(citiesData);
      setEmployeeLocations(locationsData);
    } catch (error) {
      console.error('Error loading city data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load city data',
        variant: 'destructive'
      });
    }
  };

  const filteredCities = selectedProvince 
    ? cities.filter(city => city.provinceId === selectedProvince)
    : cities;

  const selectedCityData = cities.find(city => city.id === selectedCity);
  const existingLocation = employeeLocations.find(loc => loc.cityId === selectedCity);

  useEffect(() => {
    if (existingLocation) {
      setHomeBaseCount(existingLocation.homeBaseCount);
      setCurrentLocationCount(existingLocation.currentLocationCount);
      setTravelAwayCount(existingLocation.travelAwayCount);
    } else {
      setHomeBaseCount(0);
      setCurrentLocationCount(0);
      setTravelAwayCount(0);
    }
  }, [existingLocation]);

  const handleUpdateLocation = async () => {
    if (!selectedCity) {
      toast({
        title: 'Validation Error',
        description: 'Please select a city',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await updateEmployeeLocation(
        selectedCity,
        homeBaseCount,
        currentLocationCount,
        travelAwayCount,
        'admin'
      );

      toast({
        title: 'Location Updated',
        description: `Employee counts for ${selectedCityData?.name} have been updated. Province totals will sync automatically.`,
      });

      await loadData();
      await refreshData(); // Refresh province totals
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update employee location counts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalEmployees = (location: EmployeeLocation) => {
    return location.homeBaseCount + location.currentLocationCount + location.travelAwayCount;
  };

  return (
    <div className="space-y-6">
      {/* Primary Source Indicator */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Primary Employee Data Management
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-700">
          <div className="space-y-2 text-sm">
            <p><strong>Authoritative Source:</strong> All province totals are calculated from this city-level data</p>
            <p><strong>Real-time Sync:</strong> Province dashboard updates automatically when you make changes here</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            City-Level Employee Management
          </CardTitle>
          <CardDescription>
            Manage employee distribution at the city level with travel status tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province-select">Province</Label>
              <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a province" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map(province => (
                    <SelectItem key={province.id} value={province.id}>
                      {province.name} ({province.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city-select">City</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedProvince}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCities.map(city => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name} ({city.code})
                      {city.isMajorCity && <Badge variant="secondary" className="ml-2">Major</Badge>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedCityData && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{selectedCityData.name}</h3>
                <div className="flex gap-2">
                  {selectedCityData.isMajorCity && (
                    <Badge variant="secondary">Major City</Badge>
                  )}
                  <Badge variant="outline">
                    Pop: {selectedCityData.population?.toLocaleString() || 'N/A'}
                  </Badge>
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
                    Permanent employees based in this city
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
                    Temporary visitors currently in this city
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
                    City residents currently traveling elsewhere
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
                  Note: Home Base count contributes to province totals on the dashboard
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
          <CardTitle>Current City Distributions</CardTitle>
          <CardDescription>
            Overview of employee distributions across all cities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employeeLocations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No city-level employee data configured yet
              </div>
            ) : (
              employeeLocations.map(location => (
                <div key={location.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{location.city?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {location.city?.code} • {provinces.find(p => p.id === location.provinceId)?.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Total: {getTotalEmployees(location)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {location.homeBaseCount}H • {location.currentLocationCount}C • {location.travelAwayCount}A
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

export default CityLocationManagement;
