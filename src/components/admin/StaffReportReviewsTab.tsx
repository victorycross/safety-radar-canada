import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye, FileText, User, MapPin, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchStaffIncidentReports, 
  approveStaffIncidentReport, 
  rejectStaffIncidentReport, 
  type StaffIncidentReport 
} from '@/services/staffIncidentService';
import { formatDistanceToNow } from 'date-fns';

const StaffReportReviewsTab = () => {
  const [reports, setReports] = useState<StaffIncidentReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<StaffIncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<StaffIncidentReport | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const { toast } = useToast();

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await fetchStaffIncidentReports();
      setReports(data);
      setFilteredReports(data);
    } catch (error) {
      console.error('Error loading staff reports:', error);
      toast({
        title: "Error",
        description: "Failed to load staff incident reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Filter reports based on search and status
  useEffect(() => {
    let filtered = reports;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.review_status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(report => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  }, [reports, statusFilter, searchTerm]);

  const handleReviewAction = async () => {
    if (!selectedReport || !reviewAction) return;

    setSubmitting(true);
    try {
      let result;
      if (reviewAction === 'approve') {
        result = await approveStaffIncidentReport(selectedReport.id, reviewNotes);
      } else {
        result = await rejectStaffIncidentReport(selectedReport.id, reviewNotes);
      }

      if (result.success) {
        toast({
          title: `Report ${reviewAction === 'approve' ? 'Approved' : 'Rejected'}`,
          description: `Staff incident report has been ${reviewAction === 'approve' ? 'approved and converted to an incident' : 'rejected'}.`
        });
        
        // Reload reports to reflect changes
        await loadReports();
        
        // Close dialog
        setSelectedReport(null);
        setReviewAction(null);
        setReviewNotes('');
      } else {
        throw new Error(result.error || 'Review action failed');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process review action",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAlertLevelBadge = (level: string) => {
    switch (level) {
      case 'severe':
        return <Badge variant="destructive">Severe</Badge>;
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>;
      case 'normal':
        return <Badge variant="outline">Normal</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  const pendingCount = reports.filter(r => r.review_status === 'pending').length;
  const approvedCount = reports.filter(r => r.review_status === 'approved').length;
  const rejectedCount = reports.filter(r => r.review_status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading staff reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Staff Report Reviews</h2>
        <p className="text-muted-foreground">
          Review and manage incident reports submitted by staff members
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-orange-600" />
              <div className="ml-2">
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-2xl font-bold">{approvedCount}</p>
                <p className="text-xs text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-600" />
              <div className="ml-2">
                <p className="text-2xl font-bold">{rejectedCount}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-xs text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Reports</Label>
              <Input
                id="search"
                placeholder="Search by title, tracking number, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label>Status Filter</Label>
              <Tabs value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports found</h3>
              <p className="text-muted-foreground">
                {statusFilter !== 'all' 
                  ? `No ${statusFilter} reports match your criteria`
                  : "No staff incident reports match your search criteria"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{report.title}</h3>
                      {getStatusBadge(report.review_status)}
                      {getAlertLevelBadge(report.alert_level)}
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {report.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {report.anonymous ? 'Anonymous' : (report.submitted_by || 'Staff Member')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {report.tracking_number}
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Review Staff Incident Report
                </DialogTitle>
                <DialogDescription>
                  Tracking Number: {selectedReport.tracking_number}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Report Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Title</Label>
                      <p className="text-sm">{selectedReport.title}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Alert Level</Label>
                      <div className="mt-1">
                        {getAlertLevelBadge(selectedReport.alert_level)}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Status</Label>
                      <div className="mt-1">
                        {getStatusBadge(selectedReport.review_status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Submitted By</Label>
                      <p className="text-sm">
                        {selectedReport.anonymous ? 'Anonymous Staff Member' : (selectedReport.submitted_by || 'Staff Member')}
                      </p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Contact Information</Label>
                      <p className="text-sm">{selectedReport.contact_info}</p>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Submitted</Label>
                      <p className="text-sm">
                        {formatDistanceToNow(new Date(selectedReport.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedReport.description}</p>
                  </div>
                </div>

                {selectedReport.review_status === 'pending' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reviewNotes">Review Notes</Label>
                      <Textarea
                        id="reviewNotes"
                        placeholder="Add notes about your review decision..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {selectedReport.review_notes && (
                  <div>
                    <Label className="text-sm font-medium">Previous Review Notes</Label>
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <p className="text-sm">{selectedReport.review_notes}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedReport.review_status === 'pending' && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReport(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setReviewAction('reject')}
                    disabled={submitting}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Report
                  </Button>
                  <Button
                    onClick={() => setReviewAction('approve')}
                    disabled={submitting}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve & Create Incident
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Review Actions */}
      <Dialog open={!!reviewAction} onOpenChange={() => setReviewAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve Report' : 'Reject Report'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' 
                ? 'This will approve the staff report and create a new incident on the dashboard.'
                : 'This will reject the staff report. The submitter will be notified of the decision.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewAction(null)}>
              Cancel
            </Button>
            <Button
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleReviewAction}
              disabled={submitting}
            >
              {submitting ? 'Processing...' : `Confirm ${reviewAction === 'approve' ? 'Approval' : 'Rejection'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffReportReviewsTab;