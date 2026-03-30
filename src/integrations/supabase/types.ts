export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      rx_tenants: {
        Row: {
          id: string
          name: string
          cnpj: string | null
          email: string
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          plan: string
          monthly_conversation_limit: number
          monthly_conversations_used: number
          max_concurrent_conversations: number
          enable_ai_agent: boolean
          enable_inventory_management: boolean
          enable_delivery_scheduling: boolean
          enable_reports: boolean
          custom_llm_config: Json
          whatsapp_business_token: string | null
          whatsapp_business_phone_id: string | null
          whatsapp_webhook_verify_token: string | null
          status: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          created_by: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          name: string
          cnpj?: string | null
          email: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          plan?: string
          monthly_conversation_limit?: number
          monthly_conversations_used?: number
          max_concurrent_conversations?: number
          enable_ai_agent?: boolean
          enable_inventory_management?: boolean
          enable_delivery_scheduling?: boolean
          enable_reports?: boolean
          custom_llm_config?: Json
          whatsapp_business_token?: string | null
          whatsapp_business_phone_id?: string | null
          whatsapp_webhook_verify_token?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          created_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          name?: string
          cnpj?: string | null
          email?: string
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          plan?: string
          monthly_conversation_limit?: number
          monthly_conversations_used?: number
          max_concurrent_conversations?: number
          enable_ai_agent?: boolean
          enable_inventory_management?: boolean
          enable_delivery_scheduling?: boolean
          enable_reports?: boolean
          custom_llm_config?: Json
          whatsapp_business_token?: string | null
          whatsapp_business_phone_id?: string | null
          whatsapp_webhook_verify_token?: string | null
          status?: string
          updated_at?: string
          deleted_at?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      rx_tenant_users: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          role: string
          permission_flags: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          role: string
          permission_flags?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          role?: string
          permission_flags?: Json
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      rx_integrations: {
        Row: {
          id: string
          tenant_id: string
          name: string
          type: string
          base_url: string | null
          auth_type: string | null
          auth_credentials: Json
          endpoints: Json
          field_mappings: Json
          is_active: boolean
          last_tested_at: string | null
          last_test_status: string | null
          last_test_error: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          type: string
          base_url?: string | null
          auth_type?: string | null
          auth_credentials?: Json
          endpoints?: Json
          field_mappings?: Json
          is_active?: boolean
          last_tested_at?: string | null
          last_test_status?: string | null
          last_test_error?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          name?: string
          type?: string
          base_url?: string | null
          auth_type?: string | null
          auth_credentials?: Json
          endpoints?: Json
          field_mappings?: Json
          is_active?: boolean
          last_tested_at?: string | null
          last_test_status?: string | null
          last_test_error?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rx_ai_configs: {
        Row: {
          id: string
          tenant_id: string
          llm_provider: string
          llm_model: string
          llm_temperature: number
          llm_max_tokens: number
          openai_api_key: string | null
          anthropic_api_key: string | null
          google_api_key: string | null
          system_prompt: string | null
          guardrails: Json
          knowledge_base_enabled: boolean
          knowledge_base_documents: Json
          tone: string
          enable_suggestions: boolean
          suggestion_type: string
          pharmacy_name: string | null
          pharmacy_hours: string | null
          pharmacy_delivery_radius: string | null
          pharmacy_policies: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          llm_provider?: string
          llm_model?: string
          llm_temperature?: number
          llm_max_tokens?: number
          openai_api_key?: string | null
          anthropic_api_key?: string | null
          google_api_key?: string | null
          system_prompt?: string | null
          guardrails?: Json
          knowledge_base_enabled?: boolean
          knowledge_base_documents?: Json
          tone?: string
          enable_suggestions?: boolean
          suggestion_type?: string
          pharmacy_name?: string | null
          pharmacy_hours?: string | null
          pharmacy_delivery_radius?: string | null
          pharmacy_policies?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          llm_provider?: string
          llm_model?: string
          llm_temperature?: number
          llm_max_tokens?: number
          openai_api_key?: string | null
          anthropic_api_key?: string | null
          google_api_key?: string | null
          system_prompt?: string | null
          guardrails?: Json
          knowledge_base_enabled?: boolean
          knowledge_base_documents?: Json
          tone?: string
          enable_suggestions?: boolean
          suggestion_type?: string
          pharmacy_name?: string | null
          pharmacy_hours?: string | null
          pharmacy_delivery_radius?: string | null
          pharmacy_policies?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rx_conversations: {
        Row: {
          id: string
          tenant_id: string
          conversation_id: string
          customer_phone: string
          customer_name: string | null
          customer_email: string | null
          status: string
          escalated_to_human: boolean
          escalated_at: string | null
          human_agent_id: string | null
          conversation_summary: string | null
          conversation_intent: string | null
          sentiment: string | null
          message_count: number
          started_at: string
          ended_at: string | null
          last_message_at: string
          flagged: boolean
          flag_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          conversation_id?: string
          customer_phone: string
          customer_name?: string | null
          customer_email?: string | null
          status?: string
          escalated_to_human?: boolean
          escalated_at?: string | null
          human_agent_id?: string | null
          conversation_summary?: string | null
          conversation_intent?: string | null
          sentiment?: string | null
          message_count?: number
          started_at?: string
          ended_at?: string | null
          last_message_at?: string
          flagged?: boolean
          flag_reason?: string | null
          created_at?: string
        }
        Update: {
          status?: string
          escalated_to_human?: boolean
          escalated_at?: string | null
          human_agent_id?: string | null
          conversation_summary?: string | null
          conversation_intent?: string | null
          sentiment?: string | null
          message_count?: number
          ended_at?: string | null
          last_message_at?: string
          flagged?: boolean
          flag_reason?: string | null
        }
        Relationships: []
      }
      rx_messages: {
        Row: {
          id: string
          conversation_id: string
          tenant_id: string
          message_text: string | null
          message_type: string
          sender_type: string
          sender_id: string | null
          intent_detected: string | null
          entities_extracted: Json
          confidence_score: number | null
          response_text: string | null
          response_llm_provider: string | null
          response_llm_model: string | null
          response_generated_at: string | null
          response_tokens_used: number | null
          consulted_systems: Json
          api_responses: Json
          status: string
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          tenant_id: string
          message_text?: string | null
          message_type?: string
          sender_type: string
          sender_id?: string | null
          intent_detected?: string | null
          entities_extracted?: Json
          confidence_score?: number | null
          response_text?: string | null
          response_llm_provider?: string | null
          response_llm_model?: string | null
          response_generated_at?: string | null
          response_tokens_used?: number | null
          consulted_systems?: Json
          api_responses?: Json
          status?: string
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          message_text?: string | null
          intent_detected?: string | null
          entities_extracted?: Json
          confidence_score?: number | null
          response_text?: string | null
          status?: string
          error_message?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rx_orders: {
        Row: {
          id: string
          tenant_id: string
          conversation_id: string | null
          order_number: string
          customer_phone: string | null
          customer_name: string | null
          customer_email: string | null
          items: Json
          total_items: number
          total_value: number
          shipping_cost: number
          tax_amount: number
          final_value: number
          delivery_address: string | null
          delivery_city: string | null
          delivery_state: string | null
          delivery_postal_code: string | null
          scheduled_delivery_date: string | null
          scheduled_delivery_time: string | null
          status: string
          payment_status: string
          payment_method: string | null
          external_order_id: string | null
          synced_to_external_system: boolean
          sync_error: string | null
          created_at: string
          confirmed_at: string | null
          shipped_at: string | null
          delivered_at: string | null
          cancelled_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          conversation_id?: string | null
          order_number?: string
          customer_phone?: string | null
          customer_name?: string | null
          customer_email?: string | null
          items?: Json
          total_items?: number
          total_value?: number
          shipping_cost?: number
          tax_amount?: number
          final_value?: number
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_state?: string | null
          delivery_postal_code?: string | null
          scheduled_delivery_date?: string | null
          scheduled_delivery_time?: string | null
          status?: string
          payment_status?: string
          payment_method?: string | null
          external_order_id?: string | null
          synced_to_external_system?: boolean
          sync_error?: string | null
          created_at?: string
        }
        Update: {
          status?: string
          payment_status?: string
          payment_method?: string | null
          delivery_address?: string | null
          scheduled_delivery_date?: string | null
          scheduled_delivery_time?: string | null
          synced_to_external_system?: boolean
          sync_error?: string | null
        }
        Relationships: []
      }
      rx_inventory: {
        Row: {
          id: string
          tenant_id: string
          medication_code: string
          medication_name: string
          description: string | null
          category: string | null
          current_stock: number
          minimum_stock: number
          maximum_stock: number
          unit_price: number
          active: boolean
          requires_prescription: boolean
          age_restricted: boolean
          last_synced_at: string | null
          sync_source: string | null
          external_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          medication_code: string
          medication_name: string
          description?: string | null
          category?: string | null
          current_stock?: number
          minimum_stock?: number
          maximum_stock?: number
          unit_price?: number
          active?: boolean
          requires_prescription?: boolean
          age_restricted?: boolean
          last_synced_at?: string | null
          sync_source?: string | null
          external_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          medication_name?: string
          description?: string | null
          category?: string | null
          current_stock?: number
          minimum_stock?: number
          maximum_stock?: number
          unit_price?: number
          active?: boolean
          requires_prescription?: boolean
          age_restricted?: boolean
          last_synced_at?: string | null
          sync_source?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rx_inventory_alerts: {
        Row: {
          id: string
          tenant_id: string
          inventory_id: string
          medication_name: string | null
          current_stock: number | null
          minimum_stock: number | null
          alert_type: string
          urgency: string
          notified_to_manager: boolean
          notified_at: string | null
          notification_method: string | null
          reorder_requested: boolean
          reorder_quantity: number | null
          reorder_requested_at: string | null
          resolved: boolean
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          inventory_id: string
          medication_name?: string | null
          current_stock?: number | null
          minimum_stock?: number | null
          alert_type?: string
          urgency?: string
          notified_to_manager?: boolean
          notified_at?: string | null
          notification_method?: string | null
          reorder_requested?: boolean
          reorder_quantity?: number | null
          reorder_requested_at?: string | null
          resolved?: boolean
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          notified_to_manager?: boolean
          notified_at?: string | null
          notification_method?: string | null
          reorder_requested?: boolean
          reorder_quantity?: number | null
          reorder_requested_at?: string | null
          resolved?: boolean
          resolved_at?: string | null
        }
        Relationships: []
      }
      rx_knowledge_base: {
        Row: {
          id: string
          tenant_id: string
          title: string
          category: string | null
          content: string | null
          file_url: string | null
          file_type: string | null
          tags: Json
          is_public: boolean
          is_active: boolean
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          title: string
          category?: string | null
          content?: string | null
          file_url?: string | null
          file_type?: string | null
          tags?: Json
          is_public?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          title?: string
          category?: string | null
          content?: string | null
          file_url?: string | null
          tags?: Json
          is_public?: boolean
          is_active?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      rx_n8n_logs: {
        Row: {
          id: string
          tenant_id: string
          conversation_id: string | null
          workflow_id: string | null
          workflow_name: string | null
          execution_id: string | null
          status: string | null
          error_message: string | null
          started_at: string | null
          ended_at: string | null
          execution_time_ms: number | null
          input_data: Json
          output_data: Json
          integration_called: string | null
          llm_call_made: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          conversation_id?: string | null
          workflow_id?: string | null
          workflow_name?: string | null
          execution_id?: string | null
          status?: string | null
          error_message?: string | null
          started_at?: string | null
          ended_at?: string | null
          execution_time_ms?: number | null
          input_data?: Json
          output_data?: Json
          integration_called?: string | null
          llm_call_made?: boolean
          created_at?: string
        }
        Update: {
          status?: string | null
          error_message?: string | null
          ended_at?: string | null
          execution_time_ms?: number | null
          output_data?: Json
        }
        Relationships: []
      }
      rx_reports_cache: {
        Row: {
          id: string
          tenant_id: string
          report_type: string
          period_start: string
          period_end: string
          report_data: Json
          generated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          report_type: string
          period_start: string
          period_end: string
          report_data?: Json
          generated_at?: string
          expires_at?: string | null
        }
        Update: {
          report_data?: Json
          expires_at?: string | null
        }
        Relationships: []
      }
      rx_audit_log: {
        Row: {
          id: string
          tenant_id: string
          action: string
          resource_type: string
          resource_id: string | null
          actor_id: string | null
          actor_email: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          status: string
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          action: string
          resource_type: string
          resource_id?: string | null
          actor_id?: string | null
          actor_email?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          status?: string
          error_message?: string | null
          created_at?: string
        }
        Update: {
          status?: string
          error_message?: string | null
        }
        Relationships: []
      }
      rx_ai_suggestions: {
        Row: {
          id: string
          tenant_id: string
          conversation_id: string | null
          order_id: string | null
          suggestion_type: string
          original_medication: string | null
          suggested_medication: string | null
          suggested_message: string | null
          confidence_score: number
          shown_to_customer: boolean
          customer_accepted: boolean | null
          revenue_impact: number | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          conversation_id?: string | null
          order_id?: string | null
          suggestion_type: string
          original_medication?: string | null
          suggested_medication?: string | null
          suggested_message?: string | null
          confidence_score?: number
          shown_to_customer?: boolean
          customer_accepted?: boolean | null
          revenue_impact?: number | null
          created_at?: string
        }
        Update: {
          shown_to_customer?: boolean
          customer_accepted?: boolean | null
          revenue_impact?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      rx_create_conversation: {
        Args: {
          p_tenant_id: string
          p_customer_phone: string
          p_customer_name?: string
        }
        Returns: Database['public']['Tables']['rx_conversations']['Row']
      }
      rx_add_message_to_conversation: {
        Args: {
          p_conversation_id: string
          p_tenant_id: string
          p_message_text: string
          p_sender_type: string
          p_sender_id?: string
        }
        Returns: Database['public']['Tables']['rx_messages']['Row']
      }
      rx_get_conversation_report: {
        Args: {
          p_tenant_id: string
          p_start_date?: string
          p_end_date?: string
        }
        Returns: Json
      }
      rx_get_sales_report: {
        Args: {
          p_tenant_id: string
          p_start_date?: string
          p_end_date?: string
        }
        Returns: Json
      }
      rx_get_inventory_report: {
        Args: {
          p_tenant_id: string
        }
        Returns: Json
      }
      rx_get_saas_kpis: {
        Args: {
          p_tenant_id: string
          p_start_date?: string
          p_end_date?: string
        }
        Returns: Json
      }
      rx_get_user_tenant_id: {
        Args: Record<string, never>
        Returns: string
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
