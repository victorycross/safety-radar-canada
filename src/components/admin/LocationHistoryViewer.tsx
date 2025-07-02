
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Users, Home, Plane, ArrowRight, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { fetchLocationHistory, updateEmployeeLocation, type LocationHistory } from '@/services/cityService';
import { format } from 'date-fns';

interface LocationHistoryViewerProps {
  cityId: string | null;
  cityName: string;
  isOpen: boolean;
  onClose: () => void;
  onRevert?: (homeBase: number, current: number, travelAway: number) => void;
}

const LocationHistoryViewer: React.FC<LocationHistoryViewerProps> = ({
  cityId,
  cityName,
  isOpen,
  onClose,
  onRevert
}) => {
  const [history, setHistory] = useState<LocationHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && cityId) {
      loadHistory();
    }
  }, [isOpen, cityId]);

  const loadHistory = async () => {
    if (!cityId) return;
    
    setLoading(true);
    try {
      const historyData = await fetchLocationHistory(cityId);
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading location history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load location history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (historyItem: LocationHistory) => {
    if (!cityId || !onRevert) return;

    try {
      await updateEmployeeLocation(
        cityId,
        historyItem.previousHomeBaseCount || 0,
        historyItem.previousCurrentLocationCount || 0,
        historyItem.previousTravelAwayCount || 0,
        'admin (reverted)'
      );

      toast({
        title: 'Data Reverted',
        description: `Successfully reverted ${cityName} to previous values`,
      });

      onRevert(
        historyItem.previousHomeBaseCount || 0,
        historyItem.previousCurrentLocationCount || 0,
        historyItem.previousTravelAwayCount || 0
      );

      onClose();
    } catch (error) {
      console.error('Error reverting data:', error);
      toast({
        title: 'Revert Failed',
        description: 'Failed to revert employee location data',
        variant: 'destructive'
      });
    }
  };

  const calculateChange = (current: number, previous: number | null) => {
    if (previous === null) return { value: current, isIncrease: true, percentage: 0 };
    const diff = current - previous;
    const percentage = previous > 0 ? Math.abs((diff / previous) * 100) : 0;
    return {
      value: Math.abs(diff),
      isIncrease: diff > 0,
      percentage: Math.round(percentage)
    };
  };

  const getChangeBadgeColor = (change: { value: number; percentage: number }) => {
    if (change.percentage > 50) return 'destructive';
    if (change.percentage > 25) return 'default';
    return 'secondary';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Location History: {cityName}
          </DialogTitle>
          <DialogDescription>
            View historical changes to employee counts for this location
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading history...</div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No historical changes found for this location
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => {
                const homeBaseChange = calculateChange(item.homeBaseCount, item.previousHomeBaseCount);
                const currentChange = calculateChange(item.currentLocationCount, item.previousCurrentLocationCount);
                const travelChange = calculateChange(item.travelAwayCount, item.previousTravelAwayCount);

                return (
                  <Card key={item.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">
                          {format(new Date(item.createdAt), 'PPpp')}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.changeType}</Badge>
                          {index < history.length - 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevert(item)}
                              className="flex items-center gap-1"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Revert
                            </Button>
                          )}
                        </div>
                      </div>
                      {item.changeReason && (
                        <p className="text-sm text-muted-foreground">{item.changeReason}</p>
                      )}
                      {item.changedBy && (
                        <p className="text-xs text-muted-foreground">Changed by: {item.changedBy}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        {/* Home Base Count */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">Home Base</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {item.previousHomeBaseCount || 0}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{item.homeBaseCount}</span>
                            {item.previousHomeBaseCount !== null && homeBaseChange.value > 0 && (
                              <Badge variant={getChangeBadgeColor(homeBaseChange)} className="text-xs">
                                {homeBaseChange.isIncrease ? '+' : '-'}{homeBaseChange.value}
                                {homeBaseChange.percentage > 0 && ` (${homeBaseChange.percentage}%)`}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Current Location Count */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">Current</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {item.previousCurrentLocationCount || 0}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{item.currentLocationCount}</span>
                            {item.previousCurrentLocationCount !== null && currentChange.value > 0 && (
                              <Badge variant={getChangeBadgeColor(currentChange)} className="text-xs">
                                {currentChange.isIncrease ? '+' : '-'}{currentChange.value}
                                {currentChange.percentage > 0 && ` (${currentChange.percentage}%)`}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Travel Away Count */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Plane className="h-4 w-4 text-orange-600" />
                            <span className="text-sm font-medium">Travel Away</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {item.previousTravelAwayCount || 0}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                            <span className="font-medium">{item.travelAwayCount}</span>
                            {item.previousTravelAwayCount !== null && travelChange.value > 0 && (
                              <Badge variant={getChangeBadgeColor(travelChange)} className="text-xs">
                                {travelChange.isIncrease ? '+' : '-'}{travelChange.value}
                                {travelChange.percentage > 0 && ` (${travelChange.percentage}%)`}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total Change:</span>
                          <span className="font-medium">
                            {(item.previousHomeBaseCount || 0) + (item.previousCurrentLocationCount || 0) + (item.previousTravelAwayCount || 0)} 
                            → {item.homeBaseCount + item.currentLocationCount + item.travelAwayCount}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default LocationHistoryViewer;
