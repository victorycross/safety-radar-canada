
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SyncStatus {
  source: string;
  last_sync_time: string | null;
  status: string | null;
  message: string | null;
}

const TorontoPoliceSource = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSyncStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('data_sync_status')
        .select('*')
        .eq('source', 'toronto_police')
        .single();

      if (error) throw error;
      setSyncStatus(data);
    } catch (error) {
      console.error('Error fetching sync status:', error);
    }
  };

  const triggerSync = async () => {
    setLoading(true);
    try {
      // Direct HTTP request to the edge function instead of using supabase.functions.invoke
      const response = await fetch('https://hablzabjqwdusajkoevb.supabase.co/functions/v1/sync-toronto-police-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhhYmx6YWJqcXdkdXNhamtvZXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjkxOTYsImV4cCI6MjA2MzEwNTE5Nn0.Vt8DYuqfEu_7FHj8-xi_0CbNFfWqAUbyTTVzoY_yz0Q'}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to sync data: ${response.statusText}`);
      }
      
      toast({
        title: "Sync initiated",
        description: "The synchronization process has started.",
      });
      
      // Refresh the status after a short delay to allow for processing
      setTimeout(() => {
        fetchSyncStatus();
        setLoading(false);
      }, 3000);
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: error.message || "Failed to trigger data synchronization",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
    
    // Set up a refresh interval every 60 seconds
    const interval = setInterval(fetchSyncStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Toronto Police Open Data</CardTitle>
          {syncStatus?.status && (
            syncStatus.status === 'success' ? (
              <Badge className="bg-success hover:bg-success/90">Synced</Badge>
            ) : syncStatus.status === 'pending' || syncStatus.status === 'processing' ? (
              <Badge variant="outline">Pending</Badge>
            ) : (
              <Badge variant="destructive">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Error
              </Badge>
            )
          )}
        </div>
        <CardDescription>
          Incident data from Toronto Police Service Open Data Portal
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-sm space-y-2">
          <div className="flex items-center text-muted-foreground">
            <Database className="h-3 w-3 mr-1" />
            <span>
              {syncStatus?.last_sync_time 
                ? `Last sync: ${new Date(syncStatus.last_sync_time).toLocaleString('en-CA')}`
                : "Never synced"}
            </span>
          </div>
          {syncStatus?.message && (
            <div className="text-xs text-muted-foreground">
              {syncStatus.message}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={triggerSync}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Sync Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TorontoPoliceSource;
