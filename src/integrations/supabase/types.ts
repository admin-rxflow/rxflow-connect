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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      rx_ai_configs: {
        Row: {
          anthropic_api_key: string | null
          created_at: string | null
          enable_suggestions: boolean | null
          google_api_key: string | null
          guardrails: Json | null
          id: string
          knowledge_base_documents: Json | null
          knowledge_base_enabled: boolean | null
          llm_max_tokens: number | null
          llm_model: string | null
          llm_provider: string | null
          llm_temperature: number | null
          openai_api_key: string | null
          pharmacy_delivery_radius: string | null
          pharmacy_hours: string | null
          pharmacy_name: string | null
          pharmacy_policies: string | null
          suggestion_type: string | null
          system_prompt: string | null
          tenant_id: string
          tone: string | null
          updated_at: string | null
        }
        Insert: {
          anthropic_api_key?: string | null
          created_at?: string | null
          enable_suggestions?: boolean | null
          google_api_key?: string | null
          guardrails?: Json | null
          id?: string
          knowledge_base_documents?: Json | null
          knowledge_base_enabled?: boolean | null
          llm_max_tokens?: number | null
          llm_model?: string | null
          llm_provider?: string | null
          llm_temperature?: number | null
          openai_api_key?: string | null
          pharmacy_delivery_radius?: string | null
          pharmacy_hours?: string | null
          pharmacy_name?: string | null
          pharmacy_policies?: string | null
          suggestion_type?: string | null
          system_prompt?: string | null
          tenant_id: string
          tone?: string | null
          updated_at?: string | null
        }
        Update: {
          anthropic_api_key?: string | null
          created_at?: string | null
          enable_suggestions?: boolean | null
          google_api_key?: string | null
          guardrails?: Json | null
          id?: string
          knowledge_base_documents?: Json | null
          knowledge_base_enabled?: boolean | null
          llm_max_tokens?: number | null
          llm_model?: string | null
          llm_provider?: string | null
          llm_temperature?: number | null
          openai_api_key?: string | null
          pharmacy_delivery_radius?: string | null
          pharmacy_hours?: string | null
          pharmacy_name?: string | null
          pharmacy_policies?: string | null
          suggestion_type?: string | null
          system_prompt?: string | null
          tenant_id?: string
          tone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rx_ai_configs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "rx_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rx_ai_suggestions: {
        Row: {
          confidence_score: number | null
          conversation_id: string | null
          created_at: string | null
          customer_accepted: boolean | null
          id: string
          order_id: string | null
          original_medication: string | null
          revenue_impact: number | null
          shown_to_customer: boolean | null
          suggested_medication: string | null
          suggested_message: string | null
          suggestion_type: string
          tenant_id: string
        }
        Insert: {
          confidence_score?: number | null
          conversation_id?: string | null
          created_at?: string | null
          customer_accepted?: boolean | null
          id?: string
          order_id?: string | null
          original_medication?: string | null
          revenue_impact?: number | null
          shown_to_customer?: boolean | null
          suggested_medication?: string | null
          suggested_message?: string | null
          suggestion_type: string
          tenant_id: string
        }
        Update: {
          confidence_score?: number | null
          conversation_id?: string | null
          created_at?: string | null
          customer_accepted?: boolean | null
          id?: string
          order_id?: string | null
          original_medication?: string | null
          revenue_impact?: number | null
          shown_to_customer?: boolean | null
          suggested_medication?: string | null
          suggested_message?: string | null
          suggestion_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rx_ai_suggestions_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "rx_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rx_ai_suggestions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "rx_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rx_ai_suggestions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "rx_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rx_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          status: string | null
          tenant_id: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          status?: string | null
          tenant_id: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          status?: string | null
          tenant_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rx_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "rx_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rx_conversations: {
        Row: {
          conversation_id: string
          conversation_intent: string | null
          conversation_summary: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string
          ended_at: string | null
          escalated_at: string | null
          escalated_to_human: boolean | null
          flag_reason: string | null
          flagged: boolean | null
          human_agent_id: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          sentiment: string | null
          started_at: string | null
          status: string | null
          tenant_id: string
        }
        Insert: {
          conversation_id?: string
          conversation_intent?: string | null
          conversation_summary?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone: string
          ended_at?: string | null
          escalated_at?: string | null
          escalated_to_human?: boolean | null
          flag_reason?: string | null
          flagged?: boolean | null
          human_agent_id?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          sentiment?: string | null
          started_at?: string | null
          status?: string | null
          tenant_id: string
        }
        Update: {
          conversation_id?: string
          conversation_intent?: string | null
          conversation_summary?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string
          ended_at?: string | null
          escalated_at?: string | null
          escalated_to_human?: boolean | null
          flag_reason?: string | null
          flagged?: boolean | null
          human_agent_id?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number | null
          sentiment?: string | null
          started_at?: string | null
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rx_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "rx_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rx_integrations: {
        Row: {
          auth_credentials: Json | null
          auth_type: string | null
          base_url: string | null
          created_at: string | null
          created_by: string | null
          endpoints: Json | null
          field_mappings: Json | null
          id: string
          is_active: boolean | null
          last_test_error: string | null
          last_test_status: string | null
          last_tested_at: string | null
          name: string
          tenant_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          auth_credentials?: Json | null
          auth_type?: string | null
          base_url?: string | null
          created_at?: string | null
          created_by?: string | null
          endpoints?: Json | null
          field_mappings?: Json | null
          id?: string
          is_active?: boolean | null
          last_test_error?: string | null
          last_test_status?: string | null
          last_tested_at?: string | null
          name: string
          tenant_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          auth_credentials?: Json | null
          auth_type?: string | null
          base_url?: string | null
          created_at?: string | null
          created_by?: string | null
          endpoints?: Json | null
          field_mappings?: Json | null
          id?: string
          is_active?: boolean | null
          last_test_error?: string | null
          last_test_status?: string | null
          last_tested_at?: string | null
          name?: string
          tenant_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rx_integrations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "rx_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rx_inventory: {
        Row: {
          active: boolean | null
          age_restricted: boolean | null
          category: string | null
          created_at: string | null
          current_stock: number | null
          description: string | null
          external_id: string | null
          factory_price: number | null
          id: string
          last_synced_at: string | null
          manufacturer: string | null
          margin: number | null
          maximum_stock: number | null
          medication_code: string
          medication_name: string
          minimum_stock: number | null
          purchase_price: number | null
          requires_prescription: boolean | null
          sync_source: string | null
          tenant_id: string
          unit_measure: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          age_restricted?: boolean | null
          category?: string | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          external_id?: string | null
          factory_price?: number | null
          id?: string
          last_synced_at?: string | null
          manufacturer?: string | null
          margin?: number | null
          maximum_stock?: number | null
          medication_code: string
          medication_name: string
          minimum_stock?: number | null
          purchase_price?: number | null
          requires_prescription?: boolean | null
          sync_source?: string | null
          tenant_id: string
          unit_measure?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          age_restricted?: boolean | null
          category?: string | null
          created_at?: string | null
          current_stock?: number | null
          description?: string | null
          external_id?: string | null
          factory_price?: number | null
          id?: string
          last_synced_at?: string | null
          manufacturer?: string | null
          margin?: number | null
          maximum_stock?: number | null
          medication_code?: string
          medication_name?: string
          minimum_stock?: number | null
          purchase_price?: number | null
          requires_prescription?: boolean | null
          sync_source?: string | null
          tenant_id?: string
          unit_measure?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rx_inventory_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "rx_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rx_inventory_alerts: {
        Row: {
          alert_type: string | null
          created_at: string | null
          current_stock: number | null
          id: string
          inventory_id: string
          medication_name: string | null
          minimum_stock: number | null
          notification_method: string | null
          notified_at: string | null
          notified_to_manager: boolean | null
          reorder_quantity: number | null
          reorder_requested: boolean | null
          reorder_requested_at: string | null
          resolved: boolean | null
          resolved_at: string | null
          tenant_id: string
          urgency: string | null
        }
        Insert: {
          alert_type?: string | null
          created_at?: string | null
          current_stock?: number | null
          id?: string
          inventory_id: string
          medication_name?: string | null
          minimum_stock?: number | null
          notification_method?: string | null
          notified_at?: string | null
          notified_to_manager?: boolean | null
          reorder_quantity?: number | null
          reorder_requested?: boolean | null
          reorder_requested_at?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          tenant_id: string
          urgency?: string | null
        }
        Update: {
          alert_type?: string | null
          created_at?: string | null
          current_stock?: number | null
          id?: string
          inventory_id?: string
          medication_name?: string | null
          minimum_stock?: number | null
          notification_method?: string | null
          notified_at?: string | null
          notified_to_manager?: boolean | null
          reorder_quantity?: number | null
          reorder_requested?: boolean | null
          reorder_requested_at?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          tenant_id?: string
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rx_inventory_alerts_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "rx_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rx_inventory_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "rx_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rx_knowledge_base: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          file_type: string | null
          file_url: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          tags: Json | null
          tenant_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          tags?: Json | null
          tenant_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          tags?: Json | null
          tenant_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rx_knowledge_base_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "rx_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rx_messages: {
        Row: {
          api_responses: Json | null
          confidence_score: number | null
          consulted_systems: Json | null
          conversation_id: string
          created_at: string | null
          entities_extracted: Json | null
          error_message: string | null
          id: string
          intent_detected: string | null
          message_text: string | null
          message_type: string | null
          response_generated_at: string | null
          response_llm_model: string | null
          response_llm_provider: string | null
          response_text: string | null
          response_tokens_used: number | null
          sender_id: string | null
          sender_type: string
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          api_responses?: Json | null
          confidence_score?: number | null
          consulted_systems?: Json | null
          conversation_id: string
          created_at?: string | null
          entities_extracted?: Json | null
          error_message?: string | null
          id?: string
          intent_detected?: string | null
          message_text?: string | null
          message_type?: string | null
          response_generated_at?: string | null
          response_llm_model?: string | null
          response_llm_provider?: string | null
          response_text?: string | null
          response_tokens_used?: number | null
          sender_id?: string | null
          sender_type: string
          status?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          api_responses?: Json | null
          confidence_score?: number | null
          consulted_systems?: Json | null
          conversation_id?: string
          created_at?: string | null
          entities_extracted?: Json | null
          error_message?: string | null
          id?: string
          intent_detected?: string | null
          message_text?: string | null
          message_type?: string | null
          response_generated_at?: string | null
          response_llm_model?: string | null
          response_llm_provider?: string | null
          response_text?: string | null
          response_tokens_used?: number | null
          sender_id?: string | null
          sender_type?: string
          status?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rx_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "rx_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rx_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "rx_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rx_n8n_logs: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          ended_at: string | null
          error_message: string | null
          execution_id: string | null
          execution_time_ms: number | null
          id: string
          input_data: Json | null
          integration_called: string | null
          llm_call_made: boolean | null
          output_data: Json | null
          started_at: string | null
          status: string | null
          tenant_id: string
          workflow_id: string | null
          workflow_name: string | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          ended_at?: string | null
          error_message?: string | null
          execution_id?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          integration_called?: string | null
          llm_call_made?: boolean | null
          output_data?: Json | null
          started_at?: string | null
          status?: string | null
          tenant_id: string
          workflow_id?: string | null
          workflow_name?: string | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          ended_at?: string | null
          error_message?: string | null
          execution_id?: string | null
          execution_time_ms?: number | null
          id?: string
          input_data?: Json | null
          integration_called?: string | null
          llm_call_made?: boolean | null
          output_data?: Json | null
          started_at?: string | null
          status?: string | null
          tenant_id?: string
          workflow_id?: string | null
          workflow_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rx_n8n_logs_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "rx_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rx_n8n_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "rx_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rx_orders: {
        Row: {
          cancelled_at: string | null
          confirmed_at: string | null
          conversation_id: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          delivery_address: string | null
          delivery_city: string | null
          delivery_postal_code: string | null
          delivery_state: string | null
          external_order_id: string | null
          final_value: number | null
          id: string
          items: Json | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          scheduled_delivery_date: string | null
          scheduled_delivery_time: string | null
          shipped_at: string | null
          shipping_cost: number | null
          status: string | null
          sync_error: string | null
          synced_to_external_system: boolean | null
          tax_amount: number | null
          tenant_id: string
          total_items: number | null
          total_value: number | null
        }
        Insert: {
          cancelled_at?: string | null
          confirmed_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_postal_code?: string | null
          delivery_state?: string | null
          external_order_id?: string | null
          final_value?: number | null
          id?: string
          items?: Json | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          scheduled_delivery_date?: string | null
          scheduled_delivery_time?: string | null
          shipped_at?: string | null
          shipping_cost?: number | null
          status?: string | null
          sync_error?: string | null
          synced_to_external_system?: boolean | null
          tax_amount?: number | null
          tenant_id: string
          total_items?: number | null
          total_value?: number | null
        }
        Update: {
          cancelled_at?: string | null
          confirmed_at?: string | null
          conversation_id?: string | null
          created_at?: string | null
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_postal_code?: string | null
          delivery_state?: string | null
          external_order_id?: string | null
          final_value?: number | null
          id?: string
          items?: Json | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          scheduled_delivery_date?: string | null
          scheduled_delivery_time?: string | null
          shipped_at?: string | null
          shipping_cost?: number | null
          status?: string | null
          sync_error?: string | null
          synced_to_external_system?: boolean | null
          tax_amount?: number | null
          tenant_id?: string
          total_items?: number | null
          total_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "rx_orders_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "rx_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rx_orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "rx_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rx_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rx_reports_cache: {
        Row: {
          expires_at: string | null
          generated_at: string | null
          id: string
          period_end: string
          period_start: string
          report_data: Json | null
          report_type: string
          tenant_id: string
        }
        Insert: {
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          period_end: string
          period_start: string
          report_data?: Json | null
          report_type: string
          tenant_id: string
        }
        Update: {
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          period_end?: string
          period_start?: string
          report_data?: Json | null
          report_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rx_reports_cache_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "rx_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rx_tenant_users: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          permission_flags: Json | null
          role: string
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permission_flags?: Json | null
          role: string
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          permission_flags?: Json | null
          role?: string
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rx_tenant_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "rx_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rx_tenants: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          created_at: string | null
          created_by: string | null
          custom_llm_config: Json | null
          deleted_at: string | null
          email: string
          enable_ai_agent: boolean | null
          enable_delivery_scheduling: boolean | null
          enable_inventory_management: boolean | null
          enable_reports: boolean | null
          id: string
          max_concurrent_conversations: number | null
          monthly_conversation_limit: number | null
          monthly_conversations_used: number | null
          name: string
          notes: string | null
          phone: string | null
          plan: string | null
          postal_code: string | null
          state: string | null
          status: string | null
          updated_at: string | null
          whatsapp_business_phone_id: string | null
          whatsapp_business_token: string | null
          whatsapp_webhook_verify_token: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_llm_config?: Json | null
          deleted_at?: string | null
          email: string
          enable_ai_agent?: boolean | null
          enable_delivery_scheduling?: boolean | null
          enable_inventory_management?: boolean | null
          enable_reports?: boolean | null
          id?: string
          max_concurrent_conversations?: number | null
          monthly_conversation_limit?: number | null
          monthly_conversations_used?: number | null
          name: string
          notes?: string | null
          phone?: string | null
          plan?: string | null
          postal_code?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          whatsapp_business_phone_id?: string | null
          whatsapp_business_token?: string | null
          whatsapp_webhook_verify_token?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_llm_config?: Json | null
          deleted_at?: string | null
          email?: string
          enable_ai_agent?: boolean | null
          enable_delivery_scheduling?: boolean | null
          enable_inventory_management?: boolean | null
          enable_reports?: boolean | null
          id?: string
          max_concurrent_conversations?: number | null
          monthly_conversation_limit?: number | null
          monthly_conversations_used?: number | null
          name?: string
          notes?: string | null
          phone?: string | null
          plan?: string | null
          postal_code?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string | null
          whatsapp_business_phone_id?: string | null
          whatsapp_business_token?: string | null
          whatsapp_webhook_verify_token?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      rx_add_message_to_conversation: {
        Args: {
          p_conversation_id: string
          p_message_text: string
          p_sender_id?: string
          p_sender_type: string
          p_tenant_id: string
        }
        Returns: {
          api_responses: Json | null
          confidence_score: number | null
          consulted_systems: Json | null
          conversation_id: string
          created_at: string | null
          entities_extracted: Json | null
          error_message: string | null
          id: string
          intent_detected: string | null
          message_text: string | null
          message_type: string | null
          response_generated_at: string | null
          response_llm_model: string | null
          response_llm_provider: string | null
          response_text: string | null
          response_tokens_used: number | null
          sender_id: string | null
          sender_type: string
          status: string | null
          tenant_id: string
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "rx_messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rx_create_conversation: {
        Args: {
          p_customer_name?: string
          p_customer_phone: string
          p_tenant_id: string
        }
        Returns: {
          conversation_id: string
          conversation_intent: string | null
          conversation_summary: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string
          ended_at: string | null
          escalated_at: string | null
          escalated_to_human: boolean | null
          flag_reason: string | null
          flagged: boolean | null
          human_agent_id: string | null
          id: string
          last_message_at: string | null
          message_count: number | null
          sentiment: string | null
          started_at: string | null
          status: string | null
          tenant_id: string
        }
        SetofOptions: {
          from: "*"
          to: "rx_conversations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rx_create_order: {
        Args: {
          p_conversation_id: string
          p_customer_name: string
          p_customer_phone: string
          p_delivery_address?: string
          p_items: Json
          p_payment_method?: string
          p_tenant_id: string
        }
        Returns: {
          cancelled_at: string | null
          confirmed_at: string | null
          conversation_id: string | null
          created_at: string | null
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          delivered_at: string | null
          delivery_address: string | null
          delivery_city: string | null
          delivery_postal_code: string | null
          delivery_state: string | null
          external_order_id: string | null
          final_value: number | null
          id: string
          items: Json | null
          order_number: string
          payment_method: string | null
          payment_status: string | null
          scheduled_delivery_date: string | null
          scheduled_delivery_time: string | null
          shipped_at: string | null
          shipping_cost: number | null
          status: string | null
          sync_error: string | null
          synced_to_external_system: boolean | null
          tax_amount: number | null
          tenant_id: string
          total_items: number | null
          total_value: number | null
        }
        SetofOptions: {
          from: "*"
          to: "rx_orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rx_get_conversation_report: {
        Args: {
          p_end_date?: string
          p_start_date?: string
          p_tenant_id: string
        }
        Returns: Json
      }
      rx_get_inventory_report: { Args: { p_tenant_id: string }; Returns: Json }
      rx_get_saas_kpis: {
        Args: {
          p_end_date?: string
          p_start_date?: string
          p_tenant_id: string
        }
        Returns: Json
      }
      rx_get_sales_report: {
        Args: {
          p_end_date?: string
          p_start_date?: string
          p_tenant_id: string
        }
        Returns: Json
      }
      rx_get_user_tenant_id: { Args: never; Returns: string }
      rx_register_inventory_alert: {
        Args: {
          p_alert_type?: string
          p_inventory_id: string
          p_tenant_id: string
        }
        Returns: {
          alert_type: string | null
          created_at: string | null
          current_stock: number | null
          id: string
          inventory_id: string
          medication_name: string | null
          minimum_stock: number | null
          notification_method: string | null
          notified_at: string | null
          notified_to_manager: boolean | null
          reorder_quantity: number | null
          reorder_requested: boolean | null
          reorder_requested_at: string | null
          resolved: boolean | null
          resolved_at: string | null
          tenant_id: string
          urgency: string | null
        }
        SetofOptions: {
          from: "*"
          to: "rx_inventory_alerts"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      rx_update_inventory_after_sale: {
        Args: {
          p_medication_code: string
          p_quantity: number
          p_tenant_id: string
        }
        Returns: {
          active: boolean | null
          age_restricted: boolean | null
          category: string | null
          created_at: string | null
          current_stock: number | null
          description: string | null
          external_id: string | null
          id: string
          last_synced_at: string | null
          maximum_stock: number | null
          medication_code: string
          medication_name: string
          minimum_stock: number | null
          requires_prescription: boolean | null
          sync_source: string | null
          tenant_id: string
          unit_price: number | null
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "rx_inventory"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
