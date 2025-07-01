
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
  AlertCircle
} from 'lucide-react';
import { useDataManagement, APISource } from '@/hooks/useDataManagement';

interface APISourceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditSource: (source: APISource) => void;
}

const APISourceListModal: React.FC<APISourceListModalProps> = ({
  isOpen,
  onClose,
  onEditSource
}) => {
  const { fetchAPISources, deleteAPISource, updateAPISource, loading } = useDataManagement();
  const [sources, setSources] = useState<APISource[]>([]);
  const [loadingSources, setLoadingSources] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSources();
    }
  }, [isOpen]);

  const loadSources = async () => {
    setLoadingSources(true);
    try {
      const sourcesData = await fetchAPISources();
      setSources(sourcesData);
    } catch (error) {
      console.error('Error loading API sources:', error);
    } finally {
      setLoadingSources(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (window.confirm('Are you sure you want to delete this API source?')) {
      try {
        await deleteAPISource(sourceId);
        await loadSources(); // Refresh the list
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleToggleActive = async (source: APISource) => {
    try {
      await updateAPISource(source.id, { is_active: !source.is_active });
      await loadSources(); // Refresh the list
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleEditSource = (source: APISource) => {
    onEditSource(source);
    onClose();
  };

  const getStatusBadge = (source: APISource) => {
    if (!source.is_active) return <Badge variant="secondary">Inactive</Badge>;
    // You could add more sophisticated status checking here
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage API Sources</DialogTitle>
          <DialogDescription>
            Edit, delete, or configure the status of your API data sources
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {loadingSources ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2">Loading API sources...</span>
            </div>
          ) : sources.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>No API sources found</span>
            </div>
          ) : (
            sources.map((source) => (
              <Card key={source.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(source)}
                      <Badge variant="outline">{source.type}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Endpoint:</p>
                      <p className="text-sm font-mono break-all">{source.endpoint}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditSource(source)}
                          disabled={loading}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(source)}
                          disabled={loading}
                        >
                          {source.is_active ? (
                            <ToggleRight className="h-4 w-4 mr-1" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 mr-1" />
                          )}
                          {source.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSource(source.id)}
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

export default APISourceListModal;
