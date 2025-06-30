
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { InternationalHub } from '@/types/dashboard';
import { HubNotificationSettings } from '@/types/hubNotifications';
import HubNotificationSettingsComponent from '@/components/hub/HubNotificationSettings';

interface HubNotificationTabProps {
  selectedHub: string | null;
  hubs: InternationalHub[];
  onSettingsUpdate: (hubId: string, settings: HubNotificationSettings) => Promise<void>;
}

const HubNotificationTab: React.FC<HubNotificationTabProps> = ({
  selectedHub,
  hubs,
  onSettingsUpdate
}) => {
  if (selectedHub) {
    const hub = hubs.find(h => h.id === selectedHub);
    if (hub) {
      return (
        <HubNotificationSettingsComponent
          hub={hub}
          onSettingsUpdate={onSettingsUpdate}
        />
      );
    }
  }

  return (
    <Card>
      <CardContent className="py-8">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Hub</h3>
          <p className="text-gray-600">Choose a hub from the overview tab to configure its notification settings.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HubNotificationTab;
