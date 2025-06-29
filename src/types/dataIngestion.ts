
export interface AlertSource {
  id: string;
  name: string;
  description: string;
  source_type: string;
  api_endpoint: string;
  is_active: boolean;
  polling_interval: number;
  last_poll_at: string | null;
  health_status: 'healthy' | 'degraded' | 'error' | 'unknown';
  configuration: any;
  created_at: string;
  updated_at: string;
}

export interface SourceHealthMetric {
  id: string;
  source_id: string;
  timestamp: string;
  response_time_ms: number;
  success: boolean;
  error_message: string | null;
  records_processed: number;
  http_status_code: number | null;
}

export interface QueueItem {
  id: string;
  source_id: string;
  raw_payload: any;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  processing_attempts: number;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface QueueStatus {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  total: number;
}
