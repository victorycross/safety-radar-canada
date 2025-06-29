
import { AlertLevel } from '@/types';

export const getAlertColor = (alertLevel: AlertLevel) => {
  switch (alertLevel) {
    case AlertLevel.SEVERE:
      return 'bg-danger hover:bg-danger/90';
    case AlertLevel.WARNING:
      return 'bg-warning hover:bg-warning/90';
    case AlertLevel.NORMAL:
      return 'bg-success hover:bg-success/90';
    default:
      return 'bg-muted hover:bg-muted/90';
  }
};

export const getAlertBadge = (alertLevel: AlertLevel) => {
  switch (alertLevel) {
    case AlertLevel.SEVERE:
      return 'High Risk';
    case AlertLevel.WARNING:
      return 'Caution';
    case AlertLevel.NORMAL:
      return 'Safe';
    default:
      return 'Unknown';
  }
};
