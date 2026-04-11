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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      configurations: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      content_pages: {
        Row: {
          content_ar: string
          content_en: string
          created_at: string | null
          id: string
          is_active: boolean | null
          slug: string
          title_ar: string
          title_en: string
          updated_at: string | null
        }
        Insert: {
          content_ar: string
          content_en: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          slug: string
          title_ar: string
          title_en: string
          updated_at?: string | null
        }
        Update: {
          content_ar?: string
          content_en?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          slug?: string
          title_ar?: string
          title_en?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer_ar: string
          answer_en: string
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          question_ar: string
          question_en: string
        }
        Insert: {
          answer_ar: string
          answer_en: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question_ar: string
          question_en: string
        }
        Update: {
          answer_ar?: string
          answer_en?: string
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          question_ar?: string
          question_en?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          order_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          order_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          order_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          area: number | null
          created_at: string | null
          delivery_address: string | null
          duration_months: number | null
          id: string
          measurement_data: Json | null
          notes: string | null
          pickup_address: string | null
          product_images: string[] | null
          product_name: string | null
          product_type: string | null
          quantity: number | null
          status: string | null
          storage_type_id: string | null
          total_price: number | null
          updated_at: string | null
          user_id: string | null
          weight: string | null
        }
        Insert: {
          area?: number | null
          created_at?: string | null
          delivery_address?: string | null
          duration_months?: number | null
          id?: string
          measurement_data?: Json | null
          notes?: string | null
          pickup_address?: string | null
          product_images?: string[] | null
          product_name?: string | null
          product_type?: string | null
          quantity?: number | null
          status?: string | null
          storage_type_id?: string | null
          total_price?: number | null
          updated_at?: string | null
          user_id?: string | null
          weight?: string | null
        }
        Update: {
          area?: number | null
          created_at?: string | null
          delivery_address?: string | null
          duration_months?: number | null
          id?: string
          measurement_data?: Json | null
          notes?: string | null
          pickup_address?: string | null
          product_images?: string[] | null
          product_name?: string | null
          product_type?: string | null
          quantity?: number | null
          status?: string | null
          storage_type_id?: string | null
          total_price?: number | null
          updated_at?: string | null
          user_id?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_storage_type_id_fkey"
            columns: ["storage_type_id"]
            isOneToOne: false
            referencedRelation: "storage_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_types: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name_ar: string
          name_en: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name_ar: string
          name_en: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string
          name_en?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          commercial_reg: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          lockout_until: string | null
          login_attempts: number | null
          metadata: Json | null
          nationality: string | null
          phone: string | null
          role: string | null
          updated_at: string | null
          user_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          commercial_reg?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          lockout_until?: string | null
          login_attempts?: number | null
          metadata?: Json | null
          nationality?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          commercial_reg?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          lockout_until?: string | null
          login_attempts?: number | null
          metadata?: Json | null
          nationality?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          price: number
          title_ar: string
          title_en: string
        }
        Insert: {
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          price?: number
          title_ar: string
          title_en: string
        }
        Update: {
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          price?: number
          title_ar?: string
          title_en?: string
        }
        Relationships: []
      }
      storage_spaces: {
        Row: {
          capacity: number
          capacity_units: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name_ar: string
          name_en: string
          status: string | null
          storage_type_id: string | null
          unit: string | null
          used_capacity: number | null
          used_units: number | null
        }
        Insert: {
          capacity: number
          capacity_units?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name_ar: string
          name_en: string
          status?: string | null
          storage_type_id?: string | null
          unit?: string | null
          used_capacity?: number | null
          used_units?: number | null
        }
        Update: {
          capacity?: number
          capacity_units?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name_ar?: string
          name_en?: string
          status?: string | null
          storage_type_id?: string | null
          unit?: string | null
          used_capacity?: number | null
          used_units?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "storage_spaces_storage_type_id_fkey"
            columns: ["storage_type_id"]
            isOneToOne: false
            referencedRelation: "storage_types"
            referencedColumns: ["id"]
          },
        ]
      }
      storage_types: {
        Row: {
          billing_unit: string | null
          created_at: string | null
          description_ar: string | null
          description_en: string | null
          icon_name: string | null
          id: string
          measurement_config: Json | null
          min_area: number | null
          min_duration_months: number | null
          name_ar: string
          name_en: string
          price_per_sqm_month: number
          pricing_factors: string[] | null
          slug: string | null
          unit_name_ar: string | null
          unit_name_en: string | null
          use_cases: string[] | null
        }
        Insert: {
          billing_unit?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon_name?: string | null
          id?: string
          measurement_config?: Json | null
          min_area?: number | null
          min_duration_months?: number | null
          name_ar: string
          name_en: string
          price_per_sqm_month: number
          pricing_factors?: string[] | null
          slug?: string | null
          unit_name_ar?: string | null
          unit_name_en?: string | null
          use_cases?: string[] | null
        }
        Update: {
          billing_unit?: string | null
          created_at?: string | null
          description_ar?: string | null
          description_en?: string | null
          icon_name?: string | null
          id?: string
          measurement_config?: Json | null
          min_area?: number | null
          min_duration_months?: number | null
          name_ar?: string
          name_en?: string
          price_per_sqm_month?: number
          pricing_factors?: string[] | null
          slug?: string | null
          unit_name_ar?: string | null
          unit_name_en?: string | null
          use_cases?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_lockout: { Args: { user_email: string }; Returns: string }
      increment_failed_login: {
        Args: { user_email: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      reset_failed_login: { Args: { user_id: string }; Returns: undefined }
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
