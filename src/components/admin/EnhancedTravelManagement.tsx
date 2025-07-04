import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plane, MapPin, Clock, AlertTriangle, CheckCircle, User, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { 
  fetchEnhancedTravelRecords, 
  fetchTravelBookings,
  fetchLocationTransitions,
  fetchTravelPolicies,
  createTravelRecord,
  updateTravelStatus,
  validateTravelCompliance,
  bulkUpdateTravelStatus,
  type EnhancedTravelRecord,
  type TravelBooking,
  type LocationTransition,
  type TravelPolicy
} from '@/services/enhancedTravelService';

interface EnhancedTravelManagementProps {
  onDataUpdated?: () => void;
}

const EnhancedTravelManagement: React.FC<EnhancedTravelManagementProps> = ({ onDataUpdated }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [travelRecords, setTravelRecords] = useState<EnhancedTravelRecord[]>([]);
  const [bookings, setBookings] = useState<TravelBooking[]>([]);
  const [transitions, setTransitions] = useState<LocationTransition[]>([]);
  const [policies, setPolicies] = useState<TravelPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());

  // New travel record form state
  const [newRecord, setNewRecord] = useState({
    employeeId: '',
    homeCityId: '',
    currentCityId: '',
    departureDate: '',
    returnDate: '',
    emergencyContactInfo: {},
    riskLevel: 'low' as 'low' | 'medium' | 'high',
    complianceNotes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [recordsData, bookingsData, transitionsData, policiesData] = await Promise.all([
        fetchEnhancedTravelRecords(),
        fetchTravelBookings(),
        fetchLocationTransitions(),
        fetchTravelPolicies()
      ]);
      
      setTravelRecords(recordsData);
      setBookings(bookingsData);
      setTransitions(transitionsData);
      setPolicies(policiesData);
    } catch (error) {
      console.error('Error loading travel data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load travel data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTravelRecord = async () => {
    if (!newRecord.employeeId || !newRecord.homeCityId) {
      toast({
        title: 'Validation Error',
        description: 'Employee ID and Home City are required',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Validate compliance first
      if (newRecord.currentCityId && newRecord.departureDate) {
        const compliance = await validateTravelCompliance(
          newRecord.employeeId,
          newRecord.currentCityId,
          newRecord.departureDate
        );

        if (!compliance.isCompliant) {
          const blockingViolations = compliance.policyViolations.filter(
            v => v.enforcement_level === 'blocking'
          );

          if (blockingViolations.length > 0) {
            toast({
              title: 'Policy Violation',
              description: `Travel blocked: ${blockingViolations[0].violation}`,
              variant: 'destructive'
            });
            return;
          }
        }
      }

      await createTravelRecord(newRecord);
      
      toast({
        title: 'Travel Record Created',
        description: 'New travel record has been created successfully',
      });

      // Reset form
      setNewRecord({
        employeeId: '',
        homeCityId: '',
        currentCityId: '',
        departureDate: '',
        returnDate: '',
        emergencyContactInfo: {},
        riskLevel: 'low',
        complianceNotes: ''
      });

      await loadData();
      if (onDataUpdated) onDataUpdated();
    } catch (error) {
      console.error('Error creating travel record:', error);
      toast({
        title: 'Creation Failed',
        description: 'Failed to create travel record',
        variant: 'destructive'
      });
    }
  };

  const handleStatusUpdate = async (recordId: string, status: EnhancedTravelRecord['travelStatus']) => {
    try {
      await updateTravelStatus(recordId, { travelStatus: status });
      toast({
        title: 'Status Updated',
        description: 'Travel status has been updated successfully',
      });
      await loadData();
      if (onDataUpdated) onDataUpdated();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update travel status',
        variant: 'destructive'
      });
    }
  };

  const handleBulkStatusUpdate = async (status: EnhancedTravelRecord['travelStatus']) => {
    if (selectedRecords.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select travel records to update',
        variant: 'destructive'
      });
      return;
    }

    try {
      await bulkUpdateTravelStatus(Array.from(selectedRecords), { travelStatus: status });
      toast({
        title: 'Bulk Update Complete',
        description: `Updated ${selectedRecords.size} travel records`,
      });
      setSelectedRecords(new Set());
      await loadData();
      if (onDataUpdated) onDataUpdated();
    } catch (error) {
      console.error('Error in bulk update:', error);
      toast({
        title: 'Bulk Update Failed',
        description: 'Failed to update travel records',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'home': return 'bg-green-100 text-green-800';
      case 'traveling': return 'bg-blue-100 text-blue-800';
      case 'at_destination': return 'bg-purple-100 text-purple-800';
      case 'returning': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-muted-foreground">Loading travel management...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Enhanced Travel & Location Management</h2>
        <p className="text-muted-foreground">
          Comprehensive travel management with automated location tracking and compliance checking
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create">Create Travel</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          <TabsTrigger value="tracking">Location Tracking</TabsTrigger>
          <TabsTrigger value="policies">Travel Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Plane className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Travels</p>
                    <p className="text-2xl font-bold">
                      {travelRecords.filter(r => r.travelStatus !== 'home').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">At Destination</p>
                    <p className="text-2xl font-bold">
                      {travelRecords.filter(r => r.travelStatus === 'at_destination').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                    <p className="text-2xl font-bold">
                      {travelRecords.filter(r => r.riskLevel === 'high').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                    <p className="text-2xl font-bold">
                      {travelRecords.filter(r => r.approvalStatus === 'pending').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Travel Records</CardTitle>
              <CardDescription>
                Current travel records and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {travelRecords.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No travel records found
                  </div>
                ) : (
                  travelRecords.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Employee: {record.employeeId}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.departureDate && `Departure: ${new Date(record.departureDate).toLocaleDateString()}`}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(record.travelStatus)}>
                          {record.travelStatus}
                        </Badge>
                        <Badge className={getRiskColor(record.riskLevel)}>
                          {record.riskLevel} risk
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(record.id, 'traveling')}
                            disabled={record.travelStatus === 'traveling'}
                          >
                            Start Travel
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(record.id, 'at_destination')}
                            disabled={record.travelStatus === 'at_destination'}
                          >
                            At Destination
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(record.id, 'home')}
                            disabled={record.travelStatus === 'home'}
                          >
                            Return Home
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Travel Record</CardTitle>
              <CardDescription>
                Create a new travel record with compliance checking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employee-id">Employee ID</Label>
                  <Input
                    id="employee-id"
                    value={newRecord.employeeId}
                    onChange={(e) => setNewRecord({...newRecord, employeeId: e.target.value})}
                    placeholder="Enter employee ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="home-city">Home City ID</Label>
                  <Input
                    id="home-city"
                    value={newRecord.homeCityId}
                    onChange={(e) => setNewRecord({...newRecord, homeCityId: e.target.value})}
                    placeholder="Enter home city ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current-city">Destination City ID</Label>
                  <Input
                    id="current-city"
                    value={newRecord.currentCityId}
                    onChange={(e) => setNewRecord({...newRecord, currentCityId: e.target.value})}
                    placeholder="Enter destination city ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk-level">Risk Level</Label>
                  <Select 
                    value={newRecord.riskLevel} 
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setNewRecord({...newRecord, riskLevel: value})
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departure-date">Departure Date</Label>
                  <Input
                    id="departure-date"
                    type="datetime-local"
                    value={newRecord.departureDate}
                    onChange={(e) => setNewRecord({...newRecord, departureDate: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="return-date">Return Date</Label>
                  <Input
                    id="return-date"
                    type="datetime-local"
                    value={newRecord.returnDate}
                    onChange={(e) => setNewRecord({...newRecord, returnDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="compliance-notes">Compliance Notes</Label>
                <Textarea
                  id="compliance-notes"
                  value={newRecord.complianceNotes}
                  onChange={(e) => setNewRecord({...newRecord, complianceNotes: e.target.value})}
                  placeholder="Enter any compliance notes or special requirements"
                  rows={3}
                />
              </div>

              <Button onClick={handleCreateTravelRecord} className="w-full">
                Create Travel Record
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Travel Operations</CardTitle>
              <CardDescription>
                Perform bulk operations on multiple travel records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate('traveling')}
                  disabled={selectedRecords.size === 0}
                >
                  Mark as Traveling
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate('at_destination')}
                  disabled={selectedRecords.size === 0}
                >
                  Mark at Destination
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleBulkStatusUpdate('home')}
                  disabled={selectedRecords.size === 0}
                >
                  Mark as Home
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Selected: {selectedRecords.size} records
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Location Transitions</CardTitle>
              <CardDescription>
                Track employee location changes and travel transitions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transitions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No location transitions recorded
                  </div>
                ) : (
                  transitions.slice(0, 10).map(transition => (
                    <div key={transition.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Employee: {transition.employeeId}</div>
                          <div className="text-sm text-muted-foreground">
                            {transition.transitionType} - {transition.transitionStatus}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {transition.actualTime && new Date(transition.actualTime).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Travel Policies</CardTitle>
              <CardDescription>
                View active travel policies and compliance rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No travel policies configured
                  </div>
                ) : (
                  policies.map(policy => (
                    <div key={policy.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{policy.policyName}</h3>
                        <Badge variant="outline">{policy.policyType}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Enforcement: {policy.enforcementLevel}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedTravelManagement;