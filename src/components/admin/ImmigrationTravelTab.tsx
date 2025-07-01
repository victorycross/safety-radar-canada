
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Calendar, 
  ExternalLink, 
  Archive, 
  RefreshCw,
  Users,
  Plane,
  Building,
  Globe
} from 'lucide-react';

interface ImmigrationTravelAnnouncement {
  id: string;
  title: string;
  summary: string;
  content?: string;
  link?: string;
  pub_date: string;
  source: string;
  category: string;
  announcement_type: string;
  location: string;
  created_at: string;
  archived_at?: string;
}

const ImmigrationTravelTab = () => {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<ImmigrationTravelAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('immigration_travel_announcements')
        .select('*')
        .is('archived_at', null)
        .order('pub_date', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,summary.ilike.%${searchTerm}%`);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      if (typeFilter !== 'all') {
        query = query.eq('announcement_type', typeFilter);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      toast({
        title: 'Error',
        description: 'Failed to load immigration and travel announcements',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [searchTerm, categoryFilter, typeFilter]);

  const handleArchive = async (announcementId: string) => {
    try {
      const { error } = await supabase
        .from('immigration_travel_announcements')
        .update({
          archived_at: new Date().toISOString(),
          archive_reason: 'Manual archive from admin'
        })
        .eq('id', announcementId);

      if (error) throw error;

      toast({
        title: 'Archived',
        description: 'Announcement has been archived successfully',
      });

      fetchAnnouncements();
    } catch (error) {
      console.error('Error archiving announcement:', error);
      toast({
        title: 'Error',
        description: 'Failed to archive announcement',
        variant: 'destructive'
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'immigration': return <Users className="h-4 w-4" />;
      case 'citizenship': return <Building className="h-4 w-4" />;
      case 'refugee': return <Globe className="h-4 w-4" />;
      case 'travel': return <Plane className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'immigration': return 'bg-blue-100 text-blue-800';
      case 'citizenship': return 'bg-green-100 text-green-800';
      case 'refugee': return 'bg-purple-100 text-purple-800';
      case 'travel': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: announcements.length,
    immigration: announcements.filter(a => a.announcement_type === 'immigration').length,
    citizenship: announcements.filter(a => a.announcement_type === 'citizenship').length,
    refugee: announcements.filter(a => a.announcement_type === 'refugee').length,
    travel: announcements.filter(a => a.announcement_type === 'travel').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Immigration & Travel Announcements</h2>
        <p className="text-muted-foreground">Monitor government announcements related to immigration, citizenship, refugees, and travel</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Immigration</p>
                <p className="text-2xl font-bold">{stats.immigration}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Citizenship</p>
                <p className="text-2xl font-bold">{stats.citizenship}</p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Refugee</p>
                <p className="text-2xl font-bold">{stats.refugee}</p>
              </div>
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Travel</p>
                <p className="text-2xl font-bold">{stats.travel}</p>
              </div>
              <Plane className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="news releases">News Releases</SelectItem>
            <SelectItem value="statements">Statements</SelectItem>
            <SelectItem value="media advisories">Media Advisories</SelectItem>
            <SelectItem value="backgrounders">Backgrounders</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="immigration">Immigration</SelectItem>
            <SelectItem value="citizenship">Citizenship</SelectItem>
            <SelectItem value="refugee">Refugee</SelectItem>
            <SelectItem value="travel">Travel</SelectItem>
          </SelectContent>
        </Select>
        
        <Button onClick={fetchAnnouncements} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(announcement.announcement_type)}
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(announcement.pub_date).toLocaleDateString()}
                    <span>•</span>
                    <span>{announcement.source}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{announcement.category}</Badge>
                  <Badge className={getTypeBadgeColor(announcement.announcement_type)}>
                    {announcement.announcement_type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                {announcement.summary}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {announcement.link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={announcement.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Full Announcement
                      </a>
                    </Button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleArchive(announcement.id)}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {announcements.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No immigration and travel announcements found matching your criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImmigrationTravelTab;
