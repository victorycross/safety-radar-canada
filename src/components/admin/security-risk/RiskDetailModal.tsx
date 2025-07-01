
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, User, AlertTriangle, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SecurityRisk {
  id: string;
  threat_category: string;
  likelihood: number;
  impact: number;
  preparedness_gap: number;
  rpn: number;
  priority: 'high' | 'medium' | 'low';
  last_reviewed: string;
  assigned_lead: string;
  current_alerts: string;
  notes: string;
  playbook: string;
  live_feeds: any; // Using any to handle Json type from Supabase
}

interface RiskDetailModalProps {
  risk: SecurityRisk;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RiskDetailModal = ({ risk, open, onOpenChange }: RiskDetailModalProps) => {
  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  // Handle live_feeds as an array, with fallback for empty or invalid data
  const liveFeeds = Array.isArray(risk.live_feeds) ? risk.live_feeds : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {risk.threat_category}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Risk Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{risk.likelihood}</div>
                  <div className="text-sm text-muted-foreground">Likelihood</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{risk.impact}</div>
                  <div className="text-sm text-muted-foreground">Impact</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{risk.preparedness_gap}</div>
                  <div className="text-sm text-muted-foreground">Prep. Gap</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{risk.rpn}</div>
                  <div className="text-sm text-muted-foreground">RPN</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <Badge className={getPriorityBadge(risk.priority)}>
                    {risk.priority.toUpperCase()}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">Priority</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="playbook">Playbook</TabsTrigger>
              <TabsTrigger value="feeds">Live Feeds</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Assignment Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <strong>Assigned Lead:</strong> {risk.assigned_lead || 'Unassigned'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <strong>Last Reviewed:</strong> {risk.last_reviewed ? new Date(risk.last_reviewed).toLocaleDateString() : 'Never'}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Current Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <strong>Current Alerts:</strong>
                      <p className="mt-1 text-sm">{risk.current_alerts || 'No current alerts'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="playbook" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Response Playbook
                  </CardTitle>
                  <CardDescription>
                    Detailed response procedures and coordination protocols
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{risk.playbook || 'No playbook available'}</ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="feeds" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Live Data Feeds</CardTitle>
                  <CardDescription>
                    Real-time monitoring and intelligence sources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {liveFeeds.map((feed: any, index: number) => (
                      <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{feed?.name || 'Unknown Feed'}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{feed?.description || 'No description available'}</p>
                        </div>
                        {feed?.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(feed.url, '_blank')}
                            className="ml-4"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {liveFeeds.length === 0 && (
                      <p className="text-muted-foreground">No live feeds configured</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap">
                    {risk.notes || 'No additional notes available'}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskDetailModal;
