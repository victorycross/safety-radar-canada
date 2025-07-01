
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Rss, 
  Globe, 
  Database,
  Users,
  Plus,
  Settings
} from 'lucide-react';
import RSSFeedModal from '../modals/RSSFeedModal';
import APISourceModal from '../modals/APISourceModal';
import FeedListModal from '../modals/FeedListModal';
import APISourceListModal from '../modals/APISourceListModal';
import { RSSFeed, APISource } from '@/hooks/useDataManagement';

const InputsManagementTab = () => {
  const [rssModalOpen, setRssModalOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [feedListModalOpen, setFeedListModalOpen] = useState(false);
  const [apiSourceListModalOpen, setApiSourceListModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedFeed, setSelectedFeed] = useState<RSSFeed | null>(null);
  const [selectedAPISource, setSelectedAPISource] = useState<APISource | null>(null);

  const handleOpenRSSModal = (mode: 'create' | 'edit' = 'create', feed?: RSSFeed) => {
    setModalMode(mode);
    setSelectedFeed(feed || null);
    setRssModalOpen(true);
  };

  const handleOpenAPIModal = (mode: 'create' | 'edit' = 'create', source?: APISource) => {
    setModalMode(mode);
    setSelectedAPISource(source || null);
    setApiModalOpen(true);
  };

  const handleOpenFeedListModal = () => {
    setFeedListModalOpen(true);
  };

  const handleOpenAPIListModal = () => {
    setApiSourceListModalOpen(true);
  };

  const handleEditFeed = (feed: RSSFeed) => {
    handleOpenRSSModal('edit', feed);
  };

  const handleEditAPISource = (source: APISource) => {
    handleOpenAPIModal('edit', source);
  };

  const handleModalSuccess = () => {
    // Refresh data or update UI as needed
    console.log('Operation successful');
    setSelectedFeed(null);
    setSelectedAPISource(null);
  };

  const handleModalClose = () => {
    setSelectedFeed(null);
    setSelectedAPISource(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold">Input Sources Management</h3>
        <p className="text-muted-foreground">
          Configure and manage all data collection sources
        </p>
      </div>

      {/* Manual Entry Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Manual Data Entry
          </CardTitle>
          <CardDescription>
            Forms and direct input interfaces for manual data collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2">
              <Users className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Employee Forms</div>
                <div className="text-xs opacity-75">Manual employee data entry</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Incident Reports</div>
                <div className="text-xs opacity-75">Manual incident logging</div>
              </div>
            </Button>

            <Button variant="outline" className="h-20 flex-col gap-2">
              <Plus className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Custom Forms</div>
                <div className="text-xs opacity-75">Create new input forms</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            File Upload & Bulk Import
          </CardTitle>
          <CardDescription>
            CSV imports, spreadsheet uploads, and bulk data operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Employee Data CSV</span>
                <Badge variant="secondary">Ready</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Location Updates</span>
                <Badge variant="secondary">Ready</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Travel Records</span>
                <Badge variant="secondary">Ready</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Button className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload New File
              </Button>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Configure Templates
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RSS Feeds Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rss className="h-5 w-5" />
            RSS Feed Configuration
          </CardTitle>
          <CardDescription>
            Weather alerts, security feeds, and news sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Weather Canada</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Security Alerts</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Travel Advisories</span>
                  <Badge variant="secondary">Paused</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Emergency Services</span>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => handleOpenRSSModal('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add RSS Feed
                </Button>
                <Button variant="outline" className="w-full" onClick={handleOpenFeedListModal}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Feeds
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Data Sources Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            API Data Sources
          </CardTitle>
          <CardDescription>
            Government alerts, travel systems, and external API integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Government Alerts API</span>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Immigration Canada</span>
                  <Badge variant="default">Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Travel Advisory API</span>
                  <Badge variant="destructive">Error</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Emergency Services</span>
                  <Badge variant="default">Connected</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => handleOpenAPIModal('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add API Source
                </Button>
                <Button variant="outline" className="w-full" onClick={handleOpenAPIListModal}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure APIs
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            System Integrations
          </CardTitle>
          <CardDescription>
            HR systems, travel platforms, and internal database connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">HR Management System</span>
                <Badge variant="secondary">Configured</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Travel Booking Platform</span>
                <Badge variant="secondary">Configured</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Internal Database</span>
                <Badge variant="default">Active</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Manage Connections
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <RSSFeedModal
        isOpen={rssModalOpen}
        onClose={() => {
          setRssModalOpen(false);
          handleModalClose();
        }}
        onSuccess={handleModalSuccess}
        mode={modalMode}
        feed={selectedFeed}
      />

      <APISourceModal
        isOpen={apiModalOpen}
        onClose={() => {
          setApiModalOpen(false);
          handleModalClose();
        }}
        onSuccess={handleModalSuccess}
        mode={modalMode}
        source={selectedAPISource}
      />

      <FeedListModal
        isOpen={feedListModalOpen}
        onClose={() => setFeedListModalOpen(false)}
        onEditFeed={handleEditFeed}
      />

      <APISourceListModal
        isOpen={apiSourceListModalOpen}
        onClose={() => setApiSourceListModalOpen(false)}
        onEditSource={handleEditAPISource}
      />
    </div>
  );
};

export default InputsManagementTab;
