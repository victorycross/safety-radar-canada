
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { InternationalHub } from '@/types/dashboard';
import { Bell, Save } from 'lucide-react';
import { useHubNotificationSettings } from '@/hooks/useHubNotificationSettings';
import NotificationChannelsSection from './notification-settings/NotificationChannelsSection';
import NotificationPreferencesSection from './notification-settings/NotificationPreferencesSection';
import ContactInformationSection from './notification-settings/ContactInformationSection';
import HubStatusSection from './notification-settings/HubStatusSection';
import { HubNotificationSettings as HubNotificationSettingsType } from '@/types/hubNotifications';

interface HubNotificationSettingsProps {
  hub: InternationalHub;
  onSettingsUpdate: (hubId: string, settings: HubNotificationSettingsType) => void;
}

const HubNotificationSettings: React.FC<HubNotificationSettingsProps> = ({
  hub,
  onSettingsUpdate
}) => {
  const { settings, loading, updateSetting, saveSettings } = useHubNotificationSettings();

  const handleSaveSettings = async () => {
    await saveSettings(hub.id, hub.name, onSettingsUpdate);
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
        <NotificationChannelsSection
          settings={settings}
          onSettingUpdate={updateSetting}
        />

        <NotificationPreferencesSection
          settings={settings}
          onSettingUpdate={updateSetting}
        />

        <ContactInformationSection
          settings={settings}
          onSettingUpdate={updateSetting}
        />

        <HubStatusSection hub={hub} />

        <Button onClick={handleSaveSettings} disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default HubNotificationSettings;
