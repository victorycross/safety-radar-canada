
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { InternationalHub } from '@/types/dashboard';
import { AlertLevel } from '@/types';
import { Bell, Mail, MessageSquare, Phone, Save } from 'lucide-react';

interface HubNotificationSettingsProps {
  hub: InternationalHub;
  onSettingsUpdate: (hubId: string, settings: HubNotificationSettings) => void;
}

interface HubNotificationSettings {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  webhookEnabled: boolean;
  alertLevelThreshold: AlertLevel;
  emailAddresses: string;
  phoneNumbers: string;
  webhookUrl: string;
  notificationFrequency: 'immediate' | 'hourly' | 'daily';
}

const HubNotificationSettings: React.FC<HubNotificationSettingsProps> = ({
  hub,
  onSettingsUpdate
}) => {
  const [settings, setSettings] = useState<HubNotificationSettings>({
    emailEnabled: true,
    smsEnabled: false,
    pushEnabled: true,
    webhookEnabled: false,
    alertLevelThreshold: AlertLevel.WARNING,
    emailAddresses: '',
    phoneNumbers: '',
    webhookUrl: '',
    notificationFrequency: 'immediate'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await onSettingsUpdate(hub.id, settings);
      toast({
        title: 'Settings Saved',
        description: `Notification settings updated for ${hub.name}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notification settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = <K extends keyof HubNotificationSettings>(
    key: K,
    value: HubNotificationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Notification Settings - {hub.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Channels */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Channels</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>Email Notifications</span>
              </div>
              <Switch
                checked={settings.emailEnabled}
                onCheckedChange={(checked) => updateSetting('emailEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>SMS Notifications</span>
              </div>
              <Switch
                checked={settings.smsEnabled}
                onCheckedChange={(checked) => updateSetting('smsEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Push Notifications</span>
              </div>
              <Switch
                checked={settings.pushEnabled}
                onCheckedChange={(checked) => updateSetting('pushEnabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Webhook Integration</span>
              </div>
              <Switch
                checked={settings.webhookEnabled}
                onCheckedChange={(checked) => updateSetting('webhookEnabled', checked)}
              />
            </div>
          </div>
        </div>

        {/* Alert Threshold */}
        <div className="space-y-2">
          <Label>Alert Level Threshold</Label>
          <Select
            value={settings.alertLevelThreshold}
            onValueChange={(value) => updateSetting('alertLevelThreshold', value as AlertLevel)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AlertLevel.NORMAL}>Normal and above</SelectItem>
              <SelectItem value={AlertLevel.WARNING}>Warning and above</SelectItem>
              <SelectItem value={AlertLevel.SEVERE}>Severe only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notification Frequency */}
        <div className="space-y-2">
          <Label>Notification Frequency</Label>
          <Select
            value={settings.notificationFrequency}
            onValueChange={(value) => updateSetting('notificationFrequency', value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Immediate</SelectItem>
              <SelectItem value="hourly">Hourly Digest</SelectItem>
              <SelectItem value="daily">Daily Summary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contact Information */}
        {settings.emailEnabled && (
          <div className="space-y-2">
            <Label>Email Addresses (comma-separated)</Label>
            <Input
              placeholder="admin@company.com, security@company.com"
              value={settings.emailAddresses}
              onChange={(e) => updateSetting('emailAddresses', e.target.value)}
            />
          </div>
        )}

        {settings.smsEnabled && (
          <div className="space-y-2">
            <Label>Phone Numbers (comma-separated)</Label>
            <Input
              placeholder="+1234567890, +0987654321"
              value={settings.phoneNumbers}
              onChange={(e) => updateSetting('phoneNumbers', e.target.value)}
            />
          </div>
        )}

        {settings.webhookEnabled && (
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input
              placeholder="https://your-webhook-endpoint.com/hub-alerts"
              value={settings.webhookUrl}
              onChange={(e) => updateSetting('webhookUrl', e.target.value)}
            />
          </div>
        )}

        {/* Current Hub Status */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Current Hub Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Alert Level:</span>
              <p className="font-medium">{hub.alertLevel}</p>
            </div>
            <div>
              <span className="text-gray-600">Employees:</span>
              <p className="font-medium">{hub.employeeCount}</p>
            </div>
            <div>
              <span className="text-gray-600">Incidents:</span>
              <p className="font-medium">{hub.localIncidents}</p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p className="font-medium">{hub.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button onClick={handleSaveSettings} disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default HubNotificationSettings;
