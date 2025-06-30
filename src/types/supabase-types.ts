
// Types for raw Supabase data (snake_case)
export interface SupabaseProvince {
  id: string;
  name: string;
  code: string;
  alert_level: 'normal' | 'warning' | 'severe';
  employee_count: number;
  created_at?: string;
  updated_at?: string;
}
