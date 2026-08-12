// Autogenerado con `pnpm supabase:types` (spec 007 T003).
// No editar a mano.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      exercises: {
        Row: {
          created_at: string
          exercise_key: string
          id: string
          lesson_id: string
          payload: Json
          sort_order: number
          type: Database["public"]["Enums"]["exercise_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          exercise_key: string
          id?: string
          lesson_id: string
          payload: Json
          sort_order: number
          type: Database["public"]["Enums"]["exercise_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          exercise_key?: string
          id?: string
          lesson_id?: string
          payload?: Json
          sort_order?: number
          type?: Database["public"]["Enums"]["exercise_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercises_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      grammar_topics: {
        Row: {
          cefr_level: string
          created_at: string
          explanation_es: string
          id: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          cefr_level: string
          created_at?: string
          explanation_es: string
          id?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          cefr_level?: string
          created_at?: string
          explanation_es?: string
          id?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_completion_attempts: {
        Row: {
          created_at: string
          current_streak: number
          idempotency_key: string
          new_total_xp: number
          newly_unlocked: string[]
          user_id: string
          xp_awarded: number
        }
        Insert: {
          created_at?: string
          current_streak: number
          idempotency_key: string
          new_total_xp: number
          newly_unlocked: string[]
          user_id: string
          xp_awarded: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          idempotency_key?: string
          new_total_xp?: number
          newly_unlocked?: string[]
          user_id?: string
          xp_awarded?: number
        }
        Relationships: []
      }
      lesson_completions: {
        Row: {
          best_first_try_correct: number
          first_completed_at: string
          last_completed_at: string
          lesson_id: string
          times_completed: number
          total: number
          user_id: string
        }
        Insert: {
          best_first_try_correct: number
          first_completed_at?: string
          last_completed_at?: string
          lesson_id: string
          times_completed?: number
          total: number
          user_id: string
        }
        Update: {
          best_first_try_correct?: number
          first_completed_at?: string
          last_completed_at?: string
          lesson_id?: string
          times_completed?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_completions_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_grammar_topics: {
        Row: {
          grammar_topic_id: string
          lesson_id: string
        }
        Insert: {
          grammar_topic_id: string
          lesson_id: string
        }
        Update: {
          grammar_topic_id?: string
          lesson_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_grammar_topics_grammar_topic_id_fkey"
            columns: ["grammar_topic_id"]
            isOneToOne: false
            referencedRelation: "grammar_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_grammar_topics_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          id: string
          slug: string
          sort_order: number
          title: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          slug: string
          sort_order: number
          title: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          slug?: string
          sort_order?: number
          title?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "units"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          current_streak: number
          daily_goal_min: number
          display_name: string | null
          last_activity_date: string | null
          longest_streak: number
          onboarded_at: string | null
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          daily_goal_min?: number
          display_name?: string | null
          last_activity_date?: string | null
          longest_streak?: number
          onboarded_at?: string | null
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          daily_goal_min?: number
          display_name?: string | null
          last_activity_date?: string | null
          longest_streak?: number
          onboarded_at?: string | null
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      srs_cards: {
        Row: {
          due_at: string
          ease_factor: number
          exercise_id: string
          interval_days: number
          last_reviewed_at: string | null
          repetitions: number
          user_id: string
        }
        Insert: {
          due_at?: string
          ease_factor?: number
          exercise_id: string
          interval_days?: number
          last_reviewed_at?: string | null
          repetitions?: number
          user_id: string
        }
        Update: {
          due_at?: string
          ease_factor?: number
          exercise_id?: string
          interval_days?: number
          last_reviewed_at?: string | null
          repetitions?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "srs_cards_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      units: {
        Row: {
          cefr_level: string
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          cefr_level: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          slug: string
          sort_order: number
          title: string
          updated_at?: string
        }
        Update: {
          cefr_level?: string
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vocab_items: {
        Row: {
          cefr_level: string
          created_at: string
          example_en: string | null
          id: string
          term_en: string
          term_es: string
        }
        Insert: {
          cefr_level: string
          created_at?: string
          example_en?: string | null
          id?: string
          term_en: string
          term_es: string
        }
        Update: {
          cefr_level?: string
          created_at?: string
          example_en?: string | null
          id?: string
          term_en?: string
          term_es?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          created_at: string
          id: string
          lesson_id: string | null
          source: Database["public"]["Enums"]["xp_source"]
          user_id: string
          xp_delta: number
        }
        Insert: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          source: Database["public"]["Enums"]["xp_source"]
          user_id: string
          xp_delta: number
        }
        Update: {
          created_at?: string
          id?: string
          lesson_id?: string | null
          source?: Database["public"]["Enums"]["xp_source"]
          user_id?: string
          xp_delta?: number
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_lesson: {
        Args: {
          p_first_try_correct: number
          p_idempotency_key?: string
          p_lesson_id: string
          p_total: number
        }
        Returns: {
          current_streak: number
          new_total_xp: number
          newly_unlocked: string[]
          xp_awarded: number
        }[]
      }
      evaluate_achievements: { Args: { p_user: string }; Returns: string[] }
      review_card: {
        Args: { p_correct: boolean; p_exercise_id: string }
        Returns: {
          due_at: string
          interval_days: number
        }[]
      }
    }
    Enums: {
      exercise_type:
        | "multiple_choice"
        | "fill_in_blank"
        | "matching"
        | "word_order"
        | "listening"
        | "translation"
        | "dialogue"
      xp_source: "lesson_complete" | "streak_bonus" | "achievement"
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
      exercise_type: [
        "multiple_choice",
        "fill_in_blank",
        "matching",
        "word_order",
        "listening",
        "translation",
        "dialogue",
      ],
      xp_source: ["lesson_complete", "streak_bonus", "achievement"],
    },
  },
} as const
