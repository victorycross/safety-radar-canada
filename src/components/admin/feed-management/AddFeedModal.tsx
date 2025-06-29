
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TestTube, Settings, Map } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FeedTemplateSelector from './FeedTemplateSelector';
import NormalizationMapper from './NormalizationMapper';
import FeedTester from './FeedTester';

interface AddFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (feedConfig: any) => void;
}

const AddFeedModal: React.FC<AddFeedModalProps> = ({ isOpen, onClose, onSave }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [feedConfig, setFeedConfig] = useState({
    name: '',
    sourceType: '',
    apiEndpoint: '',
    description: '',
    isActive: true,
    pollingInterval: 300,
    configuration: {
      timeout: 30,
      retries: 3,
      headers: {}
    },
    normalization: {
      titleField: 'title',
      descriptionField: 'description',
      severityField: 'severity',
      categoryField: 'category',
      publishedField: 'published',
      areaField: 'area'
    },
    fieldMapping: {}
  });

  const [testResults, setTestResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const handleSave = () => {
    if (!feedConfig.name || !feedConfig.sourceType || !feedConfig.apiEndpoint) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    onSave(feedConfig);
  };

  const handleTemplateSelect = (template: any) => {
    setFeedConfig(prev => ({
      ...prev,
      sourceType: template.sourceType,
      apiEndpoint: template.apiEndpoint || '',
      configuration: { ...prev.configuration, ...template.configuration },
      normalization: { ...prev.normalization, ...template.normalization },
      fieldMapping: template.fieldMapping || {}
    }));
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      // Simulate feed testing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = {
        success: Math.random() > 0.3,
        responseTime: Math.floor(Math.random() * 500) + 100,
        recordsFound: Math.floor(Math.random() * 50),
        sampleData: {
          title: 'Sample Alert Title',
          description: 'Sample alert description from the feed',
          severity: 'Moderate',
          published: new Date().toISOString()
        }
      };
      
      setTestResults(mockResults);
      
      if (mockResults.success) {
        toast({
          title: 'Test Successful',
          description: `Found ${mockResults.recordsFound} records in ${mockResults.responseTime}ms`
        });
      } else {
        toast({
          title: 'Test Failed',
          description: 'Unable to connect to the feed endpoint',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Test Error',
        description: 'Failed to test feed connection',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Data Feed</DialogTitle>
          <DialogDescription>
            Configure a new data source with automatic normalization to the UniversalAlert format
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
            <TabsTrigger value="test">Test & Validate</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Feed Name *</Label>
                <Input
                  id="name"
                  placeholder="Emergency Alerts Feed"
                  value={feedConfig.name}
                  onChange={(e) => setFeedConfig(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="sourceType">Source Type *</Label>
                <Select
                  value={feedConfig.sourceType}
                  onValueChange={(value) => setFeedConfig(prev => ({ ...prev, sourceType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency Alerts</SelectItem>
                    <SelectItem value="weather">Weather Alerts</SelectItem>
                    <SelectItem value="security-rss">Security RSS</SelectItem>
                    <SelectItem value="custom-api">Custom API</SelectItem>
                    <SelectItem value="rss">RSS Feed</SelectItem>
                    <SelectItem value="geojson">GeoJSON API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="apiEndpoint">API Endpoint *</Label>
              <Input
                id="apiEndpoint"
                placeholder="https://api.example.com/alerts"
                value={feedConfig.apiEndpoint}
                onChange={(e) => setFeedConfig(prev => ({ ...prev, apiEndpoint: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this data feed"
                value={feedConfig.description}
                onChange={(e) => setFeedConfig(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={feedConfig.isActive}
                onCheckedChange={(checked) => setFeedConfig(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Enable this feed immediately</Label>
            </div>

            <div>
              <Label htmlFor="pollingInterval">Polling Interval (seconds)</Label>
              <Select
                value={feedConfig.pollingInterval.toString()}
                onValueChange={(value) => setFeedConfig(prev => ({ ...prev, pollingInterval: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                  <SelectItem value="600">10 minutes</SelectItem>
                  <SelectItem value="1800">30 minutes</SelectItem>
                  <SelectItem value="3600">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="template">
            <FeedTemplateSelector 
              selectedType={feedConfig.sourceType}
              onTemplateSelect={handleTemplateSelect}
            />
          </TabsContent>

          <TabsContent value="mapping">
            <NormalizationMapper
              sourceType={feedConfig.sourceType}
              normalization={feedConfig.normalization}
              fieldMapping={feedConfig.fieldMapping}
              onChange={(normalization, fieldMapping) => 
                setFeedConfig(prev => ({ ...prev, normalization, fieldMapping }))
              }
            />
          </TabsContent>

          <TabsContent value="test">
            <FeedTester
              feedConfig={feedConfig}
              testResults={testResults}
              testing={testing}
              onTest={handleTest}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleTest} 
            disabled={testing || !feedConfig.apiEndpoint}
            variant="outline"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button onClick={handleSave}>
            Save Feed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFeedModal;
