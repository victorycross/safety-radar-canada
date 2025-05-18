
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format, formatDistance } from "date-fns";

interface DataSourceUpdate {
  source: string;
  last_sync_time: string | null;
  status: string | null;
  message: string | null;
  sourceLabel?: string;
}

const DataSourceUpdates: React.FC = () => {
  const [updates, setUpdates] = useState<DataSourceUpdate[]>([]);
  const { toast } = useToast();

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('data_sync_status')
        .select('*')
        .order('last_sync_time', { ascending: false });

      if (error) throw error;
      
      // Process data to add human-readable source labels
      const processedData = data.map(item => ({
        ...item,
        sourceLabel: getSourceLabel(item.source)
      }));
      
      setUpdates(processedData);
    } catch (error) {
      console.error('Error fetching data source updates:', error);
      toast({
        variant: "destructive",
        title: "Failed to load updates",
        description: "Could not retrieve the latest data source updates.",
      });
    }
  };

  const getSourceLabel = (source: string): string => {
    switch (source) {
      case 'toronto_police':
        return 'Toronto Police Data';
      default:
        return source.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    }
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    switch (status.toLowerCase()) {
      case 'success':
        return (
          <Badge className="bg-success hover:bg-success/90">
            <CheckCircle className="mr-1 h-3 w-3" />
            Success
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        );
      case 'processing':
      case 'pending':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            <Clock className="mr-1 h-3 w-3" />
            Processing
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">{status}</Badge>
        );
    }
  };

  useEffect(() => {
    fetchUpdates();
    
    // Set up a realtime subscription for updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'data_sync_status'
        },
        () => {
          fetchUpdates();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (updates.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Data Source Updates</CardTitle>
        <CardDescription>Latest updates from external data sources</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {updates.map((update, index) => (
            <div key={`${update.source}-${index}`} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
              <div className="flex items-center">
                <Database className="h-4 w-4 mr-2 text-muted-foreground" />
                <div>
                  <p className="font-medium">{update.sourceLabel}</p>
                  {update.last_sync_time && (
                    <p className="text-xs text-muted-foreground">
                      {formatDistance(new Date(update.last_sync_time), new Date(), { addSuffix: true })}
                      <span className="mx-1">•</span>
                      {format(new Date(update.last_sync_time), 'MMM d, yyyy h:mm a')}
                    </p>
                  )}
                  {update.message && (
                    <p className="text-xs mt-1">{update.message}</p>
                  )}
                </div>
              </div>
              <div>
                {getStatusBadge(update.status)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DataSourceUpdates;
