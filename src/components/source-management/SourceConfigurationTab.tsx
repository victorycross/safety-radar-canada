
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Clock,
  Globe,
  Database
} from 'lucide-react';
import { UnifiedSource } from '@/hooks/useSourceState';

interface SourceConfigurationTabProps {
  sources: UnifiedSource[];
  updateSource: (id: string, updates: Partial<UnifiedSource>) => Promise<void>;
  loading: boolean;
}

const SourceConfigurationTab: React.FC<SourceConfigurationTabProps> = ({ 
  sources, 
  updateSource, 
  loading 
}) => {
  const [editingSource, setEditingSource] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<UnifiedSource>>({});

  const handleEdit = (source: UnifiedSource) => {
    setEditingSource(source.id);
    setFormData(source);
  };

  const handleSave = async () => {
    if (editingSource) {
      await updateSource(editingSource, formData);
      setEditingSource(null);
      setFormData({});
    }
  };

  const handleCancel = () => {
    setEditingSource(null);
    setFormData({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">Source Configuration</h3>
        <p className="text-muted-foreground">
          Manage settings and parameters for your data sources
        </p>
      </div>

      <div className="grid gap-4">
        {sources.map((source) => {
          const isEditing = editingSource === source.id;
          
          return (
            <Card key={source.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      {source.name}
                    </CardTitle>
                    <CardDescription>{source.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={source.is_active ? 'default' : 'secondary'}>
                      {source.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {source.source_type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {!isEditing ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">API Endpoint</Label>
                        <p className="font-mono break-all">{source.api_endpoint}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Polling Interval</Label>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{source.polling_interval}s</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(source)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Source Name</Label>
                        <Input
                          id="name"
                          value={formData.name || ''}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="endpoint">API Endpoint</Label>
                        <Input
                          id="endpoint"
                          value={formData.api_endpoint || ''}
                          onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="interval">Polling Interval (seconds)</Label>
                        <Select 
                          value={formData.polling_interval?.toString() || '300'} 
                          onValueChange={(value) => setFormData({ ...formData, polling_interval: parseInt(value) })}
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

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={formData.is_active || false}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                        <Label htmlFor="active">Active</Label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {sources.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No sources configured yet. Add your first source to get started.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SourceConfigurationTab;
