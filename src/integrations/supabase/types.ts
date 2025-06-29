export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      alert_correlations: {
        Row: {
          confidence_score: number
          correlation_type: string
          created_at: string
          id: string
          primary_incident_id: string | null
          related_incident_id: string | null
        }
        Insert: {
          confidence_score?: number
          correlation_type: string
          created_at?: string
          id?: string
          primary_incident_id?: string | null
          related_incident_id?: string | null
        }
        Update: {
          confidence_score?: number
          correlation_type?: string
          created_at?: string
          id?: string
          primary_incident_id?: string | null
          related_incident_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_correlations_primary_incident_id_fkey"
            columns: ["primary_incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alert_correlations_related_incident_id_fkey"
            columns: ["related_incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_ingestion_queue: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          processed_at: string | null
          processing_attempts: number
          processing_status: string
          raw_payload: Json
          source_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          processed_at?: string | null
          processing_attempts?: number
          processing_status?: string
          raw_payload: Json
          source_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          processed_at?: string | null
          processing_attempts?: number
          processing_status?: string
          raw_payload?: Json
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_ingestion_queue_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "alert_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_sources: {
        Row: {
          api_endpoint: string
          configuration: Json | null
          created_at: string
          description: string | null
          health_status: string
          id: string
          is_active: boolean
          last_poll_at: string | null
          name: string
          polling_interval: number
          source_type: string
          updated_at: string
        }
        Insert: {
          api_endpoint: string
          configuration?: Json | null
          created_at?: string
          description?: string | null
          health_status?: string
          id?: string
          is_active?: boolean
          last_poll_at?: string | null
          name: string
          polling_interval?: number
          source_type: string
          updated_at?: string
        }
        Update: {
          api_endpoint?: string
          configuration?: Json | null
          created_at?: string
          description?: string | null
          health_status?: string
          id?: string
          is_active?: boolean
          last_poll_at?: string | null
          name?: string
          polling_interval?: number
          source_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_sync_status: {
        Row: {
          last_sync_time: string | null
          message: string | null
          source: string
          status: string | null
        }
        Insert: {
          last_sync_time?: string | null
          message?: string | null
          source: string
          status?: string | null
        }
        Update: {
          last_sync_time?: string | null
          message?: string | null
          source?: string
          status?: string | null
        }
        Relationships: []
      }
      geospatial_data: {
        Row: {
          administrative_area: string | null
          affected_radius_km: number | null
          country_code: string | null
          created_at: string
          geohash: string | null
          id: string
          incident_id: string | null
          latitude: number | null
          longitude: number | null
          population_impact: number | null
          updated_at: string
        }
        Insert: {
          administrative_area?: string | null
          affected_radius_km?: number | null
          country_code?: string | null
          created_at?: string
          geohash?: string | null
          id?: string
          incident_id?: string | null
          latitude?: number | null
          longitude?: number | null
          population_impact?: number | null
          updated_at?: string
        }
        Update: {
          administrative_area?: string | null
          affected_radius_km?: number | null
          country_code?: string | null
          created_at?: string
          geohash?: string | null
          id?: string
          incident_id?: string | null
          latitude?: number | null
          longitude?: number | null
          population_impact?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geospatial_data_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          alert_level: string
          confidence_score: number | null
          correlation_id: string | null
          created_at: string
          data_source_id: string | null
          description: string
          geographic_scope: string | null
          id: string
          province_id: string
          raw_payload: Json | null
          recommended_action: string | null
          severity_numeric: number | null
          source: string
          timestamp: string
          title: string
          updated_at: string
          verification_status: string
        }
        Insert: {
          alert_level?: string
          confidence_score?: number | null
          correlation_id?: string | null
          created_at?: string
          data_source_id?: string | null
          description: string
          geographic_scope?: string | null
          id?: string
          province_id: string
          raw_payload?: Json | null
          recommended_action?: string | null
          severity_numeric?: number | null
          source: string
          timestamp?: string
          title: string
          updated_at?: string
          verification_status?: string
        }
        Update: {
          alert_level?: string
          confidence_score?: number | null
          correlation_id?: string | null
          created_at?: string
          data_source_id?: string | null
          description?: string
          geographic_scope?: string | null
          id?: string
          province_id?: string
          raw_payload?: Json | null
          recommended_action?: string | null
          severity_numeric?: number | null
          source?: string
          timestamp?: string
          title?: string
          updated_at?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_data_source_id_fkey"
            columns: ["data_source_id"]
            isOneToOne: false
            referencedRelation: "alert_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incidents_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      provinces: {
        Row: {
          alert_level: string
          code: string
          created_at: string
          employee_count: number
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          alert_level?: string
          code: string
          created_at?: string
          employee_count?: number
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          alert_level?: string
          code?: string
          created_at?: string
          employee_count?: number
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_alerts_ingest: {
        Row: {
          category: string
          created_at: string
          id: string
          link: string | null
          location: string | null
          pub_date: string | null
          raw_data: Json | null
          source: string
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id: string
          link?: string | null
          location?: string | null
          pub_date?: string | null
          raw_data?: Json | null
          source?: string
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          link?: string | null
          location?: string | null
          pub_date?: string | null
          raw_data?: Json | null
          source?: string
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      source_health_metrics: {
        Row: {
          created_at: string
          error_message: string | null
          http_status_code: number | null
          id: string
          records_processed: number | null
          response_time_ms: number | null
          source_id: string | null
          success: boolean
          timestamp: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          http_status_code?: number | null
          id?: string
          records_processed?: number | null
          response_time_ms?: number | null
          source_id?: string | null
          success: boolean
          timestamp?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          http_status_code?: number | null
          id?: string
          records_processed?: number | null
          response_time_ms?: number | null
          source_id?: string | null
          success?: boolean
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_health_metrics_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "alert_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      toronto_police_incidents: {
        Row: {
          category: string | null
          created_at: string | null
          division: string | null
          event_id: string | null
          id: string
          latitude: number | null
          location: unknown | null
          longitude: number | null
          neighborhood: string | null
          occurrence_date: string | null
          premises_type: string | null
          raw_data: Json | null
          report_date: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          division?: string | null
          event_id?: string | null
          id?: string
          latitude?: number | null
          location?: unknown | null
          longitude?: number | null
          neighborhood?: string | null
          occurrence_date?: string | null
          premises_type?: string | null
          raw_data?: Json | null
          report_date?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          division?: string | null
          event_id?: string | null
          id?: string
          latitude?: number | null
          location?: unknown | null
          longitude?: number | null
          neighborhood?: string | null
          occurrence_date?: string | null
          premises_type?: string | null
          raw_data?: Json | null
          report_date?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      weather_alerts_ingest: {
        Row: {
          created_at: string
          description: string | null
          event_type: string | null
          expires: string | null
          geometry_coordinates: Json | null
          id: string
          onset: string | null
          raw_data: Json | null
          severity: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_type?: string | null
          expires?: string | null
          geometry_coordinates?: Json | null
          id: string
          onset?: string | null
          raw_data?: Json | null
          severity?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_type?: string | null
          expires?: string | null
          geometry_coordinates?: Json | null
          id?: string
          onset?: string | null
          raw_data?: Json | null
          severity?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
