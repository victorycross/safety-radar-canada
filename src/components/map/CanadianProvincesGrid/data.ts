
import { AlertLevel } from '@/types';
import { Province } from '@/types/dashboard';
import { provinceCodeToIdMap, provinceNames } from '@/services/provinceMapping';

// Create fallback provinces with proper UUID structure
export const fallbackProvinces: Province[] = Object.entries(provinceNames).map(([code, name]) => ({
  id: provinceCodeToIdMap[code],
  name,
  code: code.toUpperCase(),
  alertLevel: AlertLevel.NORMAL,
  employeeCount: 0 // Removed hardcoded employee counts
}));

export const provinceEmojis = {
  bc: '🏔️',
  ab: '🛢️',
  sk: '🌾',
  mb: '🦬',
  on: '🏙️',
  qc: '⚜️',
  nb: '🦞',
  ns: '⚓',
  pe: '🥔',
  nl: '🐟',
  yt: '❄️',
  nt: '💎',
  nu: '🐻‍❄️'
};
