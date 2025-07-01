
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Monitor, 
  FileText, 
  Mail, 
  Download, 
  Settings,
  BarChart3,
  Bell,
  Share,
  Calendar,
  Users
} from 'lucide-react';
import TemplateModal from '../modals/TemplateModal';

const OutputsManagementTab = () => {
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const handleOpenTemplateModal = (mode: 'create' | 'edit' = 'create') => {
    setModalMode(mode);
    setTemplateModalOpen(true);
  };

  const handleModalSuccess = () => {
    // Refresh data or update UI as needed
    console.log('Template operation successful');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Output & Distribution Management</h3>
        <p className="text-muted-foreground">
          Configure dashboards, reports, communications, and data distribution
        </p>
      </div>

      {/* Dashboard Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Dashboard Configuration
          </CardTitle>
          <CardDescription>
            Real-time displays, executive views, and operational dashboards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Executive Dashboard</span>
                  <Badge variant="default">Live</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Operations Center</span>
                  <Badge variant="default">Live</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Alert Ready View</span>
                  <Badge variant="default">Live</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Analytics Portal</span>
                  <Badge variant="secondary">Configured</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Button className="w-full">
                  <Monitor className="h-4 w-4 mr-2" />
                  Configure Dashboards
                </Button>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Widget Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Generation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Generation
          </CardTitle>
          <CardDescription>
            Incident reports, analytics summaries, and compliance documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <FileText className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Incident Reports</div>
                  <div className="text-xs opacity-75">Automated incident summaries</div>
                </div>
              </Button>

              <Button variant="outline" className="h-20 flex-col gap-2">
                <BarChart3 className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Analytics Reports</div>
                  <div className="text-xs opacity-75">Trends and metrics</div>
                </div>
              </Button>

              <Button variant="outline" className="h-20 flex-col gap-2">
                <Calendar className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Scheduled Reports</div>
                  <div className="text-xs opacity-75">Automated delivery</div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Communication Templates
          </CardTitle>
          <CardDescription>
            Alert formats, notification templates, and message customization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Email Templates</span>
                <Badge variant="default">8 Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">SMS Templates</span>
                <Badge variant="default">4 Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Push Notifications</span>
                <Badge variant="default">6 Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Alert Formats</span>
                <Badge variant="default">12 Types</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => handleOpenTemplateModal('create')}>
                <Mail className="h-4 w-4 mr-2" />
                Create Template
              </Button>
              <Button variant="outline" className="w-full" onClick={() => handleOpenTemplateModal('edit')}>
                <Settings className="h-4 w-4 mr-2" />
                Manage Templates
              </Button>
              <Button variant="outline" className="w-full">
                <Bell className="h-4 w-4 mr-2" />
                Notification Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Tools Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Tools
          </CardTitle>
          <CardDescription>
            Data extracts, backups, and integration feeds
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Download className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Data Export</div>
                  <div className="text-xs opacity-75">CSV, Excel, JSON formats</div>
                </div>
              </Button>

              <Button variant="outline" className="h-20 flex-col gap-2">
                <Share className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">API Feeds</div>
                  <div className="text-xs opacity-75">Real-time data sharing</div>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distribution Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Distribution Settings
          </CardTitle>
          <CardDescription>
            Who gets what information, when, and through which channels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Distribution Lists</span>
                  <Badge variant="default">12 Lists</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Escalation Rules</span>
                  <Badge variant="default">6 Rules</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Schedule Settings</span>
                  <Badge variant="default">Configured</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Channel Preferences</span>
                  <Badge variant="default">Per User</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Button className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Recipients
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Modal */}
      <TemplateModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSuccess={handleModalSuccess}
        mode={modalMode}
      />
    </div>
  );
};

export default OutputsManagementTab;
