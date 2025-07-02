import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Upload, 
  FileText, 
  Rss, 
  Globe, 
  Database,
  Users,
  Plus,
  Settings,
  ExternalLink,
  Clock,
  Power,
  PowerOff
} from 'lucide-react';
import RSSFeedModal from '../modals/RSSFeedModal';
import APISourceModal from '../modals/APISourceModal';
import FeedListModal from '../modals/FeedListModal';
import APISourceListModal from '../modals/APISourceListModal';
import SystemIntegrationModal from '../modals/SystemIntegrationModal';
import SystemIntegrationListModal from '../modals/SystemIntegrationListModal';
import CommunicationTemplateModal from '../modals/CommunicationTemplateModal';
import CommunicationTemplateListModal from '../modals/CommunicationTemplateListModal';
import { RSSFeed, APISource, SystemIntegration, CommunicationTemplate, useDataManagement } from '@/hooks/useDataManagement';

const InputsManagementTab = () => {
  const navigate = useNavigate();
  const { 
    fetchRSSFeeds, 
    updateRSSFeed, 
    fetchAPISources, 
    updateAPISource, 
    fetchSystemIntegrations, 
    updateSystemIntegration, 
    loading 
  } = useDataManagement();
  const [rssFeeds, setRssFeeds] = useState<RSSFeed[]>([]);
  const [apiSources, setApiSources] = useState<APISource[]>([]);
  const [systemIntegrations, setSystemIntegrations] = useState<SystemIntegration[]>([]);
  const [feedsLoading, setFeedsLoading] = useState(true);
  const [apiSourcesLoading, setApiSourcesLoading] = useState(true);
  const [systemIntegrationsLoading, setSystemIntegrationsLoading] = useState(true);
  const [rssModalOpen, setRssModalOpen] = useState(false);
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [feedListModalOpen, setFeedListModalOpen] = useState(false);
  const [apiSourceListModalOpen, setApiSourceListModalOpen] = useState(false);
  const [systemIntegrationModalOpen, setSystemIntegrationModalOpen] = useState(false);
  const [systemIntegrationListModalOpen, setSystemIntegrationListModalOpen] = useState(false);
  const [communicationTemplateModalOpen, setCommunicationTemplateModalOpen] = useState(false);
  const [communicationTemplateListModalOpen, setCommunicationTemplateListModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedFeed, setSelectedFeed] = useState<RSSFeed | null>(null);
  const [selectedAPISource, setSelectedAPISource] = useState<APISource | null>(null);
  const [selectedSystemIntegration, setSelectedSystemIntegration] = useState<SystemIntegration | null>(null);
  const [selectedCommunicationTemplate, setSelectedCommunicationTemplate] = useState<CommunicationTemplate | null>(null);

  // Load all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      // Load RSS feeds
      setFeedsLoading(true);
      try {
        const feeds = await fetchRSSFeeds();
        setRssFeeds(feeds);
      } catch (error) {
        console.error('Failed to load RSS feeds:', error);
      } finally {
        setFeedsLoading(false);
      }

      // Load API sources
      setApiSourcesLoading(true);
      try {
        const sources = await fetchAPISources();
        setApiSources(sources);
      } catch (error) {
        console.error('Failed to load API sources:', error);
      } finally {
        setApiSourcesLoading(false);
      }

      // Load system integrations
      setSystemIntegrationsLoading(true);
      try {
        const integrations = await fetchSystemIntegrations();
        setSystemIntegrations(integrations);
      } catch (error) {
        console.error('Failed to load system integrations:', error);
      } finally {
        setSystemIntegrationsLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Refresh all data when modals close
  const refreshAllData = async () => {
    const [feeds, sources, integrations] = await Promise.all([
      fetchRSSFeeds(),
      fetchAPISources(),
      fetchSystemIntegrations()
    ]);
    setRssFeeds(feeds);
    setApiSources(sources);
    setSystemIntegrations(integrations);
  };

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

  const handleOpenSystemIntegrationModal = (mode: 'create' | 'edit' = 'create', integration?: SystemIntegration) => {
    setModalMode(mode);
    setSelectedSystemIntegration(integration || null);
    setSystemIntegrationModalOpen(true);
  };

  const handleOpenCommunicationTemplateModal = (mode: 'create' | 'edit' = 'create', template?: CommunicationTemplate) => {
    setModalMode(mode);
    setSelectedCommunicationTemplate(template || null);
    setCommunicationTemplateModalOpen(true);
  };

  const handleEditFeed = (feed: RSSFeed) => {
    handleOpenRSSModal('edit', feed);
  };

  const handleEditAPISource = (source: APISource) => {
    handleOpenAPIModal('edit', source);
  };

  const handleEditSystemIntegration = (integration: SystemIntegration) => {
    handleOpenSystemIntegrationModal('edit', integration);
  };

  const handleEditCommunicationTemplate = (template: CommunicationTemplate) => {
    handleOpenCommunicationTemplateModal('edit', template);
  };

  const handleModalSuccess = () => {
    console.log('Operation successful');
    setSelectedFeed(null);
    setSelectedAPISource(null);
    setSelectedSystemIntegration(null);
    setSelectedCommunicationTemplate(null);
    refreshAllData(); // Refresh all data when operation is successful
  };

  const handleModalClose = () => {
    setSelectedFeed(null);
    setSelectedAPISource(null);
    setSelectedSystemIntegration(null);
    setSelectedCommunicationTemplate(null);
  };

  const handleEmployeeFormsClick = () => {
    navigate('/admin?tab=operations');
  };

  const handleIncidentReportsClick = () => {
    navigate('/report-incident');
  };

  const handleCustomFormsClick = () => {
    // For now, open the communication templates as a starting point for custom forms
    setCommunicationTemplateListModalOpen(true);
  };

  const toggleFeedStatus = async (feed: RSSFeed) => {
    try {
      await updateRSSFeed(feed.id, { ...feed, is_active: !feed.is_active });
      refreshAllData();
    } catch (error) {
      console.error('Failed to toggle feed status:', error);
    }
  };

  const toggleAPISourceStatus = async (source: APISource) => {
    try {
      await updateAPISource(source.id, { ...source, is_active: !source.is_active });
      refreshAllData();
    } catch (error) {
      console.error('Failed to toggle API source status:', error);
    }
  };

  const toggleSystemIntegrationStatus = async (integration: SystemIntegration) => {
    try {
      await updateSystemIntegration(integration.id, { ...integration, is_active: !integration.is_active });
      refreshAllData();
    } catch (error) {
      console.error('Failed to toggle system integration status:', error);
    }
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
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={handleEmployeeFormsClick}
            >
              <Users className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Employee Forms</div>
                <div className="text-xs opacity-75">Access employee management</div>
                <ExternalLink className="h-3 w-3 mt-1 mx-auto opacity-50" />
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={handleIncidentReportsClick}
            >
              <FileText className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Incident Reports</div>
                <div className="text-xs opacity-75">Report new incidents</div>
                <ExternalLink className="h-3 w-3 mt-1 mx-auto opacity-50" />
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={handleCustomFormsClick}
            >
              <Plus className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Custom Templates</div>
                <div className="text-xs opacity-75">Manage communication templates</div>
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
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setCommunicationTemplateListModalOpen(true)}
              >
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
                {feedsLoading ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))
                ) : rssFeeds.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Rss className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No RSS feeds configured</p>
                    <p className="text-sm">Add your first RSS feed to get started</p>
                  </div>
                ) : (
                  rssFeeds.map((feed) => (
                    <div key={feed.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{feed.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {feed.category}
                          </Badge>
                        </div>
                        {feed.last_updated && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Last updated: {new Date(feed.last_updated).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFeedStatus(feed)}
                          disabled={loading}
                        >
                          {feed.is_active ? (
                            <Power className="h-4 w-4 text-green-600" />
                          ) : (
                            <PowerOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Badge variant={feed.is_active ? "default" : "secondary"}>
                          {feed.is_active ? "Active" : "Paused"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => handleOpenRSSModal('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add RSS Feed
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setFeedListModalOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Feeds
                </Button>
                {rssFeeds.length > 0 && (
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    {rssFeeds.length} feed{rssFeeds.length !== 1 ? 's' : ''} configured
                  </div>
                )}
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
                {apiSourcesLoading ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))
                ) : apiSources.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No API sources configured</p>
                    <p className="text-sm">Add your first API source to get started</p>
                  </div>
                ) : (
                  apiSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{source.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {source.type || 'API'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          API Source
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAPISourceStatus(source)}
                          disabled={loading}
                        >
                          {source.is_active ? (
                            <Power className="h-4 w-4 text-green-600" />
                          ) : (
                            <PowerOff className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Badge variant={source.is_active ? "default" : "secondary"}>
                          {source.is_active ? "Connected" : "Disconnected"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="space-y-2">
                <Button className="w-full" onClick={() => handleOpenAPIModal('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add API Source
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setApiSourceListModalOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure APIs
                </Button>
                {apiSources.length > 0 && (
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    {apiSources.length} source{apiSources.length !== 1 ? 's' : ''} configured
                  </div>
                )}
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
              {systemIntegrationsLoading ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))
              ) : systemIntegrations.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No system integrations configured</p>
                  <p className="text-sm">Add your first integration to get started</p>
                </div>
              ) : (
                systemIntegrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{integration.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {integration.type || 'Integration'}
                        </Badge>
                      </div>
                      {integration.last_sync && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Last synced: {new Date(integration.last_sync).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleSystemIntegrationStatus(integration)}
                        disabled={loading}
                      >
                        {integration.is_active ? (
                          <Power className="h-4 w-4 text-green-600" />
                        ) : (
                          <PowerOff className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Badge variant={integration.is_active ? "default" : "secondary"}>
                        {integration.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-2">
              <Button className="w-full" onClick={() => handleOpenSystemIntegrationModal('create')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setSystemIntegrationListModalOpen(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Manage Connections
              </Button>
              {systemIntegrations.length > 0 && (
                <div className="text-center text-sm text-muted-foreground pt-2">
                  {systemIntegrations.length} integration{systemIntegrations.length !== 1 ? 's' : ''} configured
                </div>
              )}
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
        onClose={() => {
          setFeedListModalOpen(false);
          refreshAllData(); // Refresh all data when closing manage modal
        }}
        onEditFeed={handleEditFeed}
      />

      <APISourceListModal
        isOpen={apiSourceListModalOpen}
        onClose={() => setApiSourceListModalOpen(false)}
        onEditSource={handleEditAPISource}
      />

      <SystemIntegrationModal
        isOpen={systemIntegrationModalOpen}
        onClose={() => {
          setSystemIntegrationModalOpen(false);
          handleModalClose();
        }}
        onSuccess={handleModalSuccess}
        mode={modalMode}
        integration={selectedSystemIntegration}
      />

      <SystemIntegrationListModal
        isOpen={systemIntegrationListModalOpen}
        onClose={() => setSystemIntegrationListModalOpen(false)}
        onEditIntegration={handleEditSystemIntegration}
      />

      <CommunicationTemplateModal
        isOpen={communicationTemplateModalOpen}
        onClose={() => {
          setCommunicationTemplateModalOpen(false);
          handleModalClose();
        }}
        onSuccess={handleModalSuccess}
        mode={modalMode}
        template={selectedCommunicationTemplate}
      />

      <CommunicationTemplateListModal
        isOpen={communicationTemplateListModalOpen}
        onClose={() => setCommunicationTemplateListModalOpen(false)}
        onEditTemplate={handleEditCommunicationTemplate}
      />
    </div>
  );
};

export default InputsManagementTab;
