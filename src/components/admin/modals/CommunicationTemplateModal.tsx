
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useDataManagement, CommunicationTemplate } from '@/hooks/useDataManagement';

interface CommunicationTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  template?: CommunicationTemplate | null;
  mode: 'create' | 'edit';
}

const CommunicationTemplateModal: React.FC<CommunicationTemplateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  template,
  mode
}) => {
  const { createCommunicationTemplate, updateCommunicationTemplate, loading } = useDataManagement();
  const [formData, setFormData] = useState({
    name: '',
    type: 'email' as 'email' | 'sms' | 'push',
    subject: '',
    content: '',
    is_active: true
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && template) {
        setFormData({
          name: template.name,
          type: template.type,
          subject: template.subject || '',
          content: template.content,
          is_active: template.is_active
        });
      } else {
        setFormData({
          name: '',
          type: 'email',
          subject: '',
          content: '',
          is_active: true
        });
      }
    }
  }, [isOpen, mode, template]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'create') {
        await createCommunicationTemplate(formData);
      } else if (template) {
        await updateCommunicationTemplate(template.id, formData);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Communication Template' : 'Edit Communication Template'}
          </DialogTitle>
          <DialogDescription>
            Configure message templates for alerts and notifications.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter template name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Template Type</Label>
            <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push Notification</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {formData.type === 'email' && (
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="Enter email subject"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="content">Template Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Enter template content..."
              rows={6}
              required
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Template' : 'Update Template'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CommunicationTemplateModal;
