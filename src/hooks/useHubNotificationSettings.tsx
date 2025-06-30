
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertLevel } from '@/types';
import { HubNotificationSettings } from '@/types/hubNotifications';

export const useHubNotificationSettings = () => {
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

  const updateSetting = <K extends keyof HubNotificationSettings>(
    key: K,
    value: HubNotificationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async (
    hubId: string, 
    hubName: string,
    onSettingsUpdate: (hubId: string, settings: HubNotificationSettings) => void
  ) => {
    setLoading(true);
    try {
      await onSettingsUpdate(hubId, settings);
      toast({
        title: 'Settings Saved',
        description: `Notification settings updated for ${hubName}`,
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

  return {
    settings,
    loading,
    updateSetting,
    saveSettings
  };
};
