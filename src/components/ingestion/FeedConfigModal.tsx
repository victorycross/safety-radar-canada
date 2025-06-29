
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Key, 
  AlertTriangle 
} from 'lucide-react';
import { getFeedDetails } from './FeedDetailsProvider';
import FeedConfigForm from './FeedConfigForm';

interface FeedConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedId: string;
  feedName: string;
}

const FeedConfigModal: React.FC<FeedConfigModalProps> = ({ 
  isOpen, 
  onClose, 
  feedId, 
  feedName 
}) => {
  const [config, setConfig] = useState({
    apiKey: '',
    endpoint: '',
    pollInterval: '300',
    enabled: true,
    timeout: '30',
    retries: '3'
  });

  const details = getFeedDetails(feedId);

  React.useEffect(() => {
    setConfig(prev => ({
      ...prev,
      endpoint: details.endpointDefault,
      pollInterval: details.pollIntervalDefault
    }));
  }, [feedId]);

  const handleSave = () => {
    console.log('Saving configuration for', feedId, config);
    // Here you would typically save to a backend or local storage
    // For now, just close the modal
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Configure {feedName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {details.description}
            </AlertDescription>
          </Alert>

          <FeedConfigForm 
            config={config}
            setConfig={setConfig}
            feedId={feedId}
            details={details}
          />

          <div className="text-xs text-muted-foreground">
            {details.helpText}
          </div>

          <div className="flex items-center justify-between pt-4">
            <Badge variant={config.enabled ? "default" : "secondary"}>
              {config.enabled ? "Enabled" : "Disabled"}
            </Badge>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Config
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedConfigModal;
