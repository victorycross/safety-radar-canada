
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, X } from 'lucide-react';

interface SecurityRisk {
  id: string;
  threat_category: string;
  likelihood: number;
  impact: number;
  preparedness_gap: number;
  rpn: number;
  priority: 'high' | 'medium' | 'low';
  last_reviewed: string;
  assigned_lead: string;
  current_alerts: string;
  notes: string;
  playbook: string;
  live_feeds: Array<{
    name: string;
    url: string;
    description: string;
  }>;
}

interface RiskEditModalProps {
  risk: SecurityRisk;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

const RiskEditModal = ({ risk, open, onOpenChange, onSave }: RiskEditModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    threat_category: risk.threat_category,
    likelihood: risk.likelihood,
    impact: risk.impact,
    preparedness_gap: risk.preparedness_gap,
    assigned_lead: risk.assigned_lead || '',
    current_alerts: risk.current_alerts || '',
    notes: risk.notes || '',
    playbook: risk.playbook || '',
    last_reviewed: risk.last_reviewed || new Date().toISOString().split('T')[0]
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('national_security_risks')
        .update({
          threat_category: formData.threat_category,
          likelihood: formData.likelihood,
          impact: formData.impact,
          preparedness_gap: formData.preparedness_gap,
          assigned_lead: formData.assigned_lead,
          current_alerts: formData.current_alerts,
          notes: formData.notes,
          playbook: formData.playbook,
          last_reviewed: formData.last_reviewed
        })
        .eq('id', risk.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Security risk updated successfully',
      });
      
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating risk:', error);
      toast({
        title: 'Error',
        description: 'Failed to update security risk',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Security Risk</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="threat_category">Threat Category</Label>
                <Input
                  id="threat_category"
                  value={formData.threat_category}
                  onChange={(e) => setFormData(prev => ({ ...prev, threat_category: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="likelihood">Likelihood (1-5)</Label>
                  <Select
                    value={formData.likelihood.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, likelihood: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="impact">Impact (1-5)</Label>
                  <Select
                    value={formData.impact.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, impact: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="preparedness_gap">Preparedness Gap (1-5)</Label>
                  <Select
                    value={formData.preparedness_gap.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, preparedness_gap: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assigned_lead">Assigned Lead</Label>
                  <Input
                    id="assigned_lead"
                    value={formData.assigned_lead}
                    onChange={(e) => setFormData(prev => ({ ...prev, assigned_lead: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="last_reviewed">Last Reviewed</Label>
                  <Input
                    id="last_reviewed"
                    type="date"
                    value={formData.last_reviewed}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_reviewed: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Current Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.current_alerts}
                onChange={(e) => setFormData(prev => ({ ...prev, current_alerts: e.target.value }))}
                placeholder="Describe current alerts and ongoing situations..."
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes and observations..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Playbook */}
          <Card>
            <CardHeader>
              <CardTitle>Response Playbook</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.playbook}
                onChange={(e) => setFormData(prev => ({ ...prev, playbook: e.target.value }))}
                placeholder="Detailed response procedures and protocols (Markdown supported)..."
                rows={8}
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RiskEditModal;
