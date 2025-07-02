
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Search, RefreshCw, Download, Eye } from 'lucide-react';
import { useAlertArchiveManagement } from '@/hooks/useAlertArchiveManagement';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import ArchiveDetailModal from './ArchiveDetailModal';

interface ArchiveLogEntry {
  id: string;
  alert_table: string;
  alert_id: string;
  action: string;
  performed_by: string;
  reason: string | null;
  created_at: string;
  metadata: any;
  user_email?: string;
}

const ArchiveHistoryViewer = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [archiveLog, setArchiveLog] = useState<ArchiveLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState<ArchiveLogEntry | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchArchiveLog = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('alert_archive_log')
        .select(`
          *,
          profiles!inner(email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (sourceFilter !== 'all') {
        query = query.eq('alert_table', sourceFilter);
      }

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching archive log:', error);
        throw error;
      }

      const enrichedData = (data || []).map(entry => ({
        ...entry,
        user_email: entry.profiles?.email || 'Unknown User'
      }));

      setArchiveLog(enrichedData);
    } catch (error) {
      console.error('Error fetching archive log:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch archive history. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchiveLog();
  }, [sourceFilter, actionFilter]);

  const filteredLog = archiveLog.filter(entry => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      entry.reason?.toLowerCase().includes(searchLower) ||
      entry.user_email?.toLowerCase().includes(searchLower) ||
      entry.alert_id.toLowerCase().includes(searchLower)
    );
  });

  const getSourceDisplayName = (tableName: string) => {
    const mapping: Record<string, string> = {
      'security_alerts_ingest': 'Security Alerts',
      'weather_alerts_ingest': 'Weather Alerts',
      'incidents': 'Provincial Incidents',
      'hub_incidents': 'Hub Incidents',
      'immigration_travel_announcements': 'Immigration Announcements'
    };
    return mapping[tableName] || tableName;
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'archive':
        return <Badge variant="destructive">Archived</Badge>;
      case 'unarchive':
        return <Badge variant="default">Restored</Badge>;
      default:
        return <Badge variant="secondary">{action}</Badge>;
    }
  };

  const exportToCsv = () => {
    const headers = ['Date', 'User', 'Action', 'Source', 'Alert ID', 'Reason'];
    const csvData = [
      headers.join(','),
      ...filteredLog.map(entry => [
        new Date(entry.created_at).toLocaleString(),
        entry.user_email || 'Unknown',
        entry.action,
        getSourceDisplayName(entry.alert_table),
        entry.alert_id,
        entry.reason || 'No reason provided'
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `archive-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Archive History & Audit Trail
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCsv}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchArchiveLog}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Complete audit trail of all archive operations with user attribution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by reason, user, or alert ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="source-filter">Source</Label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="security_alerts_ingest">Security Alerts</SelectItem>
                  <SelectItem value="weather_alerts_ingest">Weather Alerts</SelectItem>
                  <SelectItem value="incidents">Provincial Incidents</SelectItem>
                  <SelectItem value="hub_incidents">Hub Incidents</SelectItem>
                  <SelectItem value="immigration_travel_announcements">Immigration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="action-filter">Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                  <SelectItem value="unarchive">Unarchive</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Badge variant="outline" className="whitespace-nowrap">
                {filteredLog.length} entries
              </Badge>
            </div>
          </div>

          {/* Archive Log Table */}
          <div className="border rounded-lg">
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p>Loading archive history...</p>
                </div>
              ) : filteredLog.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No archive history found matching your criteria
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {filteredLog.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          {getActionBadge(entry.action)}
                          <Badge variant="outline">
                            {getSourceDisplayName(entry.alert_table)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            by {entry.user_email}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Alert ID:</span> {entry.alert_id}
                        </div>
                        {entry.reason && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Reason:</span> {entry.reason}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {new Date(entry.created_at).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEntry(entry);
                          setShowDetailModal(true);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Details
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ArchiveDetailModal
        entry={selectedEntry}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEntry(null);
        }}
      />
    </>
  );
};

export default ArchiveHistoryViewer;
