
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HubNotificationSettings } from '@/types/hubNotifications';

interface ContactInformationSectionProps {
  settings: HubNotificationSettings;
  onSettingUpdate: <K extends keyof HubNotificationSettings>(
    key: K,
    value: HubNotificationSettings[K]
  ) => void;
}

const ContactInformationSection: React.FC<ContactInformationSectionProps> = ({
  settings,
  onSettingUpdate
}) => {
  return (
    <div className="space-y-4">
      {settings.emailEnabled && (
        <div className="space-y-2">
          <Label>Email Addresses (comma-separated)</Label>
          <Input
            placeholder="admin@company.com, security@company.com"
            value={settings.emailAddresses}
            onChange={(e) => onSettingUpdate('emailAddresses', e.target.value)}
          />
        </div>
      )}

      {settings.smsEnabled && (
        <div className="space-y-2">
          <Label>Phone Numbers (comma-separated)</Label>
          <Input
            placeholder="+1234567890, +0987654321"
            value={settings.phoneNumbers}
            onChange={(e) => onSettingUpdate('phoneNumbers', e.target.value)}
          />
        </div>
      )}

      {settings.webhookEnabled && (
        <div className="space-y-2">
          <Label>Webhook URL</Label>
          <Input
            placeholder="https://your-webhook-endpoint.com/hub-alerts"
            value={settings.webhookUrl}
            onChange={(e) => onSettingUpdate('webhookUrl', e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default ContactInformationSection;
