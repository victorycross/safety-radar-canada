
import { AlertLevel } from '@/types';

export const useHubManagementUtils = () => {
  const getAlertLevelColor = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.SEVERE:
        return 'bg-red-500';
      case AlertLevel.WARNING:
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const getAlertLevelText = (level: AlertLevel) => {
    switch (level) {
      case AlertLevel.SEVERE:
        return 'High Risk';
      case AlertLevel.WARNING:
        return 'Caution';
      default:
        return 'Safe';
    }
  };

  return {
    getAlertLevelColor,
    getAlertLevelText
  };
};
