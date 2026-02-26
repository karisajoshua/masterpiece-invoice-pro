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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_messages: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_messages_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "field_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      client_documents: {
        Row: {
          admin_notes: string | null
          ai_analyzed_at: string | null
          ai_confidence: number | null
          ai_reasoning: string | null
          ai_suggested_type: string | null
          client_id: string
          created_at: string
          document_name: string
          document_type: string
          document_url: string
          file_size: number
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by_admin_id: string | null
          status: Database["public"]["Enums"]["document_status"]
          submitted_by_user_id: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          ai_analyzed_at?: string | null
          ai_confidence?: number | null
          ai_reasoning?: string | null
          ai_suggested_type?: string | null
          client_id: string
          created_at?: string
          document_name: string
          document_type: string
          document_url: string
          file_size: number
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by_admin_id?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          submitted_by_user_id: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          ai_analyzed_at?: string | null
          ai_confidence?: number | null
          ai_reasoning?: string | null
          ai_suggested_type?: string | null
          client_id?: string
          created_at?: string
          document_name?: string
          document_type?: string
          document_url?: string
          file_size?: number
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by_admin_id?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          submitted_by_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          agent_id: string | null
          approval_status: Database["public"]["Enums"]["approval_status"] | null
          billing_address: string
          company_name: string
          company_pin: string
          contact_person: string | null
          created_at: string
          email: string
          id: string
          industry: string | null
          is_active: boolean | null
          phone_primary: string
          phone_secondary: string | null
          physical_address: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          billing_address: string
          company_name: string
          company_pin: string
          contact_person?: string | null
          created_at?: string
          email: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          phone_primary: string
          phone_secondary?: string | null
          physical_address?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          approval_status?:
            | Database["public"]["Enums"]["approval_status"]
            | null
          billing_address?: string
          company_name?: string
          company_pin?: string
          contact_person?: string | null
          created_at?: string
          email?: string
          id?: string
          industry?: string | null
          is_active?: boolean | null
          phone_primary?: string
          phone_secondary?: string | null
          physical_address?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "field_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      company_settings: {
        Row: {
          address: string | null
          company_name: string
          company_pin: string
          created_at: string
          currency_label: string
          default_vat_percent: number
          email: string | null
          id: string
          invoice_prefix: string
          logo_url: string | null
          payment_details: string | null
          payment_terms_days: number
          payment_terms_text: string | null
          phone_1: string | null
          phone_2: string | null
          phone_3: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          company_name?: string
          company_pin?: string
          created_at?: string
          currency_label?: string
          default_vat_percent?: number
          email?: string | null
          id?: string
          invoice_prefix?: string
          logo_url?: string | null
          payment_details?: string | null
          payment_terms_days?: number
          payment_terms_text?: string | null
          phone_1?: string | null
          phone_2?: string | null
          phone_3?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          company_name?: string
          company_pin?: string
          created_at?: string
          currency_label?: string
          default_vat_percent?: number
          email?: string | null
          id?: string
          invoice_prefix?: string
          logo_url?: string | null
          payment_details?: string | null
          payment_terms_days?: number
          payment_terms_text?: string | null
          phone_1?: string | null
          phone_2?: string | null
          phone_3?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      field_agents: {
        Row: {
          agent_code: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string
          region: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_code: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          phone: string
          region?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_code?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string
          region?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          line_total: number
          qty: number
          sort_order: number
          unit_price: number
          vat_percent: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          line_total?: number
          qty: number
          sort_order?: number
          unit_price: number
          vat_percent?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          line_total?: number
          qty?: number
          sort_order?: number
          unit_price?: number
          vat_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          balance_due: number | null
          billing_address: string | null
          client_email: string | null
          client_id: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          currency_label: string
          date_issued: string
          grand_total: number
          id: string
          invoice_no: string
          notes: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          pdf_url: string | null
          reference: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number
          total_paid: number | null
          updated_at: string
          vat_total: number
        }
        Insert: {
          balance_due?: number | null
          billing_address?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          currency_label?: string
          date_issued?: string
          grand_total?: number
          id?: string
          invoice_no: string
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pdf_url?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          total_paid?: number | null
          updated_at?: string
          vat_total?: number
        }
        Update: {
          balance_due?: number | null
          billing_address?: string | null
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          currency_label?: string
          date_issued?: string
          grand_total?: number
          id?: string
          invoice_no?: string
          notes?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          pdf_url?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number
          total_paid?: number | null
          updated_at?: string
          vat_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_paid: number
          approval_notes: string | null
          approved_at: string | null
          approved_by_admin_id: string | null
          created_at: string
          id: string
          invoice_id: string
          payment_date: string
          payment_method: string
          payment_reference: string
          proof_of_payment_url: string | null
          status: string | null
          submitted_by_client_id: string | null
          updated_at: string
        }
        Insert: {
          amount_paid: number
          approval_notes?: string | null
          approved_at?: string | null
          approved_by_admin_id?: string | null
          created_at?: string
          id?: string
          invoice_id: string
          payment_date: string
          payment_method: string
          payment_reference: string
          proof_of_payment_url?: string | null
          status?: string | null
          submitted_by_client_id?: string | null
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          approval_notes?: string | null
          approved_at?: string | null
          approved_by_admin_id?: string | null
          created_at?: string
          id?: string
          invoice_id?: string
          payment_date?: string
          payment_method?: string
          payment_reference?: string
          proof_of_payment_url?: string | null
          status?: string | null
          submitted_by_client_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_submitted_by_client_id_fkey"
            columns: ["submitted_by_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          default_unit_price: number
          default_vat_percent: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          product_code: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          default_unit_price: number
          default_vat_percent?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          product_code: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          default_unit_price?: number
          default_vat_percent?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          product_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: { Args: never; Returns: string }
      get_agent_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_overdue_invoices: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user" | "client" | "agent"
      approval_status: "pending" | "approved" | "rejected"
      document_status: "pending" | "reviewed" | "approved" | "rejected"
      invoice_status: "paid" | "unpaid" | "overdue"
      payment_status:
        | "not_started"
        | "partial"
        | "paid_pending_approval"
        | "fully_paid"
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
      app_role: ["admin", "user", "client", "agent"],
      approval_status: ["pending", "approved", "rejected"],
      document_status: ["pending", "reviewed", "approved", "rejected"],
      invoice_status: ["paid", "unpaid", "overdue"],
      payment_status: [
        "not_started",
        "partial",
        "paid_pending_approval",
        "fully_paid",
      ],
    },
  },
} as const
