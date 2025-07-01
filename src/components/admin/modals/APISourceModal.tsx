
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useDataManagement, APISource } from '@/hooks/useDataManagement';

interface APISourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  source?: APISource | null;
  mode: 'create' | 'edit';
}

const APISourceModal: React.FC<APISourceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  source,
  mode
}) => {
  const { createAPISource, updateAPISource, loading } = useDataManagement();
  const [formData, setFormData] = useState({
    name: '',
    endpoint: '',
    type: 'rest',
    is_active: true,
    authentication: {},
    configuration: {}
  });

  // Reset form when modal opens/closes or source changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && source) {
        setFormData({
          name: source.name,
          endpoint: source.endpoint,
          type: source.type,
          is_active: source.is_active,
          authentication: source.authentication || {},
          configuration: source.configuration || {}
        });
      } else {
        setFormData({
          name: '',
          endpoint: '',
          type: 'rest',
          is_active: true,
          authentication: {},
          configuration: {}
        });
      }
    }
  }, [isOpen, mode, source]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'create') {
        await createAPISource(formData);
      } else if (source) {
        await updateAPISource(source.id, formData);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAuthConfigChange = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      handleChange('authentication', parsed);
    } catch {
      // Invalid JSON, don't update
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add API Source' : 'Edit API Source'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Configure the API endpoint for automated data collection.'
              : 'Update the API source configuration.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Source Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter source name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endpoint">API Endpoint</Label>
            <Input
              id="endpoint"
              type="url"
              value={formData.endpoint}
              onChange={(e) => handleChange('endpoint', e.target.value)}
              placeholder="https://api.example.com/alerts"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">API Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select API type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rest">REST API</SelectItem>
                <SelectItem value="graphql">GraphQL</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="soap">SOAP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="auth_config">Authentication Configuration</Label>
            <Textarea
              id="auth_config"
              value={JSON.stringify(formData.authentication, null, 2)}
              onChange={(e) => handleAuthConfigChange(e.target.value)}
              placeholder='{"type": "bearer", "token": "your-token"}'
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create Source' : 'Update Source'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default APISourceModal;
