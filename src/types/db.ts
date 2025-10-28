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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bookmark_sync_logs: {
        Row: {
          bookmark_id: string
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          inserted_decks: number | null
          started_at: string | null
          status: string
          total_decks: number | null
          unchanged_decks: number | null
          updated_decks: number | null
        }
        Insert: {
          bookmark_id: string
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          inserted_decks?: number | null
          started_at?: string | null
          status: string
          total_decks?: number | null
          unchanged_decks?: number | null
          updated_decks?: number | null
        }
        Update: {
          bookmark_id?: string
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          inserted_decks?: number | null
          started_at?: string | null
          status?: string
          total_decks?: number | null
          unchanged_decks?: number | null
          updated_decks?: number | null
        }
        Relationships: []
      }
      cards: {
        Row: {
          cmc: number | null
          color_identity: string[] | null
          colors: string[] | null
          created_at: string | null
          id: string
          image_url: string | null
          mana_cost: string | null
          name: string
          oracle_text: string | null
          prices: Json | null
          rarity: string | null
          scryfall_id: string | null
          set_code: string | null
          set_name: string | null
          type_line: string | null
        }
        Insert: {
          cmc?: number | null
          color_identity?: string[] | null
          colors?: string[] | null
          created_at?: string | null
          id: string
          image_url?: string | null
          mana_cost?: string | null
          name: string
          oracle_text?: string | null
          prices?: Json | null
          rarity?: string | null
          scryfall_id?: string | null
          set_code?: string | null
          set_name?: string | null
          type_line?: string | null
        }
        Update: {
          cmc?: number | null
          color_identity?: string[] | null
          colors?: string[] | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          mana_cost?: string | null
          name?: string
          oracle_text?: string | null
          prices?: Json | null
          rarity?: string | null
          scryfall_id?: string | null
          set_code?: string | null
          set_name?: string | null
          type_line?: string | null
        }
        Relationships: []
      }
      deck_submissions: {
        Row: {
          bracket: string | null
          budget: string | null
          coffee_preference: string | null
          color_preference: string | null
          commander: string | null
          created_at: string | null
          deck_list_url: string | null
          discord_username: string
          email: string
          id: string
          ideal_date: string | null
          moxfield_username: string | null
          mystery_deck: boolean
          notes: string | null
          patreon_id: string | null
          patreon_tier: string | null
          patreon_username: string
          status: string | null
          submission_month: string | null
          submission_type: Database["public"]["Enums"]["submission_type"] | null
          theme: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bracket?: string | null
          budget?: string | null
          coffee_preference?: string | null
          color_preference?: string | null
          commander?: string | null
          created_at?: string | null
          deck_list_url?: string | null
          discord_username: string
          email: string
          id?: string
          ideal_date?: string | null
          moxfield_username?: string | null
          mystery_deck?: boolean
          notes?: string | null
          patreon_id?: string | null
          patreon_tier?: string | null
          patreon_username: string
          status?: string | null
          submission_month?: string | null
          submission_type?:
            | Database["public"]["Enums"]["submission_type"]
            | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bracket?: string | null
          budget?: string | null
          coffee_preference?: string | null
          color_preference?: string | null
          commander?: string | null
          created_at?: string | null
          deck_list_url?: string | null
          discord_username?: string
          email?: string
          id?: string
          ideal_date?: string | null
          moxfield_username?: string | null
          mystery_deck?: boolean
          notes?: string | null
          patreon_id?: string | null
          patreon_tier?: string | null
          patreon_username?: string
          status?: string | null
          submission_month?: string | null
          submission_type?:
            | Database["public"]["Enums"]["submission_type"]
            | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      decklist_cards: {
        Row: {
          board: string
          card_data: Json | null
          card_id: string | null
          card_name: string
          fetched_at: string | null
          id: number
          moxfield_deck_id: string
          quantity: number | null
        }
        Insert: {
          board: string
          card_data?: Json | null
          card_id?: string | null
          card_name: string
          fetched_at?: string | null
          id?: number
          moxfield_deck_id: string
          quantity?: number | null
        }
        Update: {
          board?: string
          card_data?: Json | null
          card_id?: string | null
          card_name?: string
          fetched_at?: string | null
          id?: number
          moxfield_deck_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "decklist_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decklist_cards_moxfield_deck_id_fkey"
            columns: ["moxfield_deck_id"]
            isOneToOne: false
            referencedRelation: "moxfield_decks"
            referencedColumns: ["moxfield_id"]
          },
        ]
      }
      decks: {
        Row: {
          are_comments_enabled: boolean | null
          authors: Json | null
          authors_can_edit: boolean | null
          auto_bracket: number | null
          bookmark_count: number | null
          bracket: number | null
          color_identity: string[] | null
          color_identity_percentages: Json | null
          color_percentages: Json | null
          colors: string[] | null
          commanders: string[] | null
          commanders_data: Json | null
          comment_count: number | null
          created_at: string | null
          created_at_moxfield: string | null
          created_by: Json | null
          decklist_synced_at: string | null
          description: string | null
          format: string | null
          has_primer: boolean | null
          hub_names: string[] | null
          id: string
          ignore_brackets: boolean | null
          is_legal: boolean | null
          is_shared: boolean | null
          last_updated_at_moxfield: string | null
          like_count: number | null
          main_card: Json | null
          main_card_id: string | null
          main_card_id_is_back_face: boolean | null
          main_card_id_is_card_face: boolean | null
          mainboard_count: number | null
          maybeboard_count: number | null
          moxfield_id: string
          moxfield_url: string | null
          name: string
          needs_decklist_sync: boolean | null
          set_codes: string[] | null
          sfw_comment_count: number | null
          sideboard_count: number | null
          updated_at: string | null
          view_count: number | null
          visibility: string | null
        }
        Insert: {
          are_comments_enabled?: boolean | null
          authors?: Json | null
          authors_can_edit?: boolean | null
          auto_bracket?: number | null
          bookmark_count?: number | null
          bracket?: number | null
          color_identity?: string[] | null
          color_identity_percentages?: Json | null
          color_percentages?: Json | null
          colors?: string[] | null
          commanders?: string[] | null
          commanders_data?: Json | null
          comment_count?: number | null
          created_at?: string | null
          created_at_moxfield?: string | null
          created_by?: Json | null
          decklist_synced_at?: string | null
          description?: string | null
          format?: string | null
          has_primer?: boolean | null
          hub_names?: string[] | null
          id?: string
          ignore_brackets?: boolean | null
          is_legal?: boolean | null
          is_shared?: boolean | null
          last_updated_at_moxfield?: string | null
          like_count?: number | null
          main_card?: Json | null
          main_card_id?: string | null
          main_card_id_is_back_face?: boolean | null
          main_card_id_is_card_face?: boolean | null
          mainboard_count?: number | null
          maybeboard_count?: number | null
          moxfield_id: string
          moxfield_url?: string | null
          name: string
          needs_decklist_sync?: boolean | null
          set_codes?: string[] | null
          sfw_comment_count?: number | null
          sideboard_count?: number | null
          updated_at?: string | null
          view_count?: number | null
          visibility?: string | null
        }
        Update: {
          are_comments_enabled?: boolean | null
          authors?: Json | null
          authors_can_edit?: boolean | null
          auto_bracket?: number | null
          bookmark_count?: number | null
          bracket?: number | null
          color_identity?: string[] | null
          color_identity_percentages?: Json | null
          color_percentages?: Json | null
          colors?: string[] | null
          commanders?: string[] | null
          commanders_data?: Json | null
          comment_count?: number | null
          created_at?: string | null
          created_at_moxfield?: string | null
          created_by?: Json | null
          decklist_synced_at?: string | null
          description?: string | null
          format?: string | null
          has_primer?: boolean | null
          hub_names?: string[] | null
          id?: string
          ignore_brackets?: boolean | null
          is_legal?: boolean | null
          is_shared?: boolean | null
          last_updated_at_moxfield?: string | null
          like_count?: number | null
          main_card?: Json | null
          main_card_id?: string | null
          main_card_id_is_back_face?: boolean | null
          main_card_id_is_card_face?: boolean | null
          mainboard_count?: number | null
          maybeboard_count?: number | null
          moxfield_id?: string
          moxfield_url?: string | null
          name?: string
          needs_decklist_sync?: boolean | null
          set_codes?: string[] | null
          sfw_comment_count?: number | null
          sideboard_count?: number | null
          updated_at?: string | null
          view_count?: number | null
          visibility?: string | null
        }
        Relationships: []
      }
      moxfield_decks: {
        Row: {
          author_name: string | null
          author_username: string | null
          cards_fetched_at: string | null
          commanders_count: number | null
          comment_count: number | null
          created_at: string | null
          fetched_at: string | null
          format: string | null
          id: number
          is_legal: boolean | null
          last_updated_at: string | null
          like_count: number | null
          mainboard_count: number | null
          moxfield_id: string
          name: string
          public_id: string | null
          public_url: string | null
          raw_data: Json | null
          sideboard_count: number | null
          view_count: number | null
          visibility: string | null
        }
        Insert: {
          author_name?: string | null
          author_username?: string | null
          cards_fetched_at?: string | null
          commanders_count?: number | null
          comment_count?: number | null
          created_at?: string | null
          fetched_at?: string | null
          format?: string | null
          id?: number
          is_legal?: boolean | null
          last_updated_at?: string | null
          like_count?: number | null
          mainboard_count?: number | null
          moxfield_id: string
          name: string
          public_id?: string | null
          public_url?: string | null
          raw_data?: Json | null
          sideboard_count?: number | null
          view_count?: number | null
          visibility?: string | null
        }
        Update: {
          author_name?: string | null
          author_username?: string | null
          cards_fetched_at?: string | null
          commanders_count?: number | null
          comment_count?: number | null
          created_at?: string | null
          fetched_at?: string | null
          format?: string | null
          id?: number
          is_legal?: boolean | null
          last_updated_at?: string | null
          like_count?: number | null
          mainboard_count?: number | null
          moxfield_id?: string
          name?: string
          public_id?: string | null
          public_url?: string | null
          raw_data?: Json | null
          sideboard_count?: number | null
          view_count?: number | null
          visibility?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          key: string
          link: string
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          key: string
          link: string
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          key?: string
          link?: string
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          moxfield_username: string | null
          patreon_id: string | null
          patreon_tier: Database["public"]["Enums"]["patreon_tier"] | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          moxfield_username?: string | null
          patreon_id?: string | null
          patreon_tier?: Database["public"]["Enums"]["patreon_tier"] | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          moxfield_username?: string | null
          patreon_id?: string | null
          patreon_tier?: Database["public"]["Enums"]["patreon_tier"] | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      site_config: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_sensitive: boolean | null
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      sync_logs: {
        Row: {
          bookmark_id: string
          completed_at: string | null
          duration_ms: number | null
          error_message: string | null
          failed_decks: number | null
          id: string
          metadata: Json | null
          started_at: string | null
          status: string
          total_decks: number | null
          unchanged_decks: number | null
          updated_decks: number | null
        }
        Insert: {
          bookmark_id: string
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          failed_decks?: number | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status: string
          total_decks?: number | null
          unchanged_decks?: number | null
          updated_decks?: number | null
        }
        Update: {
          bookmark_id?: string
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          failed_decks?: number | null
          id?: string
          metadata?: Json | null
          started_at?: string | null
          status?: string
          total_decks?: number | null
          unchanged_decks?: number | null
          updated_decks?: number | null
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string | null
          credits_month: string
          deck_credits: number | null
          id: string
          patreon_tier: string
          roast_credits: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          credits_month: string
          deck_credits?: number | null
          id?: string
          patreon_tier: string
          roast_credits?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          credits_month?: string
          deck_credits?: number | null
          id?: string
          patreon_tier?: string
          roast_credits?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: number
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          created_at?: string | null
          id?: number
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
    }
    Views: {
      recent_syncs: {
        Row: {
          bookmark_id: string | null
          duration_ms: number | null
          error_count: number | null
          failed_decks: number | null
          id: string | null
          started_at: string | null
          status: string | null
          success_rate: number | null
          total_decks: number | null
          unchanged_decks: number | null
          updated_decks: number | null
        }
        Insert: {
          bookmark_id?: string | null
          duration_ms?: number | null
          error_count?: never
          failed_decks?: number | null
          id?: string | null
          started_at?: string | null
          status?: string | null
          success_rate?: never
          total_decks?: number | null
          unchanged_decks?: number | null
          updated_decks?: number | null
        }
        Update: {
          bookmark_id?: string | null
          duration_ms?: number | null
          error_count?: never
          failed_decks?: number | null
          id?: string | null
          started_at?: string | null
          status?: string | null
          success_rate?: never
          total_decks?: number | null
          unchanged_decks?: number | null
          updated_decks?: number | null
        }
        Relationships: []
      }
      submission_stats: {
        Row: {
          archmage_submissions: number | null
          completed_count: number | null
          duke_submissions: number | null
          in_progress_count: number | null
          mystery_deck_count: number | null
          pending_count: number | null
          total_submissions: number | null
          unique_brackets: number | null
          unique_color_combinations: number | null
          unique_users: number | null
          wizard_submissions: number | null
        }
        Relationships: []
      }
      user_submission_status: {
        Row: {
          max_submissions: number | null
          patreon_tier: Database["public"]["Enums"]["patreon_tier"] | null
          remaining_submissions: number | null
          used_submissions: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_tier_monthly_credits: {
        Args: { tier: string }
        Returns: {
          deck_credits: number
          roast_credits: number
        }[]
      }
      import_deck_from_jsonb: {
        Args: { deck_jsonb: Json; deck_moxfield_id: string }
        Returns: string
      }
      refresh_user_credits: {
        Args: { p_patreon_tier: string; p_user_id: string }
        Returns: undefined
      }
      refund_credit: {
        Args: {
          p_submission_month: string
          p_submission_type: Database["public"]["Enums"]["submission_type"]
          p_user_id: string
        }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      use_credit: {
        Args: {
          p_submission_type: Database["public"]["Enums"]["submission_type"]
          p_user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      patreon_tier:
        | "Citizen"
        | "Knight"
        | "Emissary"
        | "Duke"
        | "Wizard"
        | "ArchMage"
      submission_type: "deck" | "roast"
      user_role: "user" | "member" | "moderator" | "administrator" | "developer"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      patreon_tier: [
        "Citizen",
        "Knight",
        "Emissary",
        "Duke",
        "Wizard",
        "ArchMage",
      ],
      submission_type: ["deck", "roast"],
      user_role: ["user", "member", "moderator", "administrator", "developer"],
    },
  },
} as const
