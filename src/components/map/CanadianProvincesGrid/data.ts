
import { AlertLevel } from '@/types';
import { Province } from '@/types/dashboard';
import { provinceNames } from '@/services/provinceMapping';

// Note: This fallback data is now only used as a last resort
// The actual province data should come from the database via syncProvinceData()
export const fallbackProvinces: Province[] = Object.entries(provinceNames).map(([code, name]) => ({
  id: `fallback-${code}`, // Fallback ID pattern
  name,
  code: code.toUpperCase(),
  alertLevel: AlertLevel.NORMAL,
  employeeCount: 0
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
