
import { AlertLevel } from '@/types';

export const fallbackProvinces = [
  { id: 'ab', name: 'Alberta', code: 'AB', alertLevel: AlertLevel.NORMAL, employeeCount: 0 },
  { id: 'bc', name: 'British Columbia', code: 'BC', alertLevel: AlertLevel.NORMAL, employeeCount: 0 },
  { id: 'mb', name: 'Manitoba', code: 'MB', alertLevel: AlertLevel.NORMAL, employeeCount: 0 },
  { id: 'nb', name: 'New Brunswick', code: 'NB', alertLevel: AlertLevel.NORMAL, employeeCount: 0 },
  { id: 'nl', name: 'Newfoundland and Labrador', code: 'NL', alertLevel: AlertLevel.NORMAL, employeeCount: 0 },
  { id: 'ns', name: 'Nova Scotia', code: 'NS', alertLevel: AlertLevel.NORMAL, employeeCount: 0 },
  { id: 'on', name: 'Ontario', code: 'ON', alertLevel: AlertLevel.NORMAL, employeeCount: 0 },
  { id: 'pe', name: 'Prince Edward Island', code: 'PE', alertLevel: AlertLevel.NORMAL, employeeCount: 0 },
  { id: 'qc', name: 'Quebec', code: 'QC', alertLevel: AlertLevel.NORMAL, employeeCount: 0 },
  { id: 'sk', name: 'Saskatchewan', code: 'SK', alertLevel: AlertLevel.NORMAL, employeeCount: 0 },
  { id: 'nt', name: 'Northwest Territories', code: 'NT', alertLevel: AlertLevel.NORMAL, employeeCount: 0 },
  { id: 'nu', name: 'Nunavut', code: 'NU', alertLevel: AlertLevel.NORMAL, employeeCount: 0 },
  { id: 'yt', name: 'Yukon', code: 'YT', alertLevel: AlertLevel.NORMAL, employeeCount: 0 }
];

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
