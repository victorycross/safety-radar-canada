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
      alert_archive_log: {
        Row: {
          action: string
          alert_id: string
          alert_table: string
          created_at: string
          id: string
          metadata: Json | null
          performed_by: string
          reason: string | null
        }
        Insert: {
          action: string
          alert_id: string
          alert_table: string
          created_at?: string
          id?: string
          metadata?: Json | null
          performed_by: string
          reason?: string | null
        }
        Update: {
          action?: string
          alert_id?: string
          alert_table?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          performed_by?: string
          reason?: string | null
        }
        Relationships: []
      }
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
      analysis_rules: {
        Row: {
          analysis_type: string
          average_processing_time_ms: number | null
          created_at: string | null
          created_by: string | null
          dependencies: string[] | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          performance_metrics: Json | null
          rule_config: Json
          rule_template: string | null
          rule_version: number | null
          threshold_values: Json | null
          updated_at: string | null
        }
        Insert: {
          analysis_type: string
          average_processing_time_ms?: number | null
          created_at?: string | null
          created_by?: string | null
          dependencies?: string[] | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          performance_metrics?: Json | null
          rule_config: Json
          rule_template?: string | null
          rule_version?: number | null
          threshold_values?: Json | null
          updated_at?: string | null
        }
        Update: {
          analysis_type?: string
          average_processing_time_ms?: number | null
          created_at?: string | null
          created_by?: string | null
          dependencies?: string[] | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          performance_metrics?: Json | null
          rule_config?: Json
          rule_template?: string | null
          rule_version?: number | null
          threshold_values?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          code: string
          coordinates: unknown | null
          created_at: string
          id: string
          is_major_city: boolean
          name: string
          population: number | null
          province_id: string
          updated_at: string
        }
        Insert: {
          code: string
          coordinates?: unknown | null
          created_at?: string
          id?: string
          is_major_city?: boolean
          name: string
          population?: number | null
          province_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          coordinates?: unknown | null
          created_at?: string
          id?: string
          is_major_city?: boolean
          name?: string
          population?: number | null
          province_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      classification_rules: {
        Row: {
          classification_value: string
          condition_pattern: string
          confidence_score: number | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          rule_type: string
          source_types: string[] | null
          updated_at: string | null
        }
        Insert: {
          classification_value: string
          condition_pattern: string
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_type: string
          source_types?: string[] | null
          updated_at?: string | null
        }
        Update: {
          classification_value?: string
          condition_pattern?: string
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          rule_type?: string
          source_types?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      communication_templates: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          subject: string | null
          type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          subject?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          subject?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_processing_config: {
        Row: {
          category: string
          config_data: Json
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          priority: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          config_data: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          priority?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          config_data?: Json
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          priority?: number | null
          updated_at?: string | null
          updated_by?: string | null
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
      employee_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          created_at: string
          employee_count: number
          id: string
          previous_count: number | null
          province_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          employee_count: number
          id?: string
          previous_count?: number | null
          province_id: string
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          employee_count?: number
          id?: string
          previous_count?: number | null
          province_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_history_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_locations: {
        Row: {
          city_id: string
          created_at: string
          current_location_count: number
          home_base_count: number
          id: string
          last_updated_at: string
          province_id: string
          travel_away_count: number
          updated_by: string | null
        }
        Insert: {
          city_id: string
          created_at?: string
          current_location_count?: number
          home_base_count?: number
          id?: string
          last_updated_at?: string
          province_id: string
          travel_away_count?: number
          updated_by?: string | null
        }
        Update: {
          city_id?: string
          created_at?: string
          current_location_count?: number
          home_base_count?: number
          id?: string
          last_updated_at?: string
          province_id?: string
          travel_away_count?: number
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_locations_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_locations_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
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
      hub_employee_locations: {
        Row: {
          created_at: string | null
          current_location_count: number | null
          home_base_count: number | null
          hub_id: string
          id: string
          travel_away_count: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          current_location_count?: number | null
          home_base_count?: number | null
          hub_id: string
          id?: string
          travel_away_count?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          current_location_count?: number | null
          home_base_count?: number | null
          hub_id?: string
          id?: string
          travel_away_count?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hub_employee_locations_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: true
            referencedRelation: "international_hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      hub_incidents: {
        Row: {
          alert_level: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          confidence_score: number | null
          created_at: string | null
          description: string | null
          geographic_scope: string | null
          hub_id: string
          id: string
          raw_payload: Json | null
          recommended_action: string | null
          source: string | null
          timestamp: string | null
          title: string
          updated_at: string | null
          verification_status: string | null
        }
        Insert: {
          alert_level?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          geographic_scope?: string | null
          hub_id: string
          id?: string
          raw_payload?: Json | null
          recommended_action?: string | null
          source?: string | null
          timestamp?: string | null
          title: string
          updated_at?: string | null
          verification_status?: string | null
        }
        Update: {
          alert_level?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          confidence_score?: number | null
          created_at?: string | null
          description?: string | null
          geographic_scope?: string | null
          hub_id?: string
          id?: string
          raw_payload?: Json | null
          recommended_action?: string | null
          source?: string | null
          timestamp?: string | null
          title?: string
          updated_at?: string | null
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hub_incidents_hub_id_fkey"
            columns: ["hub_id"]
            isOneToOne: false
            referencedRelation: "international_hubs"
            referencedColumns: ["id"]
          },
        ]
      }
      immigration_travel_announcements: {
        Row: {
          announcement_type: string | null
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
          category: string | null
          content: string | null
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
          announcement_type?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          category?: string | null
          content?: string | null
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
          announcement_type?: string | null
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
          category?: string | null
          content?: string | null
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
      incidents: {
        Row: {
          alert_level: string
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
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
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
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
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
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
      international_hubs: {
        Row: {
          alert_level: string | null
          code: string
          coordinates: unknown | null
          country: string
          created_at: string | null
          employee_count: number | null
          flag_emoji: string | null
          id: string
          is_active: boolean | null
          local_incidents: number | null
          name: string
          travel_warnings: number | null
          updated_at: string | null
        }
        Insert: {
          alert_level?: string | null
          code: string
          coordinates?: unknown | null
          country: string
          created_at?: string | null
          employee_count?: number | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          local_incidents?: number | null
          name: string
          travel_warnings?: number | null
          updated_at?: string | null
        }
        Update: {
          alert_level?: string | null
          code?: string
          coordinates?: unknown | null
          country?: string
          created_at?: string | null
          employee_count?: number | null
          flag_emoji?: string | null
          id?: string
          is_active?: boolean | null
          local_incidents?: number | null
          name?: string
          travel_warnings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      location_history: {
        Row: {
          change_reason: string | null
          change_type: string
          changed_by: string | null
          city_id: string
          created_at: string
          current_location_count: number
          data_source: string | null
          home_base_count: number
          id: string
          previous_current_location_count: number | null
          previous_home_base_count: number | null
          previous_travel_away_count: number | null
          travel_away_count: number
        }
        Insert: {
          change_reason?: string | null
          change_type: string
          changed_by?: string | null
          city_id: string
          created_at?: string
          current_location_count: number
          data_source?: string | null
          home_base_count: number
          id?: string
          previous_current_location_count?: number | null
          previous_home_base_count?: number | null
          previous_travel_away_count?: number | null
          travel_away_count: number
        }
        Update: {
          change_reason?: string | null
          change_type?: string
          changed_by?: string | null
          city_id?: string
          created_at?: string
          current_location_count?: number
          data_source?: string | null
          home_base_count?: number
          id?: string
          previous_current_location_count?: number | null
          previous_home_base_count?: number | null
          previous_travel_away_count?: number | null
          travel_away_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "location_history_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      location_transitions: {
        Row: {
          actual_time: string | null
          created_at: string
          employee_id: string
          from_location_id: string
          from_location_type: string
          id: string
          initiated_by: string | null
          notes: string | null
          scheduled_time: string | null
          to_location_id: string
          to_location_type: string
          transition_status: string | null
          transition_type: string
          travel_record_id: string | null
          updated_at: string
        }
        Insert: {
          actual_time?: string | null
          created_at?: string
          employee_id: string
          from_location_id: string
          from_location_type: string
          id?: string
          initiated_by?: string | null
          notes?: string | null
          scheduled_time?: string | null
          to_location_id: string
          to_location_type: string
          transition_status?: string | null
          transition_type: string
          travel_record_id?: string | null
          updated_at?: string
        }
        Update: {
          actual_time?: string | null
          created_at?: string
          employee_id?: string
          from_location_id?: string
          from_location_type?: string
          id?: string
          initiated_by?: string | null
          notes?: string | null
          scheduled_time?: string | null
          to_location_id?: string
          to_location_type?: string
          transition_status?: string | null
          transition_type?: string
          travel_record_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "location_transitions_travel_record_id_fkey"
            columns: ["travel_record_id"]
            isOneToOne: false
            referencedRelation: "travel_records"
            referencedColumns: ["id"]
          },
        ]
      }
      national_security_risks: {
        Row: {
          assigned_lead: string | null
          created_at: string | null
          current_alerts: string | null
          id: string
          impact: number
          last_reviewed: string | null
          likelihood: number
          live_feeds: Json | null
          notes: string | null
          playbook: string | null
          preparedness_gap: number
          priority: Database["public"]["Enums"]["risk_priority"]
          rpn: number
          threat_category: string
          updated_at: string | null
        }
        Insert: {
          assigned_lead?: string | null
          created_at?: string | null
          current_alerts?: string | null
          id?: string
          impact: number
          last_reviewed?: string | null
          likelihood: number
          live_feeds?: Json | null
          notes?: string | null
          playbook?: string | null
          preparedness_gap: number
          priority?: Database["public"]["Enums"]["risk_priority"]
          rpn?: number
          threat_category: string
          updated_at?: string | null
        }
        Update: {
          assigned_lead?: string | null
          created_at?: string | null
          current_alerts?: string | null
          id?: string
          impact?: number
          last_reviewed?: string | null
          likelihood?: number
          live_feeds?: Json | null
          notes?: string | null
          playbook?: string | null
          preparedness_gap?: number
          priority?: Database["public"]["Enums"]["risk_priority"]
          rpn?: number
          threat_category?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      normalization_rules: {
        Row: {
          category_mapping: Json | null
          created_at: string | null
          created_by: string | null
          field_mappings: Json
          id: string
          is_active: boolean | null
          priority: number | null
          severity_mapping: Json | null
          source_type: string
          transformation_rules: Json | null
          updated_at: string | null
        }
        Insert: {
          category_mapping?: Json | null
          created_at?: string | null
          created_by?: string | null
          field_mappings: Json
          id?: string
          is_active?: boolean | null
          priority?: number | null
          severity_mapping?: Json | null
          source_type: string
          transformation_rules?: Json | null
          updated_at?: string | null
        }
        Update: {
          category_mapping?: Json | null
          created_at?: string | null
          created_by?: string | null
          field_mappings?: Json
          id?: string
          is_active?: boolean | null
          priority?: number | null
          severity_mapping?: Json | null
          source_type?: string
          transformation_rules?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
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
      quality_control_rules: {
        Row: {
          created_at: string | null
          created_by: string | null
          error_handling: Json | null
          id: string
          is_active: boolean | null
          priority: number | null
          updated_at: string | null
          validation_config: Json
          validation_type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          error_handling?: Json | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          updated_at?: string | null
          validation_config: Json
          validation_type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          error_handling?: Json | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          updated_at?: string | null
          validation_config?: Json
          validation_type?: string
        }
        Relationships: []
      }
      security_alerts_ingest: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
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
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
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
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
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
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
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
      staff_incident_reports: {
        Row: {
          alert_level: string
          anonymous: boolean | null
          contact_info: string
          created_at: string
          description: string
          id: string
          province_id: string
          raw_form_data: Json | null
          review_notes: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          submission_timestamp: string
          submitted_by: string | null
          title: string
          tracking_number: string
          updated_at: string
        }
        Insert: {
          alert_level?: string
          anonymous?: boolean | null
          contact_info: string
          created_at?: string
          description: string
          id?: string
          province_id: string
          raw_form_data?: Json | null
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          submission_timestamp?: string
          submitted_by?: string | null
          title: string
          tracking_number: string
          updated_at?: string
        }
        Update: {
          alert_level?: string
          anonymous?: boolean | null
          contact_info?: string
          created_at?: string
          description?: string
          id?: string
          province_id?: string
          raw_form_data?: Json | null
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          submission_timestamp?: string
          submitted_by?: string | null
          title?: string
          tracking_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_incident_reports_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_bookings: {
        Row: {
          arrival_location: string | null
          arrival_time: string | null
          booking_details: Json | null
          booking_platform: string
          booking_status: string | null
          booking_type: string
          cost_amount: number | null
          cost_currency: string | null
          created_at: string
          departure_location: string | null
          departure_time: string | null
          external_booking_ref: string | null
          id: string
          travel_record_id: string
          updated_at: string
        }
        Insert: {
          arrival_location?: string | null
          arrival_time?: string | null
          booking_details?: Json | null
          booking_platform: string
          booking_status?: string | null
          booking_type: string
          cost_amount?: number | null
          cost_currency?: string | null
          created_at?: string
          departure_location?: string | null
          departure_time?: string | null
          external_booking_ref?: string | null
          id?: string
          travel_record_id: string
          updated_at?: string
        }
        Update: {
          arrival_location?: string | null
          arrival_time?: string | null
          booking_details?: Json | null
          booking_platform?: string
          booking_status?: string | null
          booking_type?: string
          cost_amount?: number | null
          cost_currency?: string | null
          created_at?: string
          departure_location?: string | null
          departure_time?: string | null
          external_booking_ref?: string | null
          id?: string
          travel_record_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_bookings_travel_record_id_fkey"
            columns: ["travel_record_id"]
            isOneToOne: false
            referencedRelation: "travel_records"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_integration_config: {
        Row: {
          api_endpoint: string | null
          authentication_config: Json | null
          created_at: string
          error_message: string | null
          id: string
          is_active: boolean
          last_sync_at: string | null
          platform_name: string
          sync_frequency_minutes: number | null
          sync_status: string | null
          updated_at: string
        }
        Insert: {
          api_endpoint?: string | null
          authentication_config?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          platform_name: string
          sync_frequency_minutes?: number | null
          sync_status?: string | null
          updated_at?: string
        }
        Update: {
          api_endpoint?: string | null
          authentication_config?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          platform_name?: string
          sync_frequency_minutes?: number | null
          sync_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      travel_policies: {
        Row: {
          applicable_locations: string[] | null
          applicable_roles: string[] | null
          created_at: string
          created_by: string | null
          enforcement_level: string | null
          id: string
          is_active: boolean
          policy_name: string
          policy_rules: Json
          policy_type: string
          updated_at: string
        }
        Insert: {
          applicable_locations?: string[] | null
          applicable_roles?: string[] | null
          created_at?: string
          created_by?: string | null
          enforcement_level?: string | null
          id?: string
          is_active?: boolean
          policy_name: string
          policy_rules: Json
          policy_type: string
          updated_at?: string
        }
        Update: {
          applicable_locations?: string[] | null
          applicable_roles?: string[] | null
          created_at?: string
          created_by?: string | null
          enforcement_level?: string | null
          id?: string
          is_active?: boolean
          policy_name?: string
          policy_rules?: Json
          policy_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      travel_records: {
        Row: {
          approval_status: string | null
          approved_at: string | null
          approved_by: string | null
          compliance_notes: string | null
          created_at: string
          current_city_id: string | null
          departure_date: string | null
          emergency_contact_info: Json | null
          employee_id: string
          external_booking_id: string | null
          home_city_id: string
          id: string
          last_location_update: string | null
          location_status: string | null
          return_date: string | null
          risk_level: string | null
          travel_platform: string | null
          travel_status: string
          updated_at: string
        }
        Insert: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          compliance_notes?: string | null
          created_at?: string
          current_city_id?: string | null
          departure_date?: string | null
          emergency_contact_info?: Json | null
          employee_id: string
          external_booking_id?: string | null
          home_city_id: string
          id?: string
          last_location_update?: string | null
          location_status?: string | null
          return_date?: string | null
          risk_level?: string | null
          travel_platform?: string | null
          travel_status?: string
          updated_at?: string
        }
        Update: {
          approval_status?: string | null
          approved_at?: string | null
          approved_by?: string | null
          compliance_notes?: string | null
          created_at?: string
          current_city_id?: string | null
          departure_date?: string | null
          emergency_contact_info?: Json | null
          employee_id?: string
          external_booking_id?: string | null
          home_city_id?: string
          id?: string
          last_location_update?: string | null
          location_status?: string | null
          return_date?: string | null
          risk_level?: string | null
          travel_platform?: string | null
          travel_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_records_current_city_id_fkey"
            columns: ["current_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "travel_records_home_city_id_fkey"
            columns: ["home_city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_management_audit: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          performed_by: string | null
          target_user_email: string | null
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          target_user_email?: string | null
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          performed_by?: string | null
          target_user_email?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weather_alerts_ingest: {
        Row: {
          archive_reason: string | null
          archived_at: string | null
          archived_by: string | null
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
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
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
          archive_reason?: string | null
          archived_at?: string | null
          archived_by?: string | null
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
      approve_staff_incident_report: {
        Args: {
          report_id: string
          reviewer_id: string
          review_notes_text?: string
        }
        Returns: string
      }
      bulk_archive_alerts: {
        Args: {
          alert_table_name: string
          alert_ids: string[]
          archive_reason: string
          user_id?: string
        }
        Returns: Json
      }
      bulk_unarchive_alerts: {
        Args: {
          alert_table_name: string
          alert_ids: string[]
          unarchive_reason: string
          user_id?: string
        }
        Returns: Json
      }
      generate_tracking_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_processing_rules: {
        Args: { rule_category: string }
        Returns: {
          id: string
          name: string
          config_data: Json
          priority: number
        }[]
      }
      get_analysis_rules_by_template: {
        Args: { template_name: string }
        Returns: {
          id: string
          analysis_type: string
          rule_config: Json
          threshold_values: Json
          performance_metrics: Json
        }[]
      }
      get_hub_employee_summary: {
        Args: { hub_uuid: string }
        Returns: {
          hub_id: string
          total_home_base: number
          total_current_location: number
          total_travel_away: number
          hub_total: number
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      is_power_user_or_admin: {
        Args: { _user_id?: string }
        Returns: boolean
      }
      make_user_admin: {
        Args: { _user_email: string }
        Returns: undefined
      }
      recalculate_all_hub_totals: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      recalculate_all_province_totals: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reject_staff_incident_report: {
        Args: {
          report_id: string
          reviewer_id: string
          review_notes_text: string
        }
        Returns: boolean
      }
      sync_all_hub_incident_counts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      sync_all_province_alert_levels: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_all_hub_data_consistency: {
        Args: Record<PropertyKey, never>
        Returns: {
          hub_name: string
          hub_total: number
          location_total: number
          has_location_record: boolean
          consistency_status: string
        }[]
      }
      validate_hub_data_consistency: {
        Args: Record<PropertyKey, never>
        Returns: {
          hub_name: string
          issue_description: string
          severity: string
        }[]
      }
      validate_travel_compliance: {
        Args: {
          employee_id: string
          destination_city_id: string
          travel_start_date: string
        }
        Returns: {
          is_compliant: boolean
          policy_violations: Json
          recommendations: Json
        }[]
      }
      verify_rls_coverage: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          rls_enabled: boolean
          policy_count: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "power_user" | "regular_user"
      risk_priority: "high" | "medium" | "low"
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
    Enums: {
      app_role: ["admin", "power_user", "regular_user"],
      risk_priority: ["high", "medium", "low"],
    },
  },
} as const
