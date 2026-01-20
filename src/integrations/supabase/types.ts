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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      additional_income: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          description: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          description: string
          id?: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          class_date: string
          created_at: string | null
          id: string
          present: boolean
          student_id: string | null
          user_id: string
        }
        Insert: {
          class_date: string
          created_at?: string | null
          id?: string
          present?: boolean
          student_id?: string | null
          user_id?: string
        }
        Update: {
          class_date?: string
          created_at?: string | null
          id?: string
          present?: boolean
          student_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      casual_players: {
        Row: {
          amount: number
          created_at: string | null
          game_date: string
          id: string
          notes: string | null
          paid: boolean
          phone: string | null
          player_name: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          game_date: string
          id?: string
          notes?: string | null
          paid?: boolean
          phone?: string | null
          player_name: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          game_date?: string
          id?: string
          notes?: string | null
          paid?: boolean
          phone?: string | null
          player_name?: string
          user_id?: string
        }
        Relationships: []
      }
      court_expenses: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          payment_date: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          payment_date?: string | null
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          payment_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      extra_expenses: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          description: string | null
          id: string
          payment_date: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          payment_date?: string | null
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          payment_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      gestao_contratos: {
        Row: {
          created_at: string | null
          data_fim: string
          data_inicio: string
          dia_vencimento: number
          id: string
          inquilino_id: string
          possui_garagem: boolean
          reajuste_anual: number
          status: string
          valor_aluguel: number
          valor_condominio: number
          valor_garagem: number
          valor_iptu: number
        }
        Insert: {
          created_at?: string | null
          data_fim: string
          data_inicio: string
          dia_vencimento: number
          id?: string
          inquilino_id: string
          possui_garagem?: boolean
          reajuste_anual: number
          status: string
          valor_aluguel: number
          valor_condominio: number
          valor_garagem?: number
          valor_iptu: number
        }
        Update: {
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          dia_vencimento?: number
          id?: string
          inquilino_id?: string
          possui_garagem?: boolean
          reajuste_anual?: number
          status?: string
          valor_aluguel?: number
          valor_condominio?: number
          valor_garagem?: number
          valor_iptu?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_gestao_contratos_inquilino"
            columns: ["inquilino_id"]
            isOneToOne: false
            referencedRelation: "gestao_inquilinos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gestao_contratos_inquilino_id_fkey"
            columns: ["inquilino_id"]
            isOneToOne: false
            referencedRelation: "gestao_inquilinos"
            referencedColumns: ["id"]
          },
        ]
      }
      gestao_inquilinos: {
        Row: {
          apartamento: string
          avatar: string | null
          cpf: string
          created_at: string | null
          data_entrada: string
          email: string
          id: string
          nome: string
          observacoes: string | null
          telefone: string
          valor_caucao: number | null
        }
        Insert: {
          apartamento: string
          avatar?: string | null
          cpf: string
          created_at?: string | null
          data_entrada: string
          email: string
          id?: string
          nome: string
          observacoes?: string | null
          telefone: string
          valor_caucao?: number | null
        }
        Update: {
          apartamento?: string
          avatar?: string | null
          cpf?: string
          created_at?: string | null
          data_entrada?: string
          email?: string
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string
          valor_caucao?: number | null
        }
        Relationships: []
      }
      gestao_pagamentos: {
        Row: {
          comprovante: string | null
          contrato_id: string | null
          created_at: string | null
          data_pagamento: string | null
          data_vencimento: string
          id: string
          inquilino_id: string
          observacoes: string | null
          status: string
          valor: number
        }
        Insert: {
          comprovante?: string | null
          contrato_id?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento: string
          id?: string
          inquilino_id: string
          observacoes?: string | null
          status: string
          valor: number
        }
        Update: {
          comprovante?: string | null
          contrato_id?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento?: string
          id?: string
          inquilino_id?: string
          observacoes?: string | null
          status?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_gestao_pagamentos_contrato"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "gestao_contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_gestao_pagamentos_inquilino"
            columns: ["inquilino_id"]
            isOneToOne: false
            referencedRelation: "gestao_inquilinos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gestao_pagamentos_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "gestao_contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gestao_pagamentos_inquilino_id_fkey"
            columns: ["inquilino_id"]
            isOneToOne: false
            referencedRelation: "gestao_inquilinos"
            referencedColumns: ["id"]
          },
        ]
      }
      inquilino_acesso: {
        Row: {
          created_at: string | null
          id: string
          inquilino_id: string
          last_login: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          inquilino_id: string
          last_login?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          inquilino_id?: string
          last_login?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquilino_acesso_inquilino_id_fkey"
            columns: ["inquilino_id"]
            isOneToOne: true
            referencedRelation: "gestao_inquilinos"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          due_date: string
          id: string
          payment_date: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          student_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          due_date: string
          id?: string
          payment_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_id?: string | null
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          due_date?: string
          id?: string
          payment_date?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          id: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          active: boolean | null
          birth_date: string | null
          created_at: string | null
          email: string | null
          id: string
          inactive_date: string | null
          inactive_reason: string | null
          name: string
          phone: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          inactive_date?: string | null
          inactive_reason?: string | null
          name: string
          phone?: string | null
          user_id?: string
        }
        Update: {
          active?: boolean | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          inactive_date?: string | null
          inactive_reason?: string | null
          name?: string
          phone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      assign_admin_role: { Args: { admin_email: string }; Returns: undefined }
      assign_tenant_role: { Args: { user_id: string }; Returns: undefined }
      bootstrap_first_admin: { Args: never; Returns: undefined }
      create_tenant_access: {
        Args: { p_email: string; p_inquilino_id: string; p_password: string }
        Returns: Json
      }
      get_first_user_id: { Args: never; Returns: string }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_user: { Args: never; Returns: boolean }
      is_own_user_role: { Args: { role_user_id: string }; Returns: boolean }
      upsert_user_notification_preferences: {
        Args: {
          p_alert_days_before: number
          p_contract_expiry_alerts: boolean
          p_email_notifications: boolean
          p_payment_alerts: boolean
          p_user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "tenant"
      payment_status: "pending" | "paid" | "overdue"
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
      app_role: ["admin", "tenant"],
      payment_status: ["pending", "paid", "overdue"],
    },
  },
} as const
