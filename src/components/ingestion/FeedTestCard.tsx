
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye
} from 'lucide-react';

interface FeedTest {
  sourceId: string;
  sourceName: string;
  status: 'idle' | 'testing' | 'success' | 'error';
  lastTest?: Date;
  records?: number;
  error?: string;
  rawData?: any;
  details?: string;
}

interface FeedTestCardProps {
  feed: FeedTest;
  onTest: (sourceId: string) => void;
  onViewDetails: (sourceId: string) => void;
}

const FeedTestCard: React.FC<FeedTestCardProps> = ({ feed, onTest, onViewDetails }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'testing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card className="border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">{feed.sourceName}</h4>
          {getStatusIcon(feed.status)}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span>Status:</span>
            <Badge variant={
              feed.status === 'success' ? 'default' :
              feed.status === 'error' ? 'destructive' :
              feed.status === 'testing' ? 'secondary' : 'outline'
            }>
              {feed.status.toUpperCase()}
            </Badge>
          </div>
          
          {feed.lastTest && (
            <div className="flex justify-between items-center text-xs">
              <span>Last Test:</span>
              <span>{feed.lastTest.toLocaleTimeString()}</span>
            </div>
          )}
          
          {feed.records !== undefined && (
            <div className="flex justify-between items-center text-xs">
              <span>Records:</span>
              <span className={feed.records === 0 ? 'text-orange-600' : 'text-green-600'}>
                {feed.records}
              </span>
            </div>
          )}
          
          {feed.error && (
            <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded">
              {feed.error}
            </div>
          )}

          {feed.records === 0 && feed.status === 'success' && (
            <div className="text-xs text-orange-600 mt-2 p-2 bg-orange-50 rounded">
              Connected but no data - may need API key
            </div>
          )}
          
          <div className="flex space-x-1 mt-3">
            <Button 
              size="sm" 
              onClick={() => onTest(feed.sourceId)}
              disabled={feed.status === 'testing'}
              className="flex-1"
            >
              {feed.status === 'testing' ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onViewDetails(feed.sourceId)}
            >
              <Eye className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedTestCard;
