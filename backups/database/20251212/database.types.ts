export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string | null
          first_name: string | null
          id: string
          invite_link: string | null
          invited_user_id: string | null
          inviter_id: string | null
          last_name: string | null
          last_sent_at: string
          metadata: Json | null
          responded_at: string | null
          role: Database["public"]["Enums"]["user_role"]
          sent_at: string
          status: Database["public"]["Enums"]["invitation_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string | null
          first_name?: string | null
          id?: string
          invite_link?: string | null
          invited_user_id?: string | null
          inviter_id?: string | null
          last_name?: string | null
          last_sent_at?: string
          metadata?: Json | null
          responded_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          sent_at?: string
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string | null
          first_name?: string | null
          id?: string
          invite_link?: string | null
          invited_user_id?: string | null
          inviter_id?: string | null
          last_name?: string | null
          last_sent_at?: string
          metadata?: Json | null
          responded_at?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          sent_at?: string
          status?: Database["public"]["Enums"]["invitation_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "admin_invitations_inviter_id_fkey"
            columns: ["inviter_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          body: string
          created_at: string
          created_by: string
          id: string
          target_scope: Database["public"]["Enums"]["announcement_target_scope"]
          target_vendor_ids: string[] | null
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by: string
          id?: string
          target_scope?: Database["public"]["Enums"]["announcement_target_scope"]
          target_vendor_ids?: string[] | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string
          id?: string
          target_scope?: Database["public"]["Enums"]["announcement_target_scope"]
          target_vendor_ids?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_configurations: {
        Row: {
          archive_condition: string | null
          archive_location: string | null
          archive_prefix: string | null
          batch_size: number | null
          compress_enabled: boolean | null
          created_at: string | null
          delete_after_archive: boolean | null
          enabled: boolean | null
          id: string
          max_archive_size_mb: number | null
          metadata: Json | null
          notification_enabled: boolean | null
          retention_days: number
          schedule: string | null
          table_name: string
          updated_at: string | null
        }
        Insert: {
          archive_condition?: string | null
          archive_location?: string | null
          archive_prefix?: string | null
          batch_size?: number | null
          compress_enabled?: boolean | null
          created_at?: string | null
          delete_after_archive?: boolean | null
          enabled?: boolean | null
          id?: string
          max_archive_size_mb?: number | null
          metadata?: Json | null
          notification_enabled?: boolean | null
          retention_days?: number
          schedule?: string | null
          table_name: string
          updated_at?: string | null
        }
        Update: {
          archive_condition?: string | null
          archive_location?: string | null
          archive_prefix?: string | null
          batch_size?: number | null
          compress_enabled?: boolean | null
          created_at?: string | null
          delete_after_archive?: boolean | null
          enabled?: boolean | null
          id?: string
          max_archive_size_mb?: number | null
          metadata?: Json | null
          notification_enabled?: boolean | null
          retention_days?: number
          schedule?: string | null
          table_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      archive_files: {
        Row: {
          archive_path: string
          checksum: string | null
          compressed: boolean | null
          created_at: string | null
          expires_at: string | null
          file_size_bytes: number
          file_size_mb: number | null
          filename: string
          id: string
          metadata: Json | null
          record_count: number
          table_name: string
        }
        Insert: {
          archive_path: string
          checksum?: string | null
          compressed?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          file_size_bytes: number
          file_size_mb?: number | null
          filename: string
          id?: string
          metadata?: Json | null
          record_count: number
          table_name: string
        }
        Update: {
          archive_path?: string
          checksum?: string | null
          compressed?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          file_size_bytes?: number
          file_size_mb?: number | null
          filename?: string
          id?: string
          metadata?: Json | null
          record_count?: number
          table_name?: string
        }
        Relationships: []
      }
      archive_jobs: {
        Row: {
          actual_size_mb: number | null
          archive_path: string | null
          archive_size_mb: number | null
          archived_records: number | null
          batch_size: number | null
          compression_ratio: number | null
          conditions: string | null
          config_name: string
          created_at: string | null
          duration_ms: number | null
          end_time: string | null
          error_message: string | null
          estimated_size_mb: number | null
          failed_records: number | null
          id: string
          processed_records: number | null
          start_time: string | null
          status: string
          table_name: string
          total_records: number | null
        }
        Insert: {
          actual_size_mb?: number | null
          archive_path?: string | null
          archive_size_mb?: number | null
          archived_records?: number | null
          batch_size?: number | null
          compression_ratio?: number | null
          conditions?: string | null
          config_name: string
          created_at?: string | null
          duration_ms?: number | null
          end_time?: string | null
          error_message?: string | null
          estimated_size_mb?: number | null
          failed_records?: number | null
          id?: string
          processed_records?: number | null
          start_time?: string | null
          status?: string
          table_name: string
          total_records?: number | null
        }
        Update: {
          actual_size_mb?: number | null
          archive_path?: string | null
          archive_size_mb?: number | null
          archived_records?: number | null
          batch_size?: number | null
          compression_ratio?: number | null
          conditions?: string | null
          config_name?: string
          created_at?: string | null
          duration_ms?: number | null
          end_time?: string | null
          error_message?: string | null
          estimated_size_mb?: number | null
          failed_records?: number | null
          id?: string
          processed_records?: number | null
          start_time?: string | null
          status?: string
          table_name?: string
          total_records?: number | null
        }
        Relationships: []
      }
      archive_notifications: {
        Row: {
          created_at: string | null
          id: string
          job_id: string | null
          message: string
          metadata: Json | null
          priority: string | null
          recipient_id: string | null
          sent: boolean | null
          sent_at: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          message: string
          metadata?: Json | null
          priority?: string | null
          recipient_id?: string | null
          sent?: boolean | null
          sent_at?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          recipient_id?: string | null
          sent?: boolean | null
          sent_at?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "archive_notifications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "archive_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archive_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "archive_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      archive_statistics: {
        Row: {
          average_compression_ratio: number | null
          created_at: string | null
          date: string
          id: string
          jobs_completed: number | null
          jobs_failed: number | null
          records_archived: number | null
          space_saved_mb: number | null
          table_name: string
          total_duration_ms: number | null
          updated_at: string | null
        }
        Insert: {
          average_compression_ratio?: number | null
          created_at?: string | null
          date: string
          id?: string
          jobs_completed?: number | null
          jobs_failed?: number | null
          records_archived?: number | null
          space_saved_mb?: number | null
          table_name: string
          total_duration_ms?: number | null
          updated_at?: string | null
        }
        Update: {
          average_compression_ratio?: number | null
          created_at?: string | null
          date?: string
          id?: string
          jobs_completed?: number | null
          jobs_failed?: number | null
          records_archived?: number | null
          space_saved_mb?: number | null
          table_name?: string
          total_duration_ms?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          bid_amount: number
          documents: Json | null
          id: string
          notes: string | null
          project_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["bid_status"]
          submitted_at: string
          vendor_id: string
        }
        Insert: {
          bid_amount: number
          documents?: Json | null
          id?: string
          notes?: string | null
          project_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["bid_status"]
          submitted_at?: string
          vendor_id: string
        }
        Update: {
          bid_amount?: number
          documents?: Json | null
          id?: string
          notes?: string | null
          project_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["bid_status"]
          submitted_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bids_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bids_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cache_entries: {
        Row: {
          access_count: number | null
          cache_key: string
          checksum: string | null
          compression_enabled: boolean | null
          created_at: string | null
          data_type: string
          encryption_enabled: boolean | null
          expires_at: string | null
          hit_count: number | null
          id: string
          last_accessed: string | null
          layer_name: string
          metadata: Json | null
          miss_count: number | null
          size_bytes: number
          tags: string[] | null
          ttl_seconds: number
          version: number | null
        }
        Insert: {
          access_count?: number | null
          cache_key: string
          checksum?: string | null
          compression_enabled?: boolean | null
          created_at?: string | null
          data_type: string
          encryption_enabled?: boolean | null
          expires_at?: string | null
          hit_count?: number | null
          id?: string
          last_accessed?: string | null
          layer_name: string
          metadata?: Json | null
          miss_count?: number | null
          size_bytes: number
          tags?: string[] | null
          ttl_seconds: number
          version?: number | null
        }
        Update: {
          access_count?: number | null
          cache_key?: string
          checksum?: string | null
          compression_enabled?: boolean | null
          created_at?: string | null
          data_type?: string
          encryption_enabled?: boolean | null
          expires_at?: string | null
          hit_count?: number | null
          id?: string
          last_accessed?: string | null
          layer_name?: string
          metadata?: Json | null
          miss_count?: number | null
          size_bytes?: number
          tags?: string[] | null
          ttl_seconds?: number
          version?: number | null
        }
        Relationships: []
      }
      cache_statistics: {
        Row: {
          average_access_time_ms: number | null
          cache_hits: number | null
          cache_misses: number | null
          compression_ratio: number | null
          created_at: string | null
          date: string
          evictions: number | null
          hour: number
          id: string
          layer_name: string
          memory_usage_bytes: number | null
          sync_operations: number | null
          total_requests: number | null
          updated_at: string | null
        }
        Insert: {
          average_access_time_ms?: number | null
          cache_hits?: number | null
          cache_misses?: number | null
          compression_ratio?: number | null
          created_at?: string | null
          date: string
          evictions?: number | null
          hour: number
          id?: string
          layer_name: string
          memory_usage_bytes?: number | null
          sync_operations?: number | null
          total_requests?: number | null
          updated_at?: string | null
        }
        Update: {
          average_access_time_ms?: number | null
          cache_hits?: number | null
          cache_misses?: number | null
          compression_ratio?: number | null
          created_at?: string | null
          date?: string
          evictions?: number | null
          hour?: number
          id?: string
          layer_name?: string
          memory_usage_bytes?: number | null
          sync_operations?: number | null
          total_requests?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cache_warming_schedules: {
        Row: {
          average_duration_ms: number | null
          created_at: string | null
          cron_expression: string
          description: string | null
          failure_count: number | null
          id: string
          is_enabled: boolean | null
          last_run: string | null
          name: string
          next_run: string | null
          queries: Json
          success_count: number | null
          updated_at: string | null
        }
        Insert: {
          average_duration_ms?: number | null
          created_at?: string | null
          cron_expression: string
          description?: string | null
          failure_count?: number | null
          id?: string
          is_enabled?: boolean | null
          last_run?: string | null
          name: string
          next_run?: string | null
          queries?: Json
          success_count?: number | null
          updated_at?: string | null
        }
        Update: {
          average_duration_ms?: number | null
          created_at?: string | null
          cron_expression?: string
          description?: string | null
          failure_count?: number | null
          id?: string
          is_enabled?: boolean | null
          last_run?: string | null
          name?: string
          next_run?: string | null
          queries?: Json
          success_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cms_content_blocks: {
        Row: {
          content: Json
          created_at: string
          id: string
          key: string
          page_slug: string
          section: string
          type: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          key: string
          page_slug: string
          section: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          key?: string
          page_slug?: string
          section?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_content_blocks_page_slug_fkey"
            columns: ["page_slug"]
            isOneToOne: false
            referencedRelation: "cms_pages"
            referencedColumns: ["slug"]
          },
        ]
      }
      cms_detail_blocks: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          image_url: string | null
          item_slug: string
          page_slug: string
          paragraphs: Json
          position: number
          status: Database["public"]["Enums"]["cms_page_status"]
          title: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          item_slug: string
          page_slug: string
          paragraphs?: Json
          position?: number
          status?: Database["public"]["Enums"]["cms_page_status"]
          title: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          item_slug?: string
          page_slug?: string
          paragraphs?: Json
          position?: number
          status?: Database["public"]["Enums"]["cms_page_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_detail_blocks_page_slug_fkey"
            columns: ["page_slug"]
            isOneToOne: false
            referencedRelation: "cms_pages"
            referencedColumns: ["slug"]
          },
        ]
      }
      cms_home: {
        Row: {
          bg_desktop_url: string | null
          bg_mobile_url: string | null
          bg_tablet_url: string | null
          cta_buttons: Json | null
          hero_text_h2: string | null
          hero_text_p: string | null
          id: string
          svg_headline_url: string | null
          updated_at: string | null
        }
        Insert: {
          bg_desktop_url?: string | null
          bg_mobile_url?: string | null
          bg_tablet_url?: string | null
          cta_buttons?: Json | null
          hero_text_h2?: string | null
          hero_text_p?: string | null
          id?: string
          svg_headline_url?: string | null
          updated_at?: string | null
        }
        Update: {
          bg_desktop_url?: string | null
          bg_mobile_url?: string | null
          bg_tablet_url?: string | null
          cta_buttons?: Json | null
          hero_text_h2?: string | null
          hero_text_p?: string | null
          id?: string
          svg_headline_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      cms_image_grid_items: {
        Row: {
          alt_text: string | null
          created_at: string
          icon_name: string | null
          id: string
          image_position: string | null
          image_url: string | null
          label: string
          label_line_1: string | null
          label_line_2: string | null
          page_slug: string
          position: number
          section: string
          slug: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          icon_name?: string | null
          id?: string
          image_position?: string | null
          image_url?: string | null
          label: string
          label_line_1?: string | null
          label_line_2?: string | null
          page_slug: string
          position: number
          section: string
          slug: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          icon_name?: string | null
          id?: string
          image_position?: string | null
          image_url?: string | null
          label?: string
          label_line_1?: string | null
          label_line_2?: string | null
          page_slug?: string
          position?: number
          section?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_image_grid_items_page_slug_fkey"
            columns: ["page_slug"]
            isOneToOne: false
            referencedRelation: "cms_pages"
            referencedColumns: ["slug"]
          },
        ]
      }
      cms_pages: {
        Row: {
          canonical_url: string | null
          created_at: string
          description: string | null
          meta_description: string | null
          meta_title: string | null
          og_image_url: string | null
          slug: string
          status: Database["public"]["Enums"]["cms_page_status"]
          title: string
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          slug: string
          status?: Database["public"]["Enums"]["cms_page_status"]
          title: string
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          description?: string | null
          meta_description?: string | null
          meta_title?: string | null
          og_image_url?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["cms_page_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          action_label: string | null
          action_url: string | null
          body: string
          created_at: string | null
          id: string
          is_read: boolean
          project_id: string | null
          sent_by: string | null
          subject: string
          vendor_id: string
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          body: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          project_id?: string | null
          sent_by?: string | null
          subject: string
          vendor_id: string
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          body?: string
          created_at?: string | null
          id?: string
          is_read?: boolean
          project_id?: string | null
          sent_by?: string | null
          subject?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_sent_by_fkey"
            columns: ["sent_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "messages_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_alerts: {
        Row: {
          actual_value: number | null
          alert_type: string
          created_at: string | null
          description: string
          id: string
          is_resolved: boolean | null
          metadata: Json | null
          metrics: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          threshold_value: number | null
          title: string
        }
        Insert: {
          actual_value?: number | null
          alert_type: string
          created_at?: string | null
          description: string
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          metrics?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          threshold_value?: number | null
          title: string
        }
        Update: {
          actual_value?: number | null
          alert_type?: string
          created_at?: string | null
          description?: string
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          metrics?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          threshold_value?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "performance_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_alerts_extended: {
        Row: {
          actions_taken: Json | null
          actual_value: number
          alert_type: string
          auto_resolved: boolean | null
          created_at: string | null
          description: string
          id: string
          is_resolved: boolean | null
          metrics: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          threshold_value: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actions_taken?: Json | null
          actual_value: number
          alert_type: string
          auto_resolved?: boolean | null
          created_at?: string | null
          description: string
          id?: string
          is_resolved?: boolean | null
          metrics?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          threshold_value?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actions_taken?: Json | null
          actual_value?: number
          alert_type?: string
          auto_resolved?: boolean | null
          created_at?: string | null
          description?: string
          id?: string
          is_resolved?: boolean | null
          metrics?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          threshold_value?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_alerts_extended_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "performance_alerts_extended_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_anomalies: {
        Row: {
          actual_value: number
          anomaly_type: string
          baseline_value: number
          category: string
          confidence_score: number
          context: Json | null
          created_at: string | null
          deviation_percent: number
          id: string
          investigated_by: string | null
          investigation_notes: string | null
          is_investigated: boolean | null
          metric_name: string
          severity: string
          time_window_end: string
          time_window_start: string
        }
        Insert: {
          actual_value: number
          anomaly_type: string
          baseline_value: number
          category: string
          confidence_score: number
          context?: Json | null
          created_at?: string | null
          deviation_percent: number
          id?: string
          investigated_by?: string | null
          investigation_notes?: string | null
          is_investigated?: boolean | null
          metric_name: string
          severity: string
          time_window_end: string
          time_window_start: string
        }
        Update: {
          actual_value?: number
          anomaly_type?: string
          baseline_value?: number
          category?: string
          confidence_score?: number
          context?: Json | null
          created_at?: string | null
          deviation_percent?: number
          id?: string
          investigated_by?: string | null
          investigation_notes?: string | null
          is_investigated?: boolean | null
          metric_name?: string
          severity?: string
          time_window_end?: string
          time_window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_anomalies_investigated_by_fkey"
            columns: ["investigated_by"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "performance_anomalies_investigated_by_fkey"
            columns: ["investigated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_baselines: {
        Row: {
          baseline_type: string
          baseline_value: number
          category: string
          created_at: string | null
          id: string
          max_value: number
          metric_name: string
          min_value: number
          sample_size: number
          std_deviation: number
          time_period: string
        }
        Insert: {
          baseline_type: string
          baseline_value: number
          category: string
          created_at?: string | null
          id?: string
          max_value: number
          metric_name: string
          min_value: number
          sample_size: number
          std_deviation: number
          time_period: string
        }
        Update: {
          baseline_type?: string
          baseline_value?: number
          category?: string
          created_at?: string | null
          id?: string
          max_value?: number
          metric_name?: string
          min_value?: number
          sample_size?: number
          std_deviation?: number
          time_period?: string
        }
        Relationships: []
      }
      performance_dashboard_snapshots: {
        Row: {
          active_alerts: number | null
          categories: Json | null
          created_at: string | null
          id: string
          snapshot_date: string
          snapshot_hour: number
          system_health: string | null
          top_alerts: Json | null
          total_metrics: number | null
        }
        Insert: {
          active_alerts?: number | null
          categories?: Json | null
          created_at?: string | null
          id?: string
          snapshot_date: string
          snapshot_hour: number
          system_health?: string | null
          top_alerts?: Json | null
          total_metrics?: number | null
        }
        Update: {
          active_alerts?: number | null
          categories?: Json | null
          created_at?: string | null
          id?: string
          snapshot_date?: string
          snapshot_hour?: number
          system_health?: string | null
          top_alerts?: Json | null
          total_metrics?: number | null
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          category: string
          created_at: string | null
          id: string
          metadata: Json | null
          metric_name: string
          tags: Json | null
          unit: string
          updated_at: string | null
          value: number
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          tags?: Json | null
          unit: string
          updated_at?: string | null
          value: number
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          tags?: Json | null
          unit?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: []
      }
      performance_recommendations: {
        Row: {
          created_at: string | null
          description: string
          estimated_improvement: number | null
          id: string
          implementation_status: string | null
          implemented_at: string | null
          implemented_by: string | null
          metadata: Json | null
          priority: string
          recommendation_type: string
          sql_statement: string | null
          target_query: string | null
          target_table: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description: string
          estimated_improvement?: number | null
          id?: string
          implementation_status?: string | null
          implemented_at?: string | null
          implemented_by?: string | null
          metadata?: Json | null
          priority: string
          recommendation_type: string
          sql_statement?: string | null
          target_query?: string | null
          target_table?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string
          estimated_improvement?: number | null
          id?: string
          implementation_status?: string | null
          implemented_at?: string | null
          implemented_by?: string | null
          metadata?: Json | null
          priority?: string
          recommendation_type?: string
          sql_statement?: string | null
          target_query?: string | null
          target_table?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_recommendations_implemented_by_fkey"
            columns: ["implemented_by"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "performance_recommendations_implemented_by_fkey"
            columns: ["implemented_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_recommendations_extended: {
        Row: {
          created_at: string | null
          description: string
          estimated_improvement: number | null
          id: string
          implementation_status: string | null
          implemented_at: string | null
          implemented_by: string | null
          metadata: Json | null
          priority: string
          recommendation_type: string
          sql_statement: string | null
          target_metric: string | null
          target_query: string | null
          target_table: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          estimated_improvement?: number | null
          id?: string
          implementation_status?: string | null
          implemented_at?: string | null
          implemented_by?: string | null
          metadata?: Json | null
          priority: string
          recommendation_type: string
          sql_statement?: string | null
          target_metric?: string | null
          target_query?: string | null
          target_table?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          estimated_improvement?: number | null
          id?: string
          implementation_status?: string | null
          implemented_at?: string | null
          implemented_by?: string | null
          metadata?: Json | null
          priority?: string
          recommendation_type?: string
          sql_statement?: string | null
          target_metric?: string | null
          target_query?: string | null
          target_table?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_recommendations_extended_implemented_by_fkey"
            columns: ["implemented_by"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "performance_recommendations_extended_implemented_by_fkey"
            columns: ["implemented_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_thresholds: {
        Row: {
          cooldown_ms: number | null
          created_at: string | null
          description: string | null
          enabled: boolean | null
          id: string
          metric_name: string
          name: string
          operator: string
          severity: string
          tags: Json | null
          threshold_value: number
          updated_at: string | null
          window_size: number | null
        }
        Insert: {
          cooldown_ms?: number | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          metric_name: string
          name: string
          operator: string
          severity: string
          tags?: Json | null
          threshold_value: number
          updated_at?: string | null
          window_size?: number | null
        }
        Update: {
          cooldown_ms?: number | null
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          id?: string
          metric_name?: string
          name?: string
          operator?: string
          severity?: string
          tags?: Json | null
          threshold_value?: number
          updated_at?: string | null
          window_size?: number | null
        }
        Relationships: []
      }
      permission_conflicts: {
        Row: {
          conflict_type: string
          conflicting_rules: Json
          created_at: string
          id: string
          permission: string
          resolution: string
          resolved_at: string | null
          resolved_by: string | null
          role: string
          user_id: string | null
        }
        Insert: {
          conflict_type: string
          conflicting_rules: Json
          created_at?: string
          id?: string
          permission: string
          resolution: string
          resolved_at?: string | null
          resolved_by?: string | null
          role: string
          user_id?: string | null
        }
        Update: {
          conflict_type?: string
          conflicting_rules?: Json
          created_at?: string
          id?: string
          permission?: string
          resolution?: string
          resolved_at?: string | null
          resolved_by?: string | null
          role?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permission_conflicts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "permission_conflicts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permission_conflicts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "permission_conflicts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      permission_inheritance_rules: {
        Row: {
          conditions: Json | null
          created_at: string
          description: string | null
          enabled: boolean
          id: string
          inheritance_type: string
          name: string
          permissions: string[] | null
          priority: number
          source_role: string
          target_role: string
          updated_at: string
        }
        Insert: {
          conditions?: Json | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          inheritance_type: string
          name: string
          permissions?: string[] | null
          priority?: number
          source_role: string
          target_role: string
          updated_at?: string
        }
        Update: {
          conditions?: Json | null
          created_at?: string
          description?: string | null
          enabled?: boolean
          id?: string
          inheritance_type?: string
          name?: string
          permissions?: string[] | null
          priority?: number
          source_role?: string
          target_role?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          budget_range_max: number | null
          budget_range_min: number | null
          category: string
          created_at: string
          created_by: string
          description: string
          id: string
          status: Database["public"]["Enums"]["project_status"]
          timeline_end: string | null
          timeline_start: string | null
          title: string
          updated_at: string
        }
        Insert: {
          budget_range_max?: number | null
          budget_range_min?: number | null
          category: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          status?: Database["public"]["Enums"]["project_status"]
          timeline_end?: string | null
          timeline_start?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          budget_range_max?: number | null
          budget_range_min?: number | null
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          status?: Database["public"]["Enums"]["project_status"]
          timeline_end?: string | null
          timeline_start?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      query_performance: {
        Row: {
          cache_hit: boolean | null
          created_at: string | null
          execution_plan: Json | null
          execution_time_ms: number
          id: string
          index_used: string | null
          parameters: Json | null
          performance_score: number | null
          query_hash: string
          query_text: string
          rows_examined: number | null
          rows_returned: number | null
          session_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          cache_hit?: boolean | null
          created_at?: string | null
          execution_plan?: Json | null
          execution_time_ms: number
          id?: string
          index_used?: string | null
          parameters?: Json | null
          performance_score?: number | null
          query_hash: string
          query_text: string
          rows_examined?: number | null
          rows_returned?: number | null
          session_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          cache_hit?: boolean | null
          created_at?: string | null
          execution_plan?: Json | null
          execution_time_ms?: number
          id?: string
          index_used?: string | null
          parameters?: Json | null
          performance_score?: number | null
          query_hash?: string
          query_text?: string
          rows_examined?: number | null
          rows_returned?: number | null
          session_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "query_performance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "query_performance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          blockuntil: string | null
          count: number
          id: string
          key: string
          maxcount: number
          metadata: Json | null
          windowduration: number
          windowstart: string
        }
        Insert: {
          blockuntil?: string | null
          count?: number
          id?: string
          key: string
          maxcount: number
          metadata?: Json | null
          windowduration: number
          windowstart?: string
        }
        Update: {
          blockuntil?: string | null
          count?: number
          id?: string
          key?: string
          maxcount?: number
          metadata?: Json | null
          windowduration?: number
          windowstart?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          permission: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          permission: string
          role: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          permission?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action: string
          category: string
          errormessage: string | null
          id: string
          ipaddress: string
          newvalues: Json | null
          oldvalues: Json | null
          resource: string
          resourceid: string | null
          sessionid: string | null
          severity: string
          success: boolean
          timestamp: string
          useragent: string
          userid: string | null
        }
        Insert: {
          action: string
          category: string
          errormessage?: string | null
          id?: string
          ipaddress: string
          newvalues?: Json | null
          oldvalues?: Json | null
          resource: string
          resourceid?: string | null
          sessionid?: string | null
          severity?: string
          success?: boolean
          timestamp?: string
          useragent: string
          userid?: string | null
        }
        Update: {
          action?: string
          category?: string
          errormessage?: string | null
          id?: string
          ipaddress?: string
          newvalues?: Json | null
          oldvalues?: Json | null
          resource?: string
          resourceid?: string | null
          sessionid?: string | null
          severity?: string
          success?: boolean
          timestamp?: string
          useragent?: string
          userid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_audit_logs_sessionid_fkey"
            columns: ["sessionid"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["sessionid"]
          },
          {
            foreignKeyName: "security_audit_logs_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "security_audit_logs_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      security_events: {
        Row: {
          activity: string
          details: Json | null
          id: string
          notes: string | null
          resolved: boolean
          resolvedat: string | null
          resolvedby: string | null
          sessionid: string | null
          severity: string
          timestamp: string
          type: string
          userid: string | null
        }
        Insert: {
          activity: string
          details?: Json | null
          id?: string
          notes?: string | null
          resolved?: boolean
          resolvedat?: string | null
          resolvedby?: string | null
          sessionid?: string | null
          severity?: string
          timestamp?: string
          type: string
          userid?: string | null
        }
        Update: {
          activity?: string
          details?: Json | null
          id?: string
          notes?: string | null
          resolved?: boolean
          resolvedat?: string | null
          resolvedby?: string | null
          sessionid?: string | null
          severity?: string
          timestamp?: string
          type?: string
          userid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "security_events_resolvedby_fkey"
            columns: ["resolvedby"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "security_events_resolvedby_fkey"
            columns: ["resolvedby"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_events_sessionid_fkey"
            columns: ["sessionid"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["sessionid"]
          },
          {
            foreignKeyName: "security_events_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "security_events_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      security_settings: {
        Row: {
          createdat: string
          emailnotifications: boolean
          id: string
          ipwhitelist: string[] | null
          maxsessions: number
          newloginalert: boolean
          requiremfa: boolean
          sessiontimeout: number
          suspiciousactivityalert: boolean
          trusteddevices: string[] | null
          updatedat: string
          userid: string
        }
        Insert: {
          createdat?: string
          emailnotifications?: boolean
          id?: string
          ipwhitelist?: string[] | null
          maxsessions?: number
          newloginalert?: boolean
          requiremfa?: boolean
          sessiontimeout?: number
          suspiciousactivityalert?: boolean
          trusteddevices?: string[] | null
          updatedat?: string
          userid: string
        }
        Update: {
          createdat?: string
          emailnotifications?: boolean
          id?: string
          ipwhitelist?: string[] | null
          maxsessions?: number
          newloginalert?: boolean
          requiremfa?: boolean
          sessiontimeout?: number
          suspiciousactivityalert?: boolean
          trusteddevices?: string[] | null
          updatedat?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_settings_userid_fkey"
            columns: ["userid"]
            isOneToOne: true
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "security_settings_userid_fkey"
            columns: ["userid"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      system_health_snapshots: {
        Row: {
          active_users_24h: number
          created_at: string
          error_rate: number
          id: string
          latency_ms: number
          status: string
          total_requests_24h: number
          uptime_percentage: number
        }
        Insert: {
          active_users_24h: number
          created_at?: string
          error_rate: number
          id?: string
          latency_ms: number
          status: string
          total_requests_24h: number
          uptime_percentage: number
        }
        Update: {
          active_users_24h?: number
          created_at?: string
          error_rate?: number
          id?: string
          latency_ms?: number
          status?: string
          total_requests_24h?: number
          uptime_percentage?: number
        }
        Relationships: []
      }
      system_metrics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number | null
          recorded_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value?: number | null
          recorded_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number | null
          recorded_at?: string
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          access_granted: boolean
          created_at: string
          feature_key: string
          id: string
          page_key: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_granted?: boolean
          created_at?: string
          feature_key: string
          id?: string
          page_key?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_granted?: boolean
          created_at?: string
          feature_key?: string
          id?: string
          page_key?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          createdat: string
          deviceinfo: Json | null
          id: string
          invalidatedat: string | null
          ipaddress: string
          isactive: boolean
          lastactivity: string
          location: Json | null
          sessionid: string
          useragent: string
          userid: string
        }
        Insert: {
          createdat?: string
          deviceinfo?: Json | null
          id?: string
          invalidatedat?: string | null
          ipaddress: string
          isactive?: boolean
          lastactivity?: string
          location?: Json | null
          sessionid: string
          useragent: string
          userid: string
        }
        Update: {
          createdat?: string
          deviceinfo?: Json | null
          id?: string
          invalidatedat?: string | null
          ipaddress?: string
          isactive?: boolean
          lastactivity?: string
          location?: Json | null
          sessionid?: string
          useragent?: string
          userid?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_sessions_userid_fkey"
            columns: ["userid"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          deleted_at: string | null
          email: string
          email_verified: boolean
          failed_attempts: number
          first_name: string
          id: string
          invitation_expires_at: string | null
          invitation_token: string | null
          last_name: string
          locked_until: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
          username: string | null
          username_changed: boolean
          vendor_status:
            | Database["public"]["Enums"]["user_vendor_status"]
            | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          email: string
          email_verified?: boolean
          failed_attempts?: number
          first_name: string
          id?: string
          invitation_expires_at?: string | null
          invitation_token?: string | null
          last_name: string
          locked_until?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          username?: string | null
          username_changed?: boolean
          vendor_status?:
            | Database["public"]["Enums"]["user_vendor_status"]
            | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          email?: string
          email_verified?: boolean
          failed_attempts?: number
          first_name?: string
          id?: string
          invitation_expires_at?: string | null
          invitation_token?: string | null
          last_name?: string
          locked_until?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
          username?: string | null
          username_changed?: boolean
          vendor_status?:
            | Database["public"]["Enums"]["user_vendor_status"]
            | null
        }
        Relationships: []
      }
      vendor_change_logs: {
        Row: {
          changed_by: string
          changed_by_user_id: string | null
          created_at: string | null
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          vendor_id: string
        }
        Insert: {
          changed_by: string
          changed_by_user_id?: string | null
          created_at?: string | null
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          vendor_id: string
        }
        Update: {
          changed_by?: string
          changed_by_user_id?: string | null
          created_at?: string | null
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_change_logs_changed_by_user_id_fkey"
            columns: ["changed_by_user_id"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vendor_change_logs_changed_by_user_id_fkey"
            columns: ["changed_by_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_change_logs_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vendor_change_logs_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          bank_account_holder: string
          bank_account_number: string
          bank_name: string
          company_address: Json | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          created_at: string | null
          documents: Json | null
          id: string
          individual_address: Json | null
          individual_email: string | null
          individual_name: string | null
          individual_phone: string | null
          nib_number: string | null
          npwp_number: string
          pkp_status: Database["public"]["Enums"]["pkp_status"] | null
          specializations: string[] | null
          status: Database["public"]["Enums"]["vendor_status"] | null
          type: Database["public"]["Enums"]["vendor_type"]
          updated_at: string | null
        }
        Insert: {
          bank_account_holder: string
          bank_account_number: string
          bank_name: string
          company_address?: Json | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string | null
          documents?: Json | null
          id: string
          individual_address?: Json | null
          individual_email?: string | null
          individual_name?: string | null
          individual_phone?: string | null
          nib_number?: string | null
          npwp_number: string
          pkp_status?: Database["public"]["Enums"]["pkp_status"] | null
          specializations?: string[] | null
          status?: Database["public"]["Enums"]["vendor_status"] | null
          type: Database["public"]["Enums"]["vendor_type"]
          updated_at?: string | null
        }
        Update: {
          bank_account_holder?: string
          bank_account_number?: string
          bank_name?: string
          company_address?: Json | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          created_at?: string | null
          documents?: Json | null
          id?: string
          individual_address?: Json | null
          individual_email?: string | null
          individual_name?: string | null
          individual_phone?: string | null
          nib_number?: string | null
          npwp_number?: string
          pkp_status?: Database["public"]["Enums"]["pkp_status"] | null
          specializations?: string[] | null
          status?: Database["public"]["Enums"]["vendor_status"] | null
          type?: Database["public"]["Enums"]["vendor_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "permission_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "vendors_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      dashboard_latest_snapshot: {
        Row: {
          active_alerts: number | null
          error_rate_24h: number | null
          snapshot_date: string | null
          snapshot_hour: number | null
          system_health: string | null
          total_metrics: number | null
          uptime_24h: number | null
        }
        Relationships: []
      }
      permission_analytics: {
        Row: {
          admin_permissions: number | null
          dashboard_permissions: number | null
          denied_permissions: number | null
          email: string | null
          granted_permissions: number | null
          last_permission_update: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          total_permissions: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      analyze_permission_performance: {
        Args: never
        Returns: {
          avg_execution_time: number
          query_type: string
          slow_calls: number
          total_calls: number
        }[]
      }
      analyze_slow_queries: {
        Args: never
        Returns: {
          avg_execution_time: number
          execution_count: number
          query_hash: string
          recommendation: string
        }[]
      }
      cleanup_expired_cache: { Args: never; Returns: number }
      cleanup_expired_rate_limits: { Args: never; Returns: number }
      cleanup_old_archive_files: { Args: never; Returns: number }
      cleanup_orphaned_permissions: { Args: never; Returns: number }
      detect_performance_anomalies: {
        Args: never
        Returns: {
          actual_value: number
          anomaly_type: string
          baseline_value: number
          category: string
          deviation_percent: number
          metric_name: string
          severity: string
        }[]
      }
      execute_sql: { Args: { query: string }; Returns: undefined }
      generate_archive_report: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          average_compression_ratio: number
          average_job_duration_ms: number
          completed_jobs: number
          failed_jobs: number
          success_rate: number
          table_name: string
          total_jobs: number
          total_records_archived: number
          total_space_saved_mb: number
        }[]
      }
      generate_scaling_recommendations: {
        Args: never
        Returns: {
          confidence: number
          reason: string
          recommendation_type: string
          target_instances: number
        }[]
      }
      get_archive_eligibility: {
        Args: { retention_days_param?: number; table_name_param: string }
        Returns: {
          condition_sql: string
          eligible_records: number
          estimated_size_mb: number
          oldest_record_date: string
        }[]
      }
      get_system_health: { Args: never; Returns: Json }
      get_user_analytics: { Args: { range_days?: number }; Returns: Json }
      increment_rate_limit: {
        Args: { key_to_update: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      is_superadmin: { Args: never; Returns: boolean }
      promote_user_to_admin: {
        Args: { target_user: string }
        Returns: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }[]
      }
      refresh_performance_dashboard_snapshot: {
        Args: never
        Returns: undefined
      }
      refresh_permission_analytics: { Args: never; Returns: undefined }
      replace_user_permissions: {
        Args: {
          change_reason?: string
          permission_items?: Json
          target_user: string
        }
        Returns: {
          access_granted: boolean
          feature_key: string
          page_key: string
          user_id: string
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_performance_baselines: { Args: never; Returns: number }
      update_user_status: {
        Args: {
          change_reason?: string
          new_status: Database["public"]["Enums"]["user_status"]
          target_user: string
        }
        Returns: {
          deleted_at: string
          id: string
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }[]
      }
      user_role: { Args: { role_check: string }; Returns: boolean }
    }
    Enums: {
      announcement_target_scope: "all_vendors" | "approved_vendors" | "specific"
      bid_status: "submitted" | "under_review" | "accepted" | "rejected"
      cms_page_status: "draft" | "review" | "published" | "archived"
      invitation_status:
        | "pending"
        | "sent"
        | "accepted"
        | "expired"
        | "cancelled"
      pkp_status: "pkp" | "non_pkp"
      project_status:
        | "draft"
        | "open"
        | "in_progress"
        | "completed"
        | "cancelled"
      user_role: "superadmin" | "admin" | "user"
      user_status: "active" | "blocked" | "deleted"
      user_vendor_status: "none" | "pending" | "approved" | "rejected"
      vendor_status: "pending" | "approved" | "rejected"
      vendor_type: "company" | "individual"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      announcement_target_scope: [
        "all_vendors",
        "approved_vendors",
        "specific",
      ],
      bid_status: ["submitted", "under_review", "accepted", "rejected"],
      cms_page_status: ["draft", "review", "published", "archived"],
      invitation_status: [
        "pending",
        "sent",
        "accepted",
        "expired",
        "cancelled",
      ],
      pkp_status: ["pkp", "non_pkp"],
      project_status: [
        "draft",
        "open",
        "in_progress",
        "completed",
        "cancelled",
      ],
      user_role: ["superadmin", "admin", "user"],
      user_status: ["active", "blocked", "deleted"],
      user_vendor_status: ["none", "pending", "approved", "rejected"],
      vendor_status: ["pending", "approved", "rejected"],
      vendor_type: ["company", "individual"],
    },
  },
} as const
