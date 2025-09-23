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
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          current_routine: string | null
          customer_id: string | null
          customer_name: string
          customer_photo_url: string | null
          desired_results: string | null
          id: string
          notes: string | null
          service: string
          skin_problems: string | null
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          current_routine?: string | null
          customer_id?: string | null
          customer_name: string
          customer_photo_url?: string | null
          desired_results?: string | null
          id?: string
          notes?: string | null
          service: string
          skin_problems?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          current_routine?: string | null
          customer_id?: string | null
          customer_name?: string
          customer_photo_url?: string | null
          desired_results?: string | null
          id?: string
          notes?: string | null
          service?: string
          skin_problems?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          avatar: string | null
          created_at: string
          customer_notes: string | null
          email: string
          favorite_products: string[] | null
          id: string
          last_interactions_summary: string | null
          last_purchase: string | null
          last_scan_date: string | null
          last_scan_summary: string | null
          location: string | null
          name: string
          phone: string | null
          rating: number | null
          skin_type: string | null
          total_scans: number | null
          total_spent: number | null
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          customer_notes?: string | null
          email: string
          favorite_products?: string[] | null
          id?: string
          last_interactions_summary?: string | null
          last_purchase?: string | null
          last_scan_date?: string | null
          last_scan_summary?: string | null
          location?: string | null
          name: string
          phone?: string | null
          rating?: number | null
          skin_type?: string | null
          total_scans?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          customer_notes?: string | null
          email?: string
          favorite_products?: string[] | null
          id?: string
          last_interactions_summary?: string | null
          last_purchase?: string | null
          last_scan_date?: string | null
          last_scan_summary?: string | null
          location?: string | null
          name?: string
          phone?: string | null
          rating?: number | null
          skin_type?: string | null
          total_scans?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      historic_scans: {
        Row: {
          acne: number | null
          blackhead: number | null
          client_email: string
          crows_feet: number | null
          customer_id: string | null
          dark_circles: number | null
          date_scan: string | null
          forehead_wrinkles: number | null
          glabellar_lines: number | null
          global_score: number | null
          id: string
          large_pore: number | null
          medium_pore: number | null
          nasolabial_folds: number | null
          perioral_lines: number | null
          pigment: number | null
          pore: number | null
          pore_diagnostic_image: string | null
          sensitivity: number | null
          small_pore: number | null
          spot: number | null
          under_eye_wrinkles: number | null
          wrinkle: number | null
          wrinkle_diagnostic_image: string | null
        }
        Insert: {
          acne?: number | null
          blackhead?: number | null
          client_email: string
          crows_feet?: number | null
          customer_id?: string | null
          dark_circles?: number | null
          date_scan?: string | null
          forehead_wrinkles?: number | null
          glabellar_lines?: number | null
          global_score?: number | null
          id?: string
          large_pore?: number | null
          medium_pore?: number | null
          nasolabial_folds?: number | null
          perioral_lines?: number | null
          pigment?: number | null
          pore?: number | null
          pore_diagnostic_image?: string | null
          sensitivity?: number | null
          small_pore?: number | null
          spot?: number | null
          under_eye_wrinkles?: number | null
          wrinkle?: number | null
          wrinkle_diagnostic_image?: string | null
        }
        Update: {
          acne?: number | null
          blackhead?: number | null
          client_email?: string
          crows_feet?: number | null
          customer_id?: string | null
          dark_circles?: number | null
          date_scan?: string | null
          forehead_wrinkles?: number | null
          glabellar_lines?: number | null
          global_score?: number | null
          id?: string
          large_pore?: number | null
          medium_pore?: number | null
          nasolabial_folds?: number | null
          perioral_lines?: number | null
          pigment?: number | null
          pore?: number | null
          pore_diagnostic_image?: string | null
          sensitivity?: number | null
          small_pore?: number | null
          spot?: number | null
          under_eye_wrinkles?: number | null
          wrinkle?: number | null
          wrinkle_diagnostic_image?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historic_scans_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      interactions: {
        Row: {
          content: string
          created_at: string
          customer_id: string
          id: string
          interaction_date: string
          interaction_type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          customer_id: string
          id?: string
          interaction_date?: string
          interaction_type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          customer_id?: string
          id?: string
          interaction_date?: string
          interaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_interactions_customer"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          brand: string | null
          category: string
          created_at: string
          description: string | null
          effectiveness_acne: boolean | null
          effectiveness_blackhead: boolean | null
          effectiveness_crows_feet: boolean | null
          effectiveness_dark_circles: boolean | null
          effectiveness_forehead_wrinkles: boolean | null
          effectiveness_glabellar_lines: boolean | null
          effectiveness_global_score: boolean | null
          effectiveness_large_pore: boolean | null
          effectiveness_medium_pore: boolean | null
          effectiveness_nasolabial_folds: boolean | null
          effectiveness_perioral_lines: boolean | null
          effectiveness_pigment: boolean | null
          effectiveness_pore: boolean | null
          effectiveness_sensitivity: boolean | null
          effectiveness_small_pore: boolean | null
          effectiveness_spot: boolean | null
          effectiveness_under_eye_wrinkles: boolean | null
          effectiveness_wrinkle: boolean | null
          id: string
          image: string | null
          images: string[] | null
          name: string
          price: number
          rating: number | null
          shopify_product_id: string | null
          shopify_variant_id: string | null
          skin_types: string[] | null
          stock: number
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category: string
          created_at?: string
          description?: string | null
          effectiveness_acne?: boolean | null
          effectiveness_blackhead?: boolean | null
          effectiveness_crows_feet?: boolean | null
          effectiveness_dark_circles?: boolean | null
          effectiveness_forehead_wrinkles?: boolean | null
          effectiveness_glabellar_lines?: boolean | null
          effectiveness_global_score?: boolean | null
          effectiveness_large_pore?: boolean | null
          effectiveness_medium_pore?: boolean | null
          effectiveness_nasolabial_folds?: boolean | null
          effectiveness_perioral_lines?: boolean | null
          effectiveness_pigment?: boolean | null
          effectiveness_pore?: boolean | null
          effectiveness_sensitivity?: boolean | null
          effectiveness_small_pore?: boolean | null
          effectiveness_spot?: boolean | null
          effectiveness_under_eye_wrinkles?: boolean | null
          effectiveness_wrinkle?: boolean | null
          id?: string
          image?: string | null
          images?: string[] | null
          name: string
          price: number
          rating?: number | null
          shopify_product_id?: string | null
          shopify_variant_id?: string | null
          skin_types?: string[] | null
          stock?: number
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string
          created_at?: string
          description?: string | null
          effectiveness_acne?: boolean | null
          effectiveness_blackhead?: boolean | null
          effectiveness_crows_feet?: boolean | null
          effectiveness_dark_circles?: boolean | null
          effectiveness_forehead_wrinkles?: boolean | null
          effectiveness_glabellar_lines?: boolean | null
          effectiveness_global_score?: boolean | null
          effectiveness_large_pore?: boolean | null
          effectiveness_medium_pore?: boolean | null
          effectiveness_nasolabial_folds?: boolean | null
          effectiveness_perioral_lines?: boolean | null
          effectiveness_pigment?: boolean | null
          effectiveness_pore?: boolean | null
          effectiveness_sensitivity?: boolean | null
          effectiveness_small_pore?: boolean | null
          effectiveness_spot?: boolean | null
          effectiveness_under_eye_wrinkles?: boolean | null
          effectiveness_wrinkle?: boolean | null
          id?: string
          image?: string | null
          images?: string[] | null
          name?: string
          price?: number
          rating?: number | null
          shopify_product_id?: string | null
          shopify_variant_id?: string | null
          skin_types?: string[] | null
          stock?: number
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory_logs: {
        Row: {
          action_type: string
          created_at: string
          id: string
          inventory_item_id: string
          is_manual_upload: boolean | null
          new_stock: number | null
          notes: string | null
          previous_stock: number | null
          quantity_change: number
          related_order_id: string | null
          updated_at: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          inventory_item_id: string
          is_manual_upload?: boolean | null
          new_stock?: number | null
          notes?: string | null
          previous_stock?: number | null
          quantity_change: number
          related_order_id?: string | null
          updated_at?: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          inventory_item_id?: string
          is_manual_upload?: boolean | null
          new_stock?: number | null
          notes?: string | null
          previous_stock?: number | null
          quantity_change?: number
          related_order_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          customer_name: string
          id: string
          order_date: string
          order_number: string
          products: string[]
          status: string | null
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          customer_name: string
          id?: string
          order_date?: string
          order_number: string
          products: string[]
          status?: string | null
          total: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          id?: string
          order_date?: string
          order_number?: string
          products?: string[]
          status?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
