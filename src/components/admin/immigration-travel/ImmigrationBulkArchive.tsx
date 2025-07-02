
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Archive, SelectAll, RotateCcw } from 'lucide-react';

interface ImmigrationTravelAnnouncement {
  id: string;
  title: string;
  summary: string;
  pub_date: string;
  source: string;
  category: string;
  announcement_type: string;
  archived_at?: string;
}

interface ImmigrationBulkArchiveProps {
  onRefresh: () => void;
}

const ImmigrationBulkArchive: React.FC<ImmigrationBulkArchiveProps> = ({ onRefresh }) => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<ImmigrationTravelAnnouncement[]>([]);
  const [archivedAnnouncements, setArchivedAnnouncements] = useState<ImmigrationTravelAnnouncement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [archiveReason, setArchiveReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  const fetchAnnouncements = async () => {
    try {
      // Fetch active announcements
      const { data: activeData, error: activeError } = await supabase
        .from('immigration_travel_announcements')
        .select('*')
        .is('archived_at', null)
        .order('pub_date', { ascending: false });

      if (activeError) throw activeError;

      // Fetch archived announcements
      const { data: archivedData, error: archivedError } = await supabase
        .from('immigration_travel_announcements')
        .select('*')
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false });

      if (archivedError) throw archivedError;

      setAnnouncements(activeData || []);
      setArchivedAnnouncements(archivedData || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load announcements',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSelectAll = () => {
    const currentList = activeTab === 'active' ? announcements : archivedAnnouncements;
    if (selectedIds.length === currentList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(currentList.map(a => a.id));
    }
  };

  const handleSelectAnnouncement = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleBulkArchive = async () => {
    if (selectedIds.length === 0 || !archiveReason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please select announcements and provide a reason',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('bulk_archive_alerts', {
        alert_table_name: 'immigration_travel_announcements',
        alert_ids: selectedIds,
        archive_reason: archiveReason.trim()
      });

      if (error) throw error;

      const result = data as { success: boolean; updated_count: number; error?: string };

      if (result.success) {
        toast({
          title: 'Bulk Archive Successful',
          description: `Successfully archived ${result.updated_count} immigration announcements`,
        });
        
        setSelectedIds([]);
        setArchiveReason('');
        await fetchAnnouncements();
        onRefresh();
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error archiving announcements:', error);
      toast({
        title: 'Archive Failed',
        description: error instanceof Error ? error.message : 'Failed to archive announcements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUnarchive = async () => {
    if (selectedIds.length === 0 || !archiveReason.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please select announcements and provide a reason',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('bulk_unarchive_alerts', {
        alert_table_name: 'immigration_travel_announcements',
        alert_ids: selectedIds,
        unarchive_reason: archiveReason.trim()
      });

      if (error) throw error;

      const result = data as { success: boolean; updated_count: number; error?: string };

      if (result.success) {
        toast({
          title: 'Bulk Unarchive Successful',
          description: `Successfully unarchived ${result.updated_count} immigration announcements`,
        });
        
        setSelectedIds([]);
        setArchiveReason('');
        await fetchAnnouncements();
        onRefresh();
      } else {
        throw new Error(result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error unarchiving announcements:', error);
      toast({
        title: 'Unarchive Failed',
        description: error instanceof Error ? error.message : 'Failed to unarchive announcements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const currentList = activeTab === 'active' ? announcements : archivedAnnouncements;
  const isAllSelected = selectedIds.length === currentList.length && currentList.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Bulk Archive Immigration Announcements</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActiveTab('active');
                setSelectedIds([]);
              }}
            >
              Active ({announcements.length})
            </Button>
            <Button
              variant={activeTab === 'archived' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setActiveTab('archived');
                setSelectedIds([]);
              }}
            >
              Archived ({archivedAnnouncements.length})
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bulk Actions Controls */}
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="flex items-center gap-2"
          >
            <SelectAll className="h-4 w-4" />
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </Button>
          
          <div className="flex-1">
            <Label htmlFor="reason" className="text-sm">Reason for {activeTab === 'active' ? 'archiving' : 'unarchiving'}</Label>
            <Input
              id="reason"
              placeholder={`Enter reason for ${activeTab === 'active' ? 'archiving' : 'unarchiving'} selected announcements...`}
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              className="mt-1"
            />
          </div>

          {activeTab === 'active' ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={selectedIds.length === 0 || !archiveReason.trim() || loading}
                  className="flex items-center gap-2"
                >
                  <Archive className="h-4 w-4" />
                  Archive ({selectedIds.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Bulk Archive</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to archive {selectedIds.length} immigration announcements? 
                    This action can be undone later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkArchive} disabled={loading}>
                    {loading ? 'Archiving...' : 'Archive'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  disabled={selectedIds.length === 0 || !archiveReason.trim() || loading}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Unarchive ({selectedIds.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Bulk Unarchive</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to unarchive {selectedIds.length} immigration announcements?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkUnarchive} disabled={loading}>
                    {loading ? 'Unarchiving...' : 'Unarchive'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Announcements List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {currentList.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No {activeTab} immigration announcements found
            </div>
          ) : (
            currentList.map((announcement) => (
              <div
                key={announcement.id}
                className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                  selectedIds.includes(announcement.id) ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={() => handleSelectAnnouncement(announcement.id)}
              >
                <Checkbox
                  checked={selectedIds.includes(announcement.id)}
                  onChange={() => handleSelectAnnouncement(announcement.id)}
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">{announcement.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {announcement.summary?.substring(0, 100)}...
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {announcement.category}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {announcement.announcement_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(announcement.pub_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {selectedIds.length > 0 && (
          <div className="text-sm text-muted-foreground">
            {selectedIds.length} of {currentList.length} announcements selected
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImmigrationBulkArchive;
