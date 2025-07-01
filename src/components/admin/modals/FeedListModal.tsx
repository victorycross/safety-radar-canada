
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useDataManagement, RSSFeed } from '@/hooks/useDataManagement';

interface FeedListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditFeed: (feed: RSSFeed) => void;
}

const FeedListModal: React.FC<FeedListModalProps> = ({
  isOpen,
  onClose,
  onEditFeed
}) => {
  const { fetchRSSFeeds, deleteRSSFeed, updateRSSFeed, loading } = useDataManagement();
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFeeds();
    }
  }, [isOpen]);

  const loadFeeds = async () => {
    setLoadingFeeds(true);
    try {
      const feedsData = await fetchRSSFeeds();
      setFeeds(feedsData);
    } catch (error) {
      console.error('Error loading feeds:', error);
    } finally {
      setLoadingFeeds(false);
    }
  };

  const handleDeleteFeed = async (feedId: string) => {
    if (window.confirm('Are you sure you want to delete this feed?')) {
      try {
        await deleteRSSFeed(feedId);
        await loadFeeds(); // Refresh the list
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleToggleActive = async (feed: RSSFeed) => {
    try {
      await updateRSSFeed(feed.id, { is_active: !feed.is_active });
      await loadFeeds(); // Refresh the list
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditFeed = (feed: RSSFeed) => {
    onEditFeed(feed);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage RSS Feeds</DialogTitle>
          <DialogDescription>
            Edit, delete, or toggle the status of your RSS feeds
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {loadingFeeds ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading feeds...</span>
            </div>
          ) : feeds.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>No RSS feeds found</span>
            </div>
          ) : (
            feeds.map((feed) => (
              <Card key={feed.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{feed.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={feed.is_active ? "default" : "secondary"}>
                        {feed.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{feed.category}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">URL:</p>
                      <p className="text-sm font-mono break-all">{feed.url}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Polling Interval: {feed.polling_interval} seconds
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditFeed(feed)}
                          disabled={loading}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(feed)}
                          disabled={loading}
                        >
                          {feed.is_active ? (
                            <ToggleRight className="h-4 w-4 mr-1" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 mr-1" />
                          )}
                          {feed.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteFeed(feed.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedListModal;
