
import { AlertLevel } from '@/types';

export interface HubNotificationSettings {
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

export interface NotificationChannel {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}
