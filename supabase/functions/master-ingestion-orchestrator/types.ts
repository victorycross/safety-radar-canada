
export interface AlertSource {
  id: string;
  name: string;
  source_type: string;
  api_endpoint: string;
  is_active: boolean;
  polling_interval: number;
  last_poll_at: string | null;
  health_status: string;
  configuration: any;
}

export interface HealthMetric {
  source_id: string;
  response_time_ms: number;
  success: boolean;
  error_message?: string;
  records_processed: number;
  http_status_code?: number;
}

export interface ProcessingResult {
  source_name: string;
  success: boolean;
  records_processed: number;
  response_time_ms: number;
}
