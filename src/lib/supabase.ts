import { createClient } from '@supabase/supabase-js';

// These should be in .env but providing defaults for the mock environment
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper for type-safe database access
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      provinces: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      clubs: {
        Row: {
          id: string
          name: string
          province_id: string | null
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          province_id?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          province_id?: string | null
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      players: {
        Row: {
          id: string
          full_name: string
          nik: string
          kk_number: string | null
          birth_date: string
          birth_place: string | null
          parent_name: string | null
          club_id: string | null
          team_id: string | null
          photo_url: string | null
          dukcapil_status: 'VALID MATCH' | 'PARTIAL MATCH' | 'NO MATCH'
          dukcapil_match_score: number
          consistency_score: number
          face_match_confidence: number
          verification_status: 'VERIFIED' | 'MANUAL REVIEW' | 'REJECTED'
          is_over_age: boolean
          admin_override: boolean
          override_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          nik: string
          kk_number?: string | null
          birth_date: string
          birth_place?: string | null
          parent_name?: string | null
          club_id?: string | null
          team_id?: string | null
          photo_url?: string | null
          dukcapil_status?: 'VALID MATCH' | 'PARTIAL MATCH' | 'NO MATCH'
          dukcapil_match_score?: number
          consistency_score?: number
          face_match_confidence?: number
          verification_status?: 'VERIFIED' | 'MANUAL REVIEW' | 'REJECTED'
          is_over_age?: boolean
          admin_override?: boolean
          override_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          nik?: string
          kk_number?: string | null
          birth_date?: string
          birth_place?: string | null
          parent_name?: string | null
          club_id?: string | null
          team_id?: string | null
          photo_url?: string | null
          dukcapil_status?: 'VALID MATCH' | 'PARTIAL MATCH' | 'NO MATCH'
          dukcapil_match_score?: number
          consistency_score?: number
          face_match_confidence?: number
          verification_status?: 'VERIFIED' | 'MANUAL REVIEW' | 'REJECTED'
          is_over_age?: boolean
          admin_override?: boolean
          override_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      verification_logs: {
        Row: {
          id: string
          player_id: string
          admin_id: string | null
          action_type: string
          old_status: string | null
          new_status: string | null
          risk_score: number | null
          reason: string | null
          payload: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          player_id: string
          admin_id?: string | null
          action_type: string
          old_status?: string | null
          new_status?: string | null
          risk_score?: number | null
          reason?: string | null
          payload?: Json | null
          timestamp?: string
        }
      }
    }
  }
}
