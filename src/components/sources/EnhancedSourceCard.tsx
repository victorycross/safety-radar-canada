
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Bell, 
  Info, 
  AlertTriangle, 
  Globe, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  TrendingUp,
  Settings,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';

export interface EnhancedSource {
  id: string;
  name: string;
  description: string;
  type: string;
  verificationStatus: 'verified' | 'unverified';
  lastUpdate: string;
  route?: string;
  healthStatus: 'healthy' | 'degraded' | 'offline' | 'error';
  uptime: number;
  dataVolume: number;
  responseTime: number;
  errorRate: number;
  reliabilityScore: number;
}

interface EnhancedSourceCardProps {
  source: EnhancedSource;
  onConfigure?: (sourceId: string) => void;
  onTest?: (sourceId: string) => void;
}

const EnhancedSourceCard = ({ source, onConfigure, onTest }: EnhancedSourceCardProps) => {
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'offline': return 'text-gray-600 bg-gray-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'offline': return <XCircle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getReliabilityColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {source.name}
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getHealthStatusColor(source.healthStatus)}`}>
                {getHealthIcon(source.healthStatus)}
                {source.healthStatus}
              </div>
            </CardTitle>
            <CardDescription className="mt-1">{source.description}</CardDescription>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {source.verificationStatus === 'verified' ? (
              <Badge className="bg-success hover:bg-success/90">Verified</Badge>
            ) : (
              <Badge variant="outline">Unverified</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={source.uptime} className="flex-1 h-2" />
              <span className="text-sm font-medium">{source.uptime}%</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Zap className="h-3 w-3" />
              <span>Reliability</span>
            </div>
            <div className={`text-sm font-medium ${getReliabilityColor(source.reliabilityScore)}`}>
              {source.reliabilityScore}/100
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Response Time</span>
            </div>
            <div className="text-sm font-medium">{source.responseTime}ms</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <AlertTriangle className="h-3 w-3" />
              <span>Error Rate</span>
            </div>
            <div className="text-sm font-medium">{source.errorRate}%</div>
          </div>
        </div>

        {/* Last Update */}
        <div className="flex items-center text-sm text-muted-foreground border-t pt-3">
          <Clock className="h-3 w-3 mr-1" />
          <span>Last update: {source.lastUpdate}</span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        {source.route ? (
          <Link to={source.route} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Globe className="mr-2 h-4 w-4" />
              View Data Feed
            </Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onTest?.(source.id)}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Test Connection
          </Button>
        )}
        
        <Button variant="ghost" size="sm" onClick={() => onConfigure?.(source.id)}>
          <Settings className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EnhancedSourceCard;
