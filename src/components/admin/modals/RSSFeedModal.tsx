
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useDataManagement, RSSFeed } from '@/hooks/useDataManagement';

interface RSSFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  feed?: RSSFeed | null;
  mode: 'create' | 'edit';
}

const RSSFeedModal: React.FC<RSSFeedModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  feed,
  mode
}) => {
  const { createRSSFeed, updateRSSFeed, loading } = useDataManagement();
  const [formData, setFormData] = useState({
    name: feed?.name || '',
    url: feed?.url || '',
    category: feed?.category || 'general',
    is_active: feed?.is_active ?? true,
    polling_interval: feed?.polling_interval || 300
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'create') {
        await createRSSFeed(formData);
      } else if (feed) {
        await updateRSSFeed(feed.id, formData);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add RSS Feed' : 'Edit RSS Feed'}
          </DialogTitle>
          <DialogDescription>
            Configure the RSS feed source for automatic data collection.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Feed Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter feed name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">RSS URL</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="https://example.com/rss"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weather">Weather</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="polling_interval">Polling Interval (seconds)</Label>
            <Input
              id="polling_interval"
              type="number"
              value={formData.polling_interval}
              onChange={(e) => handleChange('polling_interval', parseInt(e.target.value))}
              min="60"
              max="3600"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create Feed' : 'Update Feed'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RSSFeedModal;
