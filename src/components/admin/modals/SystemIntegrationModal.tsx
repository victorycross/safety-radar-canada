
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useDataManagement, SystemIntegration } from '@/hooks/useDataManagement';

interface SystemIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  integration?: SystemIntegration | null;
  mode: 'create' | 'edit';
}

const SystemIntegrationModal: React.FC<SystemIntegrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  integration,
  mode
}) => {
  const { createSystemIntegration, updateSystemIntegration, loading } = useDataManagement();
  const [formData, setFormData] = useState({
    name: '',
    type: 'travel_platform',
    api_endpoint: '',
    is_active: true,
    authentication_config: {},
    sync_frequency_minutes: 60,
    configuration: {}
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && integration) {
        setFormData({
          name: integration.name,
          type: integration.type,
          api_endpoint: integration.api_endpoint || '',
          is_active: integration.is_active,
          authentication_config: integration.authentication_config || {},
          sync_frequency_minutes: integration.sync_frequency_minutes || 60,
          configuration: integration.configuration || {}
        });
      } else {
        setFormData({
          name: '',
          type: 'travel_platform',
          api_endpoint: '',
          is_active: true,
          authentication_config: {},
          sync_frequency_minutes: 60,
          configuration: {}
        });
      }
    }
  }, [isOpen, mode, integration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'create') {
        await createSystemIntegration(formData);
      } else if (integration) {
        await updateSystemIntegration(integration.id, formData);
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
      handleChange('authentication_config', parsed);
    } catch {
      // Invalid JSON, don't update
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add System Integration' : 'Edit System Integration'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Configure a new system integration for data synchronization.'
              : 'Update the system integration configuration.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Integration Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter integration name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="api_endpoint">API Endpoint</Label>
            <Input
              id="api_endpoint"
              type="url"
              value={formData.api_endpoint}
              onChange={(e) => handleChange('api_endpoint', e.target.value)}
              placeholder="https://api.example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Integration Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select integration type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="travel_platform">Travel Platform</SelectItem>
                <SelectItem value="hr_system">HR System</SelectItem>
                <SelectItem value="database">Database</SelectItem>
                <SelectItem value="api">External API</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sync_frequency">Sync Frequency (minutes)</Label>
            <Input
              id="sync_frequency"
              type="number"
              value={formData.sync_frequency_minutes}
              onChange={(e) => handleChange('sync_frequency_minutes', parseInt(e.target.value))}
              min="1"
              max="1440"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="auth_config">Authentication Configuration</Label>
            <Textarea
              id="auth_config"
              value={JSON.stringify(formData.authentication_config, null, 2)}
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Integration' : 'Update Integration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SystemIntegrationModal;
