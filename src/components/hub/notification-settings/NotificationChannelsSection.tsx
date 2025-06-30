
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Mail, MessageSquare, Bell, Phone } from 'lucide-react';
import { HubNotificationSettings } from '@/types/hubNotifications';

interface NotificationChannelsSectionProps {
  settings: HubNotificationSettings;
  onSettingUpdate: <K extends keyof HubNotificationSettings>(
    key: K,
    value: HubNotificationSettings[K]
  ) => void;
}

const NotificationChannelsSection: React.FC<NotificationChannelsSectionProps> = ({
  settings,
  onSettingUpdate
}) => {
  const channels = [
    {
      id: 'email',
      name: 'Email Notifications',
      icon: Mail,
      enabled: settings.emailEnabled,
      onToggle: (checked: boolean) => onSettingUpdate('emailEnabled', checked)
    },
    {
      id: 'sms',
      name: 'SMS Notifications',
      icon: MessageSquare,
      enabled: settings.smsEnabled,
      onToggle: (checked: boolean) => onSettingUpdate('smsEnabled', checked)
    },
    {
      id: 'push',
      name: 'Push Notifications',
      icon: Bell,
      enabled: settings.pushEnabled,
      onToggle: (checked: boolean) => onSettingUpdate('pushEnabled', checked)
    },
    {
      id: 'webhook',
      name: 'Webhook Integration',
      icon: Phone,
      enabled: settings.webhookEnabled,
      onToggle: (checked: boolean) => onSettingUpdate('webhookEnabled', checked)
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Notification Channels</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {channels.map((channel) => {
          const IconComponent = channel.icon;
          return (
            <div key={channel.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-2">
                <IconComponent className="h-4 w-4" />
                <span>{channel.name}</span>
              </div>
              <Switch
                checked={channel.enabled}
                onCheckedChange={channel.onToggle}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationChannelsSection;
