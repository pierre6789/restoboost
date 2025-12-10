export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          subscription_status: 'free' | 'active' | 'canceled' | 'past_due'
          plan_type: 'free' | 'pro' | 'enterprise'
          plan: 'free' | 'pro' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          subscription_status?: 'free' | 'active' | 'canceled' | 'past_due'
          plan_type?: 'free' | 'pro' | 'enterprise'
          plan?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          subscription_status?: 'free' | 'active' | 'canceled' | 'past_due'
          plan_type?: 'free' | 'pro' | 'enterprise'
          plan?: 'free' | 'pro' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          google_maps_url: string | null
          logo_url: string | null
          scans_this_month: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          google_maps_url?: string | null
          logo_url?: string | null
          scans_this_month?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          google_maps_url?: string | null
          logo_url?: string | null
          scans_this_month?: number
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          restaurant_id: string
          type: 'scan' | 'positive_redirect' | 'negative_feedback'
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          type: 'scan' | 'positive_redirect' | 'negative_feedback'
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          type?: 'scan' | 'positive_redirect' | 'negative_feedback'
          created_at?: string
        }
      }
      feedback: {
        Row: {
          id: string
          restaurant_id: string
          rating: number
          comment: string | null
          contact_email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          rating: number
          comment?: string | null
          contact_email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          rating?: number
          comment?: string | null
          contact_email?: string | null
          created_at?: string
        }
      }
      staff_members: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          total_scans: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          total_scans?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          total_scans?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

