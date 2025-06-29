
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Settings, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SourceConfigForm from "./SourceConfigForm";
import SourceTestResults from "./SourceTestResults";
import { EnhancedSource } from "./EnhancedSourceCard";

interface SourceConfigurationModalProps {
  source: EnhancedSource | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (sourceId: string, config: any) => void;
}

const SourceConfigurationModal: React.FC<SourceConfigurationModalProps> = ({
  source,
  isOpen,
  onClose,
  onSave
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("config");
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    if (source) {
      // Initialize config with source data
      setConfig({
        apiEndpoint: source.route || '',
        pollInterval: 300,
        timeout: 30,
        retries: 3,
        authentication: {
          type: 'none',
          apiKey: '',
          username: '',
          password: ''
        },
        headers: {},
        enabled: true
      });
    }
  }, [source]);

  const handleTest = async () => {
    if (!source) return;
    
    setIsTesting(true);
    setActiveTab("test");
    
    try {
      // Simulate testing process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResults = {
        connectionStatus: Math.random() > 0.3 ? 'success' : 'error',
        responseTime: Math.floor(Math.random() * 500) + 100,
        dataReceived: Math.random() > 0.2,
        lastError: Math.random() > 0.7 ? 'Connection timeout' : null,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(mockResults);
      
      toast({
        title: mockResults.connectionStatus === 'success' ? 'Test Successful' : 'Test Failed',
        description: `Connection test completed for ${source.name}`,
        variant: mockResults.connectionStatus === 'success' ? 'default' : 'destructive'
      });
    } catch (error) {
      toast({
        title: 'Test Error',
        description: 'Failed to run connection test',
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (!source) return;
    
    onSave(source.id, config);
    toast({
      title: 'Configuration Saved',
      description: `Settings updated for ${source.name}`
    });
    onClose();
  };

  if (!source) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure {source.name}
            <Badge variant="outline">{source.type}</Badge>
          </DialogTitle>
          <DialogDescription>
            Manage connection settings, authentication, and monitoring parameters
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="test" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Testing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <SourceConfigForm 
              config={config}
              setConfig={setConfig}
              sourceType={source.type}
            />
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Connection Testing</h3>
              <Button 
                onClick={handleTest} 
                disabled={isTesting}
                variant="outline"
              >
                {isTesting ? 'Testing...' : 'Run Test'}
              </Button>
            </div>
            
            <SourceTestResults 
              results={testResults}
              isLoading={isTesting}
              source={source}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SourceConfigurationModal;
