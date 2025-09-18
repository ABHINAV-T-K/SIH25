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
      emergency_alerts: {
        Row: {
          affected_population: string | null
          ai_severity_score: number | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          location: string
          severity: Database["public"]["Enums"]["severity_level"]
          status: Database["public"]["Enums"]["alert_status"] | null
          title: string
          type: Database["public"]["Enums"]["incident_type"]
          updated_at: string
        }
        Insert: {
          affected_population?: string | null
          ai_severity_score?: number | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          location: string
          severity: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["alert_status"] | null
          title: string
          type: Database["public"]["Enums"]["incident_type"]
          updated_at?: string
        }
        Update: {
          affected_population?: string | null
          ai_severity_score?: number | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          location?: string
          severity?: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["alert_status"] | null
          title?: string
          type?: Database["public"]["Enums"]["incident_type"]
          updated_at?: string
        }
        Relationships: []
      }
      emergency_resources: {
        Row: {
          additional_info: Json | null
          address: string
          available: boolean | null
          capacity: number | null
          coordinates: unknown | null
          created_at: string
          current_occupancy: number | null
          email: string | null
          id: string
          name: string
          phone: string | null
          type: Database["public"]["Enums"]["resource_type"]
          updated_at: string
        }
        Insert: {
          additional_info?: Json | null
          address: string
          available?: boolean | null
          capacity?: number | null
          coordinates?: unknown | null
          created_at?: string
          current_occupancy?: number | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          type: Database["public"]["Enums"]["resource_type"]
          updated_at?: string
        }
        Update: {
          additional_info?: Json | null
          address?: string
          available?: boolean | null
          capacity?: number | null
          coordinates?: unknown | null
          created_at?: string
          current_occupancy?: number | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          type?: Database["public"]["Enums"]["resource_type"]
          updated_at?: string
        }
        Relationships: []
      }
      evacuation_routes: {
        Row: {
          ai_optimized: boolean | null
          capacity: number | null
          created_at: string
          current_status: string | null
          current_usage: number | null
          difficulty_level: string | null
          distance_km: number | null
          estimated_time_minutes: number | null
          from_location: string
          id: string
          name: string
          route_points: Json | null
          to_location: string
          updated_at: string
        }
        Insert: {
          ai_optimized?: boolean | null
          capacity?: number | null
          created_at?: string
          current_status?: string | null
          current_usage?: number | null
          difficulty_level?: string | null
          distance_km?: number | null
          estimated_time_minutes?: number | null
          from_location: string
          id?: string
          name: string
          route_points?: Json | null
          to_location: string
          updated_at?: string
        }
        Update: {
          ai_optimized?: boolean | null
          capacity?: number | null
          created_at?: string
          current_status?: string | null
          current_usage?: number | null
          difficulty_level?: string | null
          distance_km?: number | null
          estimated_time_minutes?: number | null
          from_location?: string
          id?: string
          name?: string
          route_points?: Json | null
          to_location?: string
          updated_at?: string
        }
        Relationships: []
      }
      incident_reports: {
        Row: {
          ai_severity_score: number | null
          contact_info: string | null
          created_at: string
          description: string
          id: string
          images: string[] | null
          is_anonymous: boolean | null
          location: string
          severity: Database["public"]["Enums"]["severity_level"]
          status: Database["public"]["Enums"]["alert_status"] | null
          type: Database["public"]["Enums"]["incident_type"]
          updated_at: string
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          ai_severity_score?: number | null
          contact_info?: string | null
          created_at?: string
          description: string
          id?: string
          images?: string[] | null
          is_anonymous?: boolean | null
          location: string
          severity: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["alert_status"] | null
          type: Database["public"]["Enums"]["incident_type"]
          updated_at?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          ai_severity_score?: number | null
          contact_info?: string | null
          created_at?: string
          description?: string
          id?: string
          images?: string[] | null
          is_anonymous?: boolean | null
          location?: string
          severity?: Database["public"]["Enums"]["severity_level"]
          status?: Database["public"]["Enums"]["alert_status"] | null
          type?: Database["public"]["Enums"]["incident_type"]
          updated_at?: string
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      alert_status: "active" | "resolved" | "monitoring" | "watch"
      incident_type:
        | "flood"
        | "fire"
        | "earthquake"
        | "weather"
        | "accident"
        | "hazmat"
        | "medical"
        | "other"
      resource_type:
        | "shelter"
        | "hospital"
        | "fire_station"
        | "police_station"
        | "emergency_contact"
      severity_level: "low" | "medium" | "high" | "critical"
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
      alert_status: ["active", "resolved", "monitoring", "watch"],
      incident_type: [
        "flood",
        "fire",
        "earthquake",
        "weather",
        "accident",
        "hazmat",
        "medical",
        "other",
      ],
      resource_type: [
        "shelter",
        "hospital",
        "fire_station",
        "police_station",
        "emergency_contact",
      ],
      severity_level: ["low", "medium", "high", "critical"],
    },
  },
} as const
