export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      mosques: {
        Row: {
          id: string
          name: string
          address: string | null
          lat: number | null
          lng: number | null
          description: string | null
          bank_name: string | null
          bank_account: string | null
          bank_holder: string | null
          is_verified: boolean
          tier: string
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          lat?: number | null
          lng?: number | null
          description?: string | null
          bank_name?: string | null
          bank_account?: string | null
          bank_holder?: string | null
          is_verified?: boolean
          tier?: string
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          lat?: number | null
          lng?: number | null
          description?: string | null
          bank_name?: string | null
          bank_account?: string | null
          bank_holder?: string | null
          is_verified?: boolean
          tier?: string
          photo_url?: string | null
        }
        Relationships: []
      }
      mosque_roles: {
        Row: {
          id: string
          mosque_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          mosque_id: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          mosque_id?: string
          user_id?: string
          role?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          id: string
          user_id: string
          mosque_id: string
          notify_kajian: boolean
          notify_event: boolean
          notify_donasi: boolean
          notify_darurat: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mosque_id: string
          notify_kajian?: boolean
          notify_event?: boolean
          notify_donasi?: boolean
          notify_darurat?: boolean
          created_at?: string
        }
        Update: {
          user_id?: string
          mosque_id?: string
          notify_kajian?: boolean
          notify_event?: boolean
          notify_donasi?: boolean
          notify_darurat?: boolean
        }
        Relationships: []
      }
      prayer_schedules: {
        Row: {
          id: string
          mosque_id: string
          date: string
          subuh: string | null
          syuruq: string | null
          dzuhur: string | null
          ashar: string | null
          maghrib: string | null
          isya: string | null
          iqamah_subuh_offset: number
          iqamah_dzuhur_offset: number
          iqamah_ashar_offset: number
          iqamah_maghrib_offset: number
          iqamah_isya_offset: number
        }
        Insert: {
          id?: string
          mosque_id: string
          date: string
          subuh?: string | null
          syuruq?: string | null
          dzuhur?: string | null
          ashar?: string | null
          maghrib?: string | null
          isya?: string | null
          iqamah_subuh_offset?: number
          iqamah_dzuhur_offset?: number
          iqamah_ashar_offset?: number
          iqamah_maghrib_offset?: number
          iqamah_isya_offset?: number
        }
        Update: {
          mosque_id?: string
          date?: string
          subuh?: string | null
          syuruq?: string | null
          dzuhur?: string | null
          ashar?: string | null
          maghrib?: string | null
          isya?: string | null
          iqamah_subuh_offset?: number
          iqamah_dzuhur_offset?: number
          iqamah_ashar_offset?: number
          iqamah_maghrib_offset?: number
          iqamah_isya_offset?: number
        }
        Relationships: []
      }
      kajians: {
        Row: {
          id: string
          mosque_id: string
          title: string
          ustadz: string | null
          day_of_week: number | null
          time_start: string | null
          topic: string | null
          is_recurring: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          mosque_id: string
          title: string
          ustadz?: string | null
          day_of_week?: number | null
          time_start?: string | null
          topic?: string | null
          is_recurring?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          mosque_id?: string
          title?: string
          ustadz?: string | null
          day_of_week?: number | null
          time_start?: string | null
          topic?: string | null
          is_recurring?: boolean
          is_active?: boolean
        }
        Relationships: []
      }
      kas_transactions: {
        Row: {
          id: string
          mosque_id: string
          type: string
          amount: number
          description: string
          receipt_url: string | null
          status: string
          created_by: string | null
          approved_by: string | null
          approved_at: string | null
          rejection_reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          mosque_id: string
          type: string
          amount: number
          description: string
          receipt_url?: string | null
          status?: string
          created_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
          created_at?: string
        }
        Update: {
          mosque_id?: string
          type?: string
          amount?: number
          description?: string
          receipt_url?: string | null
          status?: string
          created_by?: string | null
          approved_by?: string | null
          approved_at?: string | null
          rejection_reason?: string | null
        }
        Relationships: []
      }
      infaq_codes: {
        Row: {
          id: string
          mosque_id: string
          user_id: string | null
          nominal: number
          unique_code: number
          total_transfer: number
          campaign_id: string | null
          status: string
          verified_by: string | null
          verified_at: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          mosque_id: string
          user_id?: string | null
          nominal: number
          unique_code: number
          total_transfer: number
          campaign_id?: string | null
          status?: string
          verified_by?: string | null
          verified_at?: string | null
          expires_at?: string
          created_at?: string
        }
        Update: {
          mosque_id?: string
          user_id?: string | null
          nominal?: number
          unique_code?: number
          total_transfer?: number
          campaign_id?: string | null
          status?: string
          verified_by?: string | null
          verified_at?: string | null
          expires_at?: string
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          id: string
          mosque_id: string
          title: string
          description: string | null
          target_amount: number | null
          raised_amount: number
          photo_url: string | null
          deadline: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          mosque_id: string
          title: string
          description?: string | null
          target_amount?: number | null
          raised_amount?: number
          photo_url?: string | null
          deadline?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          mosque_id?: string
          title?: string
          description?: string | null
          target_amount?: number | null
          raised_amount?: number
          photo_url?: string | null
          deadline?: string | null
          status?: string
        }
        Relationships: []
      }
      campaign_updates: {
        Row: {
          id: string
          campaign_id: string
          content: string | null
          photo_url: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          content?: string | null
          photo_url?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          campaign_id?: string
          content?: string | null
          photo_url?: string | null
          created_by?: string | null
        }
        Relationships: []
      }
      marketplace_products: {
        Row: {
          id: string
          mosque_id: string
          seller_user_id: string | null
          name: string
          description: string | null
          price: number | null
          photo_url: string | null
          wa_number: string | null
          status: string
          approved_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          mosque_id: string
          seller_user_id?: string | null
          name: string
          description?: string | null
          price?: number | null
          photo_url?: string | null
          wa_number?: string | null
          status?: string
          approved_by?: string | null
          created_at?: string
        }
        Update: {
          mosque_id?: string
          seller_user_id?: string | null
          name?: string
          description?: string | null
          price?: number | null
          photo_url?: string | null
          wa_number?: string | null
          status?: string
          approved_by?: string | null
        }
        Relationships: []
      }
      contact_hashes: {
        Row: {
          id: string
          user_id: string
          phone_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          phone_hash: string
          created_at?: string
        }
        Update: {
          user_id?: string
          phone_hash?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          id: string
          mosque_id: string
          content: string
          category: string
          is_active: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          mosque_id: string
          content: string
          category?: string
          is_active?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          mosque_id?: string
          content?: string
          category?: string
          is_active?: boolean
          created_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience types
export type Mosque = Database['public']['Tables']['mosques']['Row']
export type MosqueRole = Database['public']['Tables']['mosque_roles']['Row']
export type Follow = Database['public']['Tables']['follows']['Row']
export type PrayerSchedule = Database['public']['Tables']['prayer_schedules']['Row']
export type Kajian = Database['public']['Tables']['kajians']['Row']
export type KasTransaction = Database['public']['Tables']['kas_transactions']['Row']
export type InfaqCode = Database['public']['Tables']['infaq_codes']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
