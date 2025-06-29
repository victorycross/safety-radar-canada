
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Database, Globe, Rss, Shield, TrendingUp, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (sourceData: any) => void;
}

const SOURCE_TYPES = [
  {
    id: 'api',
    name: 'API Endpoint',
    description: 'REST API or webhook endpoint',
    icon: Globe,
    defaultConfig: {
      method: 'GET',
      pollInterval: 300,
      timeout: 30
    }
  },
  {
    id: 'database',
    name: 'Database',
    description: 'SQL database connection',
    icon: Database,
    defaultConfig: {
      pollInterval: 600,
      timeout: 60
    }
  },
  {
    id: 'rss',
    name: 'RSS/Atom Feed',
    description: 'RSS or Atom feed source',
    icon: Rss,
    defaultConfig: {
      pollInterval: 1800,
      timeout: 30
    }
  },
  {
    id: 'security',
    name: 'Security Feed',
    description: 'Security alerts and threats',
    icon: Shield,
    defaultConfig: {
      pollInterval: 300,
      timeout: 30
    }
  },
  {
    id: 'monitoring',
    name: 'Monitoring System',
    description: 'System monitoring and metrics',
    icon: TrendingUp,
    defaultConfig: {
      pollInterval: 60,
      timeout: 15
    }
  },
  {
    id: 'webhook',
    name: 'Webhook',
    description: 'Incoming webhook receiver',
    icon: Zap,
    defaultConfig: {
      pollInterval: 0,
      timeout: 30
    }
  }
];

const AddSourceModal: React.FC<AddSourceModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endpoint: '',
    type: ''
  });

  const handleTypeSelect = (typeId: string) => {
    const sourceType = SOURCE_TYPES.find(t => t.id === typeId);
    if (sourceType) {
      setSelectedType(typeId);
      setFormData(prev => ({
        ...prev,
        type: sourceType.name
      }));
    }
  };

  const handleAdd = () => {
    if (!formData.name || !formData.endpoint || !selectedType) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const sourceType = SOURCE_TYPES.find(t => t.id === selectedType);
    const newSource = {
      ...formData,
      id: `src_${Date.now()}`,
      type: sourceType?.name || 'Unknown',
      verificationStatus: 'unverified',
      healthStatus: 'unknown',
      uptime: 0,
      reliabilityScore: 0,
      responseTime: 0,
      errorRate: 0,
      dataVolume: 0,
      lastUpdate: 'Never',
      route: formData.endpoint,
      config: sourceType?.defaultConfig || {}
    };

    onAdd(newSource);
    
    toast({
      title: 'Source Added',
      description: `${formData.name} has been added successfully`
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      endpoint: '',
      type: ''
    });
    setSelectedType('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Data Source</DialogTitle>
          <DialogDescription>
            Choose a source type and configure the connection details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Source Type Selection */}
          <div>
            <Label className="text-base font-medium">Source Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              {SOURCE_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <Card
                    key={type.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedType === type.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleTypeSelect(type.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {type.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs">
                        {type.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Source Details Form */}
          {selectedType && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Source Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Weather Alerts API"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endpoint">Endpoint URL *</Label>
                  <Input
                    id="endpoint"
                    placeholder="https://api.example.com/feed"
                    value={formData.endpoint}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      endpoint: e.target.value
                    }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of what this source provides..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!selectedType || !formData.name || !formData.endpoint}>
            Add Source
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSourceModal;
