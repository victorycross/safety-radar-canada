
import { AlertLevel } from '@/types';
import { Province } from '@/types/dashboard';
import { provinceNames } from '@/services/provinceMapping';

// Clean fallback data structure - no dummy employee counts
export const fallbackProvinces: Province[] = Object.entries(provinceNames).map(([code, name]) => ({
  id: `fallback-${code}`,
  name,
  code: code.toUpperCase(),
  alertLevel: AlertLevel.NORMAL,
  employeeCount: 0 // Real data comes from database
}));

// Province emojis for display purposes only
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
