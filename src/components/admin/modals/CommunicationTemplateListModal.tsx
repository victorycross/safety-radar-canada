
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Loader2,
  AlertCircle,
  Mail,
  MessageSquare,
  Bell
} from 'lucide-react';
import { useDataManagement, CommunicationTemplate } from '@/hooks/useDataManagement';

interface CommunicationTemplateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditTemplate: (template: CommunicationTemplate) => void;
}

const CommunicationTemplateListModal: React.FC<CommunicationTemplateListModalProps> = ({
  isOpen,
  onClose,
  onEditTemplate
}) => {
  const { fetchCommunicationTemplates, deleteCommunicationTemplate, updateCommunicationTemplate, loading } = useDataManagement();
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const templatesData = await fetchCommunicationTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading communication templates:', error);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this communication template?')) {
      try {
        await deleteCommunicationTemplate(templateId);
        await loadTemplates();
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleToggleActive = async (template: CommunicationTemplate) => {
    try {
      await updateCommunicationTemplate(template.id, { is_active: !template.is_active });
      await loadTemplates();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditTemplate = (template: CommunicationTemplate) => {
    onEditTemplate(template);
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'push':
        return <Bell className="h-4 w-4" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      email: 'default',
      sms: 'secondary',
      push: 'outline'
    } as const;
    
    return <Badge variant={colors[type as keyof typeof colors] || 'default'}>{type.toUpperCase()}</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Communication Templates</DialogTitle>
          <DialogDescription>
            Edit, delete, or configure your message templates for alerts and notifications
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {loadingTemplates ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading communication templates...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>No communication templates found</span>
            </div>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(template.type)}
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {getTypeBadge(template.type)}
                      <Badge variant={template.is_active ? "default" : "secondary"}>
                        {template.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {template.subject && (
                      <div>
                        <p className="text-sm text-muted-foreground">Subject:</p>
                        <p className="text-sm font-medium">{template.subject}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Content Preview:</p>
                      <p className="text-sm line-clamp-3">{template.content}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                          disabled={loading}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(template)}
                          disabled={loading}
                        >
                          {template.is_active ? (
                            <ToggleRight className="h-4 w-4 mr-1" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 mr-1" />
                          )}
                          {template.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommunicationTemplateListModal;
