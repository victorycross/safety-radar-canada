
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, ExternalLink, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertSource } from '@/types/dataIngestion';
import FeedHealthStatus from './FeedHealthStatus';
import FeedStatusToggle from './FeedStatusToggle';
import FeedTestResult from './FeedTestResult';
import FeedActions from './FeedActions';

interface FeedConfigurationCardProps {
  feed: AlertSource;
  onUpdate: () => void;
}

const FeedConfigurationCard: React.FC<FeedConfigurationCardProps> = ({ feed, onUpdate }) => {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const handleToggleActive = async (isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('alert_sources')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', feed.id);

      if (error) throw error;

      toast({
        title: isActive ? 'Feed Activated' : 'Feed Deactivated',
        description: `${feed.name} has been ${isActive ? 'activated' : 'deactivated'}`,
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating feed status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update feed status',
        variant: 'destructive'
      });
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      // Simulate feed testing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        success: Math.random() > 0.3,
        responseTime: Math.floor(Math.random() * 500) + 100,
        recordsFound: Math.floor(Math.random() * 50),
        timestamp: new Date().toISOString()
      };
      
      setTestResult(mockResult);
      
      toast({
        title: mockResult.success ? 'Test Successful' : 'Test Failed',
        description: mockResult.success 
          ? `Found ${mockResult.recordsFound} records in ${mockResult.responseTime}ms`
          : 'Failed to connect to feed endpoint',
        variant: mockResult.success ? 'default' : 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm(`Are you sure you want to remove "${feed.name}"? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('alert_sources')
        .delete()
        .eq('id', feed.id);

      if (error) throw error;

      toast({
        title: 'Feed Removed',
        description: `${feed.name} has been successfully removed`,
      });

      onUpdate();
    } catch (error) {
      console.error('Error removing feed:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove feed',
        variant: 'destructive'
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatLastPoll = (lastPoll: string | null) => {
    if (!lastPoll) return 'Never';
    const date = new Date(lastPoll);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={`transition-all ${feed.is_active ? 'border-primary/20' : 'border-muted'}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center">
              {feed.name}
              {feed.is_active && (
                <Activity className="h-4 w-4 ml-2 text-primary animate-pulse" />
              )}
            </CardTitle>
            <CardDescription className="text-sm">
              {feed.description || 'No description provided'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <FeedHealthStatus status={feed.health_status} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={deleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium">Source Type</p>
            <Badge variant="outline">{feed.source_type}</Badge>
          </div>
          <div>
            <p className="font-medium">Polling Interval</p>
            <p className="text-muted-foreground">{feed.polling_interval}s</p>
          </div>
          <div>
            <p className="font-medium">Last Poll</p>
            <p className="text-muted-foreground">{formatLastPoll(feed.last_poll_at)}</p>
          </div>
          <div>
            <p className="font-medium">Status</p>
            <FeedStatusToggle
              isActive={feed.is_active}
              onToggle={handleToggleActive}
            />
          </div>
        </div>

        {feed.api_endpoint && (
          <div>
            <p className="font-medium text-sm mb-1">Endpoint</p>
            <div className="flex items-center space-x-2">
              <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                {feed.api_endpoint}
              </code>
              <Button size="sm" variant="ghost" asChild>
                <a href={feed.api_endpoint} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        )}

        <FeedTestResult testResult={testResult} />

        <FeedActions onTest={handleTest} testing={testing} />
      </CardContent>
    </Card>
  );
};

export default FeedConfigurationCard;
