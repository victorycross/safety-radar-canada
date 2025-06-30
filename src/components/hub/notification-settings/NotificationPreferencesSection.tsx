
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertLevel } from '@/types';
import { HubNotificationSettings } from '@/types/hubNotifications';

interface NotificationPreferencesSectionProps {
  settings: HubNotificationSettings;
  onSettingUpdate: <K extends keyof HubNotificationSettings>(
    key: K,
    value: HubNotificationSettings[K]
  ) => void;
}

const NotificationPreferencesSection: React.FC<NotificationPreferencesSectionProps> = ({
  settings,
  onSettingUpdate
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Alert Level Threshold</Label>
        <Select
          value={settings.alertLevelThreshold}
          onValueChange={(value) => onSettingUpdate('alertLevelThreshold', value as AlertLevel)}
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

      <div className="space-y-2">
        <Label>Notification Frequency</Label>
        <Select
          value={settings.notificationFrequency}
          onValueChange={(value) => onSettingUpdate('notificationFrequency', value as any)}
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
    </div>
  );
};

export default NotificationPreferencesSection;
