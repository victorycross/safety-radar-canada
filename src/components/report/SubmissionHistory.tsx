
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Eye, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface SubmissionHistoryProps {
  submissions: any[];
}

const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({ submissions }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'under_review':
        return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'requires_info':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'requires_info':
        return 'bg-orange-100 text-orange-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submission History</CardTitle>
          <CardDescription>Track the status of your incident reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No submissions yet</p>
            <p className="text-sm">Your submitted reports will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission History</CardTitle>
        <CardDescription>Track the status of your {submissions.length} incident reports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {submissions.map((submission, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium">{submission.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    Ref: #{submission.referenceId || Date.now() + index}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(submission.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(submission.status || 'submitted')}
                  <Badge className={getStatusColor(submission.status || 'submitted')}>
                    {submission.status?.replace('_', ' ') || 'Submitted'}
                  </Badge>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p className="line-clamp-2">{submission.description}</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="outline">{submission.alertLevel}</Badge>
                  <Badge variant="outline">{submission.province}</Badge>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
              </div>
              
              {submission.lastUpdate && (
                <div className="text-xs text-muted-foreground border-t pt-2">
                  Last update: {new Date(submission.lastUpdate).toLocaleDateString()} - {submission.updateMessage}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionHistory;
