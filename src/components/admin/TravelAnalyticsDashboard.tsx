import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, AlertTriangle, MapPin, Calendar, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { 
  fetchEnhancedTravelRecords, 
  fetchLocationTransitions,
  type EnhancedTravelRecord,
  type LocationTransition
} from '@/services/enhancedTravelService';

interface TravelAnalytics {
  totalTravelers: number;
  activeTravelers: number;
  averageTripDuration: number;
  riskDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
  monthlyTrends: Array<{
    month: string;
    travels: number;
    averageRisk: number;
  }>;
  topDestinations: Array<{
    cityId: string;
    count: number;
    riskLevel: string;
  }>;
}

const TravelAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<TravelAnalytics | null>(null);
  const [travelRecords, setTravelRecords] = useState<EnhancedTravelRecord[]>([]);
  const [transitions, setTransitions] = useState<LocationTransition[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      const [recordsData, transitionsData] = await Promise.all([
        fetchEnhancedTravelRecords(),
        fetchLocationTransitions()
      ]);

      setTravelRecords(recordsData);
      setTransitions(transitionsData);
      
      // Calculate analytics
      const calculatedAnalytics = calculateAnalytics(recordsData, transitionsData);
      setAnalytics(calculatedAnalytics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading travel analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load travel analytics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateAnalytics = (
    records: EnhancedTravelRecord[], 
    transitions: LocationTransition[]
  ): TravelAnalytics => {
    const totalTravelers = new Set(records.map(r => r.employeeId)).size;
    const activeTravelers = records.filter(r => r.travelStatus !== 'home').length;
    
    // Calculate average trip duration
    const completedTrips = records.filter(r => 
      r.departureDate && r.returnDate && r.travelStatus === 'home'
    );
    const averageTripDuration = completedTrips.length > 0 
      ? completedTrips.reduce((sum, trip) => {
          const start = new Date(trip.departureDate!);
          const end = new Date(trip.returnDate!);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
        }, 0) / completedTrips.length
      : 0;

    // Risk distribution
    const riskDistribution = records.reduce((acc, record) => {
      acc[record.riskLevel] = (acc[record.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Status distribution
    const statusDistribution = records.reduce((acc, record) => {
      acc[record.travelStatus] = (acc[record.travelStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      
      const monthRecords = records.filter(r => 
        r.createdAt.startsWith(monthKey)
      );
      
      const averageRisk = monthRecords.length > 0
        ? monthRecords.reduce((sum, r) => {
            const riskValue = r.riskLevel === 'high' ? 3 : r.riskLevel === 'medium' ? 2 : 1;
            return sum + riskValue;
          }, 0) / monthRecords.length
        : 0;

      monthlyTrends.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        travels: monthRecords.length,
        averageRisk
      });
    }

    // Top destinations
    const destinationCounts = records.reduce((acc, record) => {
      if (record.currentCityId) {
        const key = record.currentCityId;
        if (!acc[key]) {
          acc[key] = { count: 0, riskLevels: [] };
        }
        acc[key].count++;
        acc[key].riskLevels.push(record.riskLevel);
      }
      return acc;
    }, {} as Record<string, { count: number; riskLevels: string[] }>);

    const topDestinations = Object.entries(destinationCounts)
      .map(([cityId, data]) => {
        const highRiskCount = data.riskLevels.filter(r => r === 'high').length;
        const riskLevel = highRiskCount > data.count * 0.5 ? 'high' : 
                         highRiskCount > data.count * 0.2 ? 'medium' : 'low';
        return {
          cityId,
          count: data.count,
          riskLevel
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalTravelers,
      activeTravelers,
      averageTripDuration,
      riskDistribution,
      statusDistribution,
      monthlyTrends,
      topDestinations
    };
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-2 text-muted-foreground">Loading travel analytics...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No analytics data available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Travel Analytics Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive insights into travel patterns and risk assessment
          </p>
        </div>
        <Button onClick={loadAnalyticsData} disabled={loading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Travelers</p>
                <p className="text-2xl font-bold">{analytics.totalTravelers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Travelers</p>
                <p className="text-2xl font-bold">{analytics.activeTravelers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Trip Duration</p>
                <p className="text-2xl font-bold">{analytics.averageTripDuration.toFixed(1)} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk Trips</p>
                <p className="text-2xl font-bold">{analytics.riskDistribution.high || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Distribution
            </CardTitle>
            <CardDescription>
              Distribution of travel records by risk level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.riskDistribution).map(([risk, count]) => (
                <div key={risk} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskColor(risk)}>
                      {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
                    </Badge>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Travel Status Distribution
            </CardTitle>
            <CardDescription>
              Current status of all travel records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.statusDistribution).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(status)}>
                      {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Travel Trends
          </CardTitle>
          <CardDescription>
            Travel volume and average risk level over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.monthlyTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{trend.month}</div>
                  <div className="text-sm text-muted-foreground">
                    {trend.travels} travel records
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{trend.travels}</div>
                  <div className="text-sm text-muted-foreground">
                    Avg Risk: {trend.averageRisk.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Destinations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Top Travel Destinations
          </CardTitle>
          <CardDescription>
            Most frequently visited destinations with risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.topDestinations.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No destination data available
              </div>
            ) : (
              analytics.topDestinations.map((destination, index) => (
                <div key={destination.cityId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium">City ID: {destination.cityId}</div>
                      <div className="text-sm text-muted-foreground">
                        {destination.count} visits
                      </div>
                    </div>
                  </div>
                  <Badge className={getRiskColor(destination.riskLevel)}>
                    {destination.riskLevel} risk
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {lastUpdated && (
        <div className="text-sm text-muted-foreground text-center">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default TravelAnalyticsDashboard;