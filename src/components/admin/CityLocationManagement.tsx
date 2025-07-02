import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Users, Plane, Home, AlertTriangle, CheckCircle, History, Clock, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSupabaseDataContext } from '@/context/SupabaseDataProvider';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { 
  fetchCities, 
  fetchEmployeeLocations, 
  updateEmployeeLocation,
  type City,
  type EmployeeLocation 
} from '@/services/cityService';
import LocationHistoryViewer from './LocationHistoryViewer';
import EmployeeCountValidator from './EmployeeCountValidator';
import { format } from 'date-fns';

interface CityLocationManagementProps {
  onDataUpdated?: () => void;
}

const CityLocationManagement: React.FC<CityLocationManagementProps> = ({ onDataUpdated }) => {
  const { provinces, refreshData } = useSupabaseDataContext();
  const { checkPermission } = useEnhancedAuth();
  const isAdmin = checkPermission('*') || checkPermission('admin');
  
  const [cities, setCities] = useState<City[]>([]);
  const [employeeLocations, setEmployeeLocations] = useState<EmployeeLocation[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [homeBaseCount, setHomeBaseCount] = useState<number>(0);
  const [currentLocationCount, setCurrentLocationCount] = useState<number>(0);
  const [travelAwayCount, setTravelAwayCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  // New state for enhanced features
  const [showHistoryViewer, setShowHistoryViewer] = useState(false);
  const [selectedCityForHistory, setSelectedCityForHistory] = useState<{ id: string; name: string } | null>(null);
  const [showValidator, setShowValidator] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    cityId: string;
    homeBase: number;
    current: number;
    travelAway: number;
  } | null>(null);

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

  const checkForValidation = (newHomeBase: number, newCurrent: number, newTravelAway: number) => {
    if (!existingLocation) return false;
    
    const currentTotal = existingLocation.homeBaseCount + existingLocation.currentLocationCount + existingLocation.travelAwayCount;
    const newTotal = newHomeBase + newCurrent + newTravelAway;
    
    if (currentTotal === 0) return false;
    
    const totalChange = Math.abs(newTotal - currentTotal);
    const percentageChange = (totalChange / currentTotal) * 100;
    
    // Simplified two-tier system: 25% for warnings, no automatic blocks
    return percentageChange >= 25;
  };

  const handleUpdateLocation = async (reason?: string, adminOverride?: boolean) => {
    if (!selectedCity) {
      toast({
        title: 'Validation Error',
        description: 'Please select a city',
        variant: 'destructive'
      });
      return;
    }

    // Check if validation is needed (25%+ change)
    if (checkForValidation(homeBaseCount, currentLocationCount, travelAwayCount) && !adminOverride) {
      setPendingUpdate({
        cityId: selectedCity,
        homeBase: homeBaseCount,
        current: currentLocationCount,
        travelAway: travelAwayCount
      });
      setShowValidator(true);
      return;
    }

    await performUpdate(selectedCity, homeBaseCount, currentLocationCount, travelAwayCount, reason, adminOverride);
  };

  const performUpdate = async (
    cityId: string, 
    homeBase: number, 
    current: number, 
    travelAway: number, 
    reason?: string, 
    adminOverride?: boolean
  ) => {
    setLoading(true);
    try {
      let updateReason = 'Manual update via admin interface';
      
      if (adminOverride) {
        updateReason = `Admin override: ${reason || 'No reason provided'}`;
      } else if (reason) {
        updateReason = `Manual update: ${reason}`;
      }
      
      await updateEmployeeLocation(
        cityId,
        homeBase,
        current,
        travelAway,
        adminOverride ? 'admin_override' : 'admin'
      );

      const changeType = adminOverride ? 'with admin override' : 'normally';
      toast({
        title: 'Location Updated',
        description: `Employee counts for ${selectedCityData?.name} have been updated ${changeType}. Province totals will sync automatically.`,
      });

      await loadData();
      await refreshData();
      
      if (onDataUpdated) {
        onDataUpdated();
      }
      
      window.dispatchEvent(new CustomEvent('employeeDataUpdated'));
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

  const handleValidatorConfirm = async (reason?: string, adminOverride?: boolean) => {
    if (pendingUpdate) {
      await performUpdate(
        pendingUpdate.cityId, 
        pendingUpdate.homeBase, 
        pendingUpdate.current, 
        pendingUpdate.travelAway, 
        reason,
        adminOverride
      );
      setPendingUpdate(null);
    }
    setShowValidator(false);
  };

  const handleValidatorCancel = () => {
    setPendingUpdate(null);
    setShowValidator(false);
  };

  const handleViewHistory = (cityId: string, cityName: string) => {
    setSelectedCityForHistory({ id: cityId, name: cityName });
    setShowHistoryViewer(true);
  };

  const handleHistoryRevert = (homeBase: number, current: number, travelAway: number) => {
    setHomeBaseCount(homeBase);
    setCurrentLocationCount(current);
    setTravelAwayCount(travelAway);
    loadData();
    refreshData();
    if (onDataUpdated) {
      onDataUpdated();
    }
    window.dispatchEvent(new CustomEvent('employeeDataUpdated'));
  };

  const getTotalEmployees = (location: EmployeeLocation) => {
    return location.homeBaseCount + location.currentLocationCount + location.travelAwayCount;
  };

  const getChangeWarningLevel = (location: EmployeeLocation) => {
    const currentTotal = location.homeBaseCount + location.currentLocationCount + location.travelAwayCount;
    const newTotal = homeBaseCount + currentLocationCount + travelAwayCount;
    
    if (currentTotal === 0 || selectedCity !== location.cityId) return 'none';
    
    const percentageChange = Math.abs((newTotal - currentTotal) / currentTotal * 100);
    
    if (percentageChange >= 50) return 'critical';
    if (percentageChange >= 25) return 'warning';
    return 'normal';
  };

  const renderValidationIndicator = () => {
    if (!existingLocation) return null;
    
    const warningLevel = getChangeWarningLevel(existingLocation);
    const totalChange = (homeBaseCount + currentLocationCount + travelAwayCount) - 
                       (existingLocation.homeBaseCount + existingLocation.currentLocationCount + existingLocation.travelAwayCount);
    
    if (warningLevel === 'none' || warningLevel === 'normal') return null;
    
    return (
      <div className={`text-xs mt-1 flex items-center gap-1 ${
        warningLevel === 'critical' ? 'text-red-600' : 'text-yellow-600'
      }`}>
        <AlertTriangle className="h-3 w-3" />
        {warningLevel === 'critical' ? 'Critical change' : 'Large change'} detected 
        ({totalChange > 0 ? '+' : ''}{totalChange} total)
        {isAdmin && (
          <div className="flex items-center gap-1 ml-2">
            <Shield className="h-3 w-3 text-blue-600" />
            <span className="text-blue-600">Override available</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Primary Source Indicator */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Primary Employee Data Management
            {isAdmin && (
              <Badge variant="secondary" className="ml-2">
                <Shield className="h-3 w-3 mr-1" />
                Admin Access
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-700">
          <div className="space-y-2 text-sm">
            <p><strong>Authoritative Source:</strong> All province totals are calculated from this city-level data</p>
            <p><strong>Real-time Sync:</strong> Province dashboard updates automatically when you make changes here</p>
            <p><strong>Change Tracking:</strong> All modifications are logged with timestamps and user information</p>
            {isAdmin && (
              <p><strong>Admin Features:</strong> Override validation warnings for urgent updates</p>
            )}
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
            Manage employee distribution at the city level with tiered validation and admin override capabilities
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
                  {existingLocation && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewHistory(selectedCity, selectedCityData.name)}
                      className="flex items-center gap-1"
                    >
                      <History className="h-3 w-3" />
                      History
                    </Button>
                  )}
                </div>
              </div>
              
              {existingLocation && (
                <div className="mb-3 text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Last updated: {format(new Date(existingLocation.lastUpdatedAt), 'PPpp')}
                  {existingLocation.updatedBy && ` by ${existingLocation.updatedBy}`}
                </div>
              )}
              
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
                {renderValidationIndicator()}
              </div>

              <Button 
                onClick={() => handleUpdateLocation()} 
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
            Overview of employee distributions across all cities with change tracking
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
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(location.lastUpdatedAt), 'MMM d, yyyy HH:mm')}
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
                    <div className="flex items-center gap-2">
                      <Badge variant={getTotalEmployees(location) > 0 ? 'default' : 'secondary'}>
                        {getTotalEmployees(location) > 0 ? 'Active' : 'Empty'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewHistory(location.cityId, location.city?.name || 'Unknown')}
                        className="flex items-center gap-1"
                      >
                        <History className="h-3 w-3" />
                        History
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Location History Viewer */}
      <LocationHistoryViewer
        cityId={selectedCityForHistory?.id || null}
        cityName={selectedCityForHistory?.name || ''}
        isOpen={showHistoryViewer}
        onClose={() => {
          setShowHistoryViewer(false);
          setSelectedCityForHistory(null);
        }}
        onRevert={handleHistoryRevert}
      />

      {/* Employee Count Validator with Admin Support */}
      {showValidator && pendingUpdate && selectedCityData && existingLocation && (
        <EmployeeCountValidator
          cityName={selectedCityData.name}
          currentCounts={{
            homeBase: existingLocation.homeBaseCount,
            current: existingLocation.currentLocationCount,
            travelAway: existingLocation.travelAwayCount
          }}
          newCounts={{
            homeBase: pendingUpdate.homeBase,
            current: pendingUpdate.current,
            travelAway: pendingUpdate.travelAway
          }}
          onConfirm={handleValidatorConfirm}
          onCancel={handleValidatorCancel}
          isOpen={showValidator}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default CityLocationManagement;
