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
      deck_cards: {
        Row: {
          board_type: string
          card_id: string | null
          created_at: string | null
          deck_id: string | null
          finish: string | null
          id: string
          is_foil: boolean | null
          is_proxy: boolean | null
          quantity: number
        }
        Insert: {
          board_type: string
          card_id?: string | null
          created_at?: string | null
          deck_id?: string | null
          finish?: string | null
          id?: string
          is_foil?: boolean | null
          is_proxy?: boolean | null
          quantity?: number
        }
        Update: {
          board_type?: string
          card_id?: string | null
          created_at?: string | null
          deck_id?: string | null
          finish?: string | null
          id?: string
          is_foil?: boolean | null
          is_proxy?: boolean | null
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "deck_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_cards_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "staple_cards_mv"
            referencedColumns: ["card_id"]
          },
          {
            foreignKeyName: "deck_cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_cards_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "decks_full"
            referencedColumns: ["id"]
          },
        ]
      }
      deck_mana_analysis_cache: {
        Row: {
          analysis: Json
          analyzed_at: string | null
          deck_id: string
        }
        Insert: {
          analysis: Json
          analyzed_at?: string | null
          deck_id: string
        }
        Update: {
          analysis?: Json
          analyzed_at?: string | null
          deck_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deck_mana_analysis_cache_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: true
            referencedRelation: "decks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_mana_analysis_cache_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: true
            referencedRelation: "decks_full"
            referencedColumns: ["id"]
          },
        ]
      }
      deck_submissions: {
        Row: {
          bracket: string
          budget: string
          coffee_preference: string
          color_preference: string
          commander: string | null
          created_at: string
          deck_list_url: string | null
          discord_username: string
          email: string
          id: string
          ideal_date: string | null
          mystery_deck: boolean
          notes: string | null
          patreon_id: string
          patreon_tier: string
          patreon_username: string
          status: string | null
          submission_month: string | null
          theme: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          bracket: string
          budget: string
          coffee_preference: string
          color_preference: string
          commander?: string | null
          created_at?: string
          deck_list_url?: string | null
          discord_username: string
          email: string
          id?: string
          ideal_date?: string | null
          mystery_deck: boolean
          notes?: string | null
          patreon_id: string
          patreon_tier: string
          patreon_username: string
          status?: string | null
          submission_month?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          bracket?: string
          budget?: string
          coffee_preference?: string
          color_preference?: string
          commander?: string | null
          created_at?: string
          deck_list_url?: string | null
          discord_username?: string
          email?: string
          id?: string
          ideal_date?: string | null
          mystery_deck?: boolean
          notes?: string | null
          patreon_id?: string
          patreon_tier?: string
          patreon_username?: string
          status?: string | null
          submission_month?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      decks: {
        Row: {
          color_identity: string[] | null
          commanders: string[] | null
          comment_count: number | null
          created_at: string | null
          description: string | null
          format: string | null
          id: string
          like_count: number | null
          moxfield_id: string
          moxfield_url: string | null
          name: string
          set_codes: string[] | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          color_identity?: string[] | null
          commanders?: string[] | null
          comment_count?: number | null
          created_at?: string | null
          description?: string | null
          format?: string | null
          id?: string
          like_count?: number | null
          moxfield_id: string
          moxfield_url?: string | null
          name: string
          set_codes?: string[] | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          color_identity?: string[] | null
          commanders?: string[] | null
          comment_count?: number | null
          created_at?: string | null
          description?: string | null
          format?: string | null
          id?: string
          like_count?: number | null
          moxfield_id?: string
          moxfield_url?: string | null
          name?: string
          set_codes?: string[] | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      decks_old: {
        Row: {
          color_identity: string[]
          commanders: string[]
          comment_count: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          format: string | null
          fts: unknown | null
          id: string
          like_count: number | null
          moxfield_data: Json
          moxfield_id: string
          moxfield_url: string
          name: string
          required_tier: Database["public"]["Enums"]["patreon_tier"]
          set_codes: string[] | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          color_identity?: string[]
          commanders?: string[]
          comment_count?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          format?: string | null
          fts?: unknown | null
          id?: string
          like_count?: number | null
          moxfield_data: Json
          moxfield_id: string
          moxfield_url: string
          name: string
          required_tier?: Database["public"]["Enums"]["patreon_tier"]
          set_codes?: string[] | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          color_identity?: string[]
          commanders?: string[]
          comment_count?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          format?: string | null
          fts?: unknown | null
          id?: string
          like_count?: number | null
          moxfield_data?: Json
          moxfield_id?: string
          moxfield_url?: string
          name?: string
          required_tier?: Database["public"]["Enums"]["patreon_tier"]
          set_codes?: string[] | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "decks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_submission_status"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mana_producers: {
        Row: {
          card_id: string
          is_conditional: boolean | null
          is_opponent_dependent: boolean | null
          last_fetched_at: string | null
          name: string | null
          oracle_text: string | null
          produces_any_color: boolean | null
          produces_black: boolean | null
          produces_blue: boolean | null
          produces_colorless: boolean | null
          produces_green: boolean | null
          produces_red: boolean | null
          produces_white: boolean | null
          requires_sacrifice: boolean | null
          scryfall_id: string | null
          type_line: string | null
        }
        Insert: {
          card_id: string
          is_conditional?: boolean | null
          is_opponent_dependent?: boolean | null
          last_fetched_at?: string | null
          name?: string | null
          oracle_text?: string | null
          produces_any_color?: boolean | null
          produces_black?: boolean | null
          produces_blue?: boolean | null
          produces_colorless?: boolean | null
          produces_green?: boolean | null
          produces_red?: boolean | null
          produces_white?: boolean | null
          requires_sacrifice?: boolean | null
          scryfall_id?: string | null
          type_line?: string | null
        }
        Update: {
          card_id?: string
          is_conditional?: boolean | null
          is_opponent_dependent?: boolean | null
          last_fetched_at?: string | null
          name?: string | null
          oracle_text?: string | null
          produces_any_color?: boolean | null
          produces_black?: boolean | null
          produces_blue?: boolean | null
          produces_colorless?: boolean | null
          produces_green?: boolean | null
          produces_red?: boolean | null
          produces_white?: boolean | null
          requires_sacrifice?: boolean | null
          scryfall_id?: string | null
          type_line?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          patreon_id: string | null
          patreon_tier: Database["public"]["Enums"]["patreon_tier"] | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          patreon_id?: string | null
          patreon_tier?: Database["public"]["Enums"]["patreon_tier"] | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          patreon_id?: string | null
          patreon_tier?: Database["public"]["Enums"]["patreon_tier"] | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sync_deck_logs: {
        Row: {
          action: string | null
          deck_name: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          moxfield_id: string
          status: string
          sync_log_id: string | null
          synced_at: string | null
        }
        Insert: {
          action?: string | null
          deck_name?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          moxfield_id: string
          status: string
          sync_log_id?: string | null
          synced_at?: string | null
        }
        Update: {
          action?: string | null
          deck_name?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          moxfield_id?: string
          status?: string
          sync_log_id?: string | null
          synced_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_deck_logs_sync_log_id_fkey"
            columns: ["sync_log_id"]
            isOneToOne: false
            referencedRelation: "recent_syncs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_deck_logs_sync_log_id_fkey"
            columns: ["sync_log_id"]
            isOneToOne: false
            referencedRelation: "sync_logs"
            referencedColumns: ["id"]
          },
        ]
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
      test_decks: {
        Row: {
          color_identity: string[]
          commanders: string[]
          created_at: string
          deck_name: string
          description: string
          id: string
          likes: number | null
          moxfield_url: string
          updated_at: string
          views: number | null
        }
        Insert: {
          color_identity: string[]
          commanders: string[]
          created_at?: string
          deck_name: string
          description: string
          id?: string
          likes?: number | null
          moxfield_url: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          color_identity?: string[]
          commanders?: string[]
          created_at?: string
          deck_name?: string
          description?: string
          id?: string
          likes?: number | null
          moxfield_url?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      average_mana_curve_mv: {
        Row: {
          avg_per_deck: number | null
          card_count: number | null
          cmc: number | null
          percentage: number | null
          unique_cards: number | null
        }
        Relationships: []
      }
      decks_full: {
        Row: {
          color_identity: string[] | null
          commanders: string[] | null
          comment_count: number | null
          created_at: string | null
          description: string | null
          format: string | null
          id: string | null
          like_count: number | null
          mainboard_count: number | null
          moxfield_id: string | null
          moxfield_url: string | null
          name: string | null
          set_codes: string[] | null
          sets: string[] | null
          sideboard_count: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          color_identity?: string[] | null
          commanders?: string[] | null
          comment_count?: number | null
          created_at?: string | null
          description?: string | null
          format?: string | null
          id?: string | null
          like_count?: number | null
          mainboard_count?: never
          moxfield_id?: string | null
          moxfield_url?: string | null
          name?: string | null
          set_codes?: string[] | null
          sets?: never
          sideboard_count?: never
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          color_identity?: string[] | null
          commanders?: string[] | null
          comment_count?: number | null
          created_at?: string | null
          description?: string | null
          format?: string | null
          id?: string | null
          like_count?: number | null
          mainboard_count?: never
          moxfield_id?: string | null
          moxfield_url?: string | null
          name?: string | null
          set_codes?: string[] | null
          sets?: never
          sideboard_count?: never
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      popular_sets_mv: {
        Row: {
          avg_cards_per_deck: number | null
          deck_count: number | null
          set_code: string | null
          set_name: string | null
          total_instances: number | null
          unique_cards: number | null
        }
        Relationships: []
      }
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
        Relationships: []
      }
      staple_cards_mv: {
        Row: {
          avg_copies_per_deck: number | null
          card_id: string | null
          card_name: string | null
          cmc: number | null
          colors: string[] | null
          deck_count: number | null
          inclusion_rate: number | null
          mana_cost: string | null
          rarity: string | null
          total_copies: number | null
          type_line: string | null
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
      top_commanders_mv: {
        Row: {
          avg_likes: number | null
          avg_views: number | null
          color_identity: string[] | null
          commander: string | null
          deck_count: number | null
          total_likes: number | null
          total_views: number | null
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
        Insert: {
          max_submissions?: never
          patreon_tier?: Database["public"]["Enums"]["patreon_tier"] | null
          remaining_submissions?: never
          used_submissions?: never
          user_id?: string | null
        }
        Update: {
          max_submissions?: never
          patreon_tier?: Database["public"]["Enums"]["patreon_tier"] | null
          remaining_submissions?: never
          used_submissions?: never
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      analyze_deck_mana_requirements: {
        Args: { p_deck_id: string }
        Returns: {
          avg_pips_per_card: number
          cards_requiring: number
          cards_with_1_pip: number
          cards_with_2_pips: number
          cards_with_3plus_pips: number
          color: string
          earliest_cmc_with_2_pips: number
          earliest_cmc_with_3_pips: number
          total_pips: number
        }[]
      }
      analyze_mana_base: {
        Args: { p_deck_id: string }
        Returns: {
          cards_needing_color: number
          color: string
          land_sources: number
          nonland_sources: number
          pips_required: number
          prob_turn_1: number
          prob_turn_3: number
          prob_turn_5: number
          recommendation: string
          recommended_sources: number
          source_delta: number
          sources_in_deck: number
          status: string
        }[]
      }
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      count_deck_mana_sources: {
        Args: { p_deck_id: string }
        Returns: {
          color: string
          conditional_sources: number
          flexible_sources: number
          land_sources: number
          nonland_sources: number
          source_count: number
          source_names: string[]
        }[]
      }
      curve_calc: {
        Args: { d: number; k: number; n: number; x: number }
        Returns: number
      }
      extract_deck_text: {
        Args: { moxfield_data: Json }
        Returns: string
      }
      extract_mana_pips: {
        Args: { mana_cost: string }
        Returns: {
          black: number
          blue: number
          colorless: number
          green: number
          red: number
          total_pips: number
          white: number
        }[]
      }
      extract_set_codes_from_deck: {
        Args: { moxfield_data: Json }
        Returns: string[]
      }
      factorial_approx: {
        Args: { n: number }
        Returns: number
      }
      fetch_all_mana_producers: {
        Args: Record<PropertyKey, never>
        Returns: {
          message: string
          total_fetched: number
        }[]
      }
      fetch_mana_producers_from_scryfall: {
        Args: Record<PropertyKey, never>
        Returns: {
          cards_added: number
          cards_processed: number
          total_cards: number
        }[]
      }
      get_all_card_names: {
        Args: Record<PropertyKey, never>
        Returns: {
          card_name: string
          deck_count: number
        }[]
      }
      get_average_mana_curve: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_per_deck: number
          card_count: number
          cmc: number
          percentage: number
          unique_cards: number
        }[]
      }
      get_card_synergies: {
        Args: { min_correlation?: number; target_card: string }
        Returns: {
          correlation_percentage: number
          synergy_card: string
          times_together: number
        }[]
      }
      get_card_type_distribution: {
        Args: Record<PropertyKey, never>
        Returns: {
          avg_per_deck: number
          card_type: string
          total_cards: number
        }[]
      }
      get_deck_mana_analysis: {
        Args: { p_deck_id: string }
        Returns: Json
      }
      get_mana_base_health_score: {
        Args: { p_deck_id: string }
        Returns: {
          colors_acceptable: number
          colors_insufficient: number
          colors_optimal: number
          fixing_lands: number
          grade: string
          overall_score: number
          recommendations: string[]
          total_color_pips: number
          total_lands: number
          unique_mana_sources: number
        }[]
      }
      get_popular_sets: {
        Args: { limit_count?: number }
        Returns: {
          avg_cards_per_deck: number
          deck_count: number
          set_code: string
          set_name: string
          total_instances: number
          unique_cards: number
        }[]
      }
      get_staple_cards: {
        Args: {
          exclude_lands?: boolean
          limit_count?: number
          min_decks?: number
        }
        Returns: {
          avg_copies_per_deck: number
          card_name: string
          card_type: string
          cmc: number
          colors: string[]
          deck_count: number
          inclusion_rate: number
          mana_cost: string
          rarity: string
          total_copies: number
        }[]
      }
      get_top_commanders: {
        Args: { limit_count?: number }
        Returns: {
          avg_likes: number
          avg_views: number
          color_identity: string[]
          commander: string
          deck_count: number
          total_likes: number
          total_views: number
        }[]
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { data: Json; uri: string } | { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { data: Json; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      hypergeometric_probability: {
        Args: {
          population_size: number
          sample_size: number
          success_in_pop: number
          success_in_sample: number
        }
        Returns: number
      }
      import_deck_from_jsonb: {
        Args: { deck_jsonb: Json; deck_moxfield_id: string }
        Returns: string
      }
      populate_deck_analysis_cache: {
        Args: { batch_size?: number; offset_start?: number }
        Returns: {
          batch_number: number
          decks_processed: number
          elapsed_seconds: number
          error_count: number
          success_count: number
        }[]
      }
      search_decks_by_card: {
        Args: { card_name: string }
        Returns: {
          color_identity: string[]
          commanders: string[]
          comment_count: number
          created_at: string
          created_by: string
          description: string
          format: string
          fts: unknown
          id: string
          like_count: number
          moxfield_data: Json
          moxfield_id: string
          moxfield_url: string
          name: string
          required_tier: string
          updated_at: string
          view_count: number
        }[]
      }
      search_decks_by_card_partial: {
        Args: { card_name: string }
        Returns: {
          color_identity: string[]
          commanders: string[]
          comment_count: number
          created_at: string
          created_by: string
          description: string
          format: string
          fts: unknown
          id: string
          like_count: number
          moxfield_data: Json
          moxfield_id: string
          moxfield_url: string
          name: string
          required_tier: string
          updated_at: string
          view_count: number
        }[]
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args:
          | { "": string }
          | { data: Json }
          | { string: string }
          | { string: string }
        Returns: string
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
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
    },
  },
} as const
